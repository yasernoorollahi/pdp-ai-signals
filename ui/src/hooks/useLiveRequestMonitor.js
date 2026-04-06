import { useEffect, useMemo, useState } from 'react';
const EVENT_LIMIT = 160;
const JOB_ROW_LIMIT = 12;
const PIPELINE_ORDER = [
    { key: 'Facts', label: 'Facts' },
    { key: 'Intent', label: 'Intent' },
    { key: 'Tone', label: 'Tone' },
    { key: 'Cognitive', label: 'Cognitive' },
    { key: 'Context', label: 'Context' },
    { key: 'Topics', label: 'Topics' }
];
export function useLiveRequestMonitor() {
    const [events, setEvents] = useState([]);
    const [connectionState, setConnectionState] = useState('connecting');
    useEffect(() => {
        const source = new EventSource('/monitor/stream');
        const handleSnapshot = (event) => {
            const payload = safeParse(event.data);
            if (!payload) {
                return;
            }
            setEvents(payload.slice(-EVENT_LIMIT));
            setConnectionState('connected');
        };
        const handleRequest = (event) => {
            const payload = safeParse(event.data);
            if (!payload) {
                return;
            }
            setEvents((current) => [...current, payload].slice(-EVENT_LIMIT));
            setConnectionState('connected');
        };
        source.addEventListener('snapshot', handleSnapshot);
        source.addEventListener('request', handleRequest);
        source.onopen = () => setConnectionState('connected');
        source.onerror = () => setConnectionState('disconnected');
        return () => {
            source.removeEventListener('snapshot', handleSnapshot);
            source.removeEventListener('request', handleRequest);
            source.onopen = null;
            source.close();
        };
    }, []);
    const timelines = useMemo(() => {
        const grouped = new Map();
        for (const event of events) {
            const existing = grouped.get(event.requestId) ?? {
                requestId: event.requestId,
                ...(event.pipelineRunId ? { pipelineRunId: event.pipelineRunId } : {}),
                routeLabel: event.routeLabel,
                method: event.method,
                url: event.url,
                phase: 'idle',
                startedAt: event.startedAt ?? event.timestamp,
                updatedAt: event.timestamp,
                stages: []
            };
            existing.routeLabel = event.routeLabel;
            existing.method = event.method;
            existing.url = event.url;
            existing.updatedAt = event.timestamp;
            if (event.pipelineRunId) {
                existing.pipelineRunId = event.pipelineRunId;
            }
            if (event.provider) {
                existing.provider = event.provider;
            }
            if (event.model) {
                existing.model = event.model;
            }
            existing.startedAt = event.startedAt ?? existing.startedAt;
            if (event.kind === 'request') {
                existing.phase = event.phase ?? existing.phase;
                if (typeof event.statusCode === 'number') {
                    existing.statusCode = event.statusCode;
                }
                if (typeof event.durationMs === 'number') {
                    existing.durationMs = event.durationMs;
                }
                if (event.error) {
                    existing.error = event.error;
                }
                upsertStage(existing.stages, {
                    key: 'request-received',
                    label: 'HTTP Received',
                    order: -1,
                    status: event.phase === 'started' ? 'completed' : 'completed',
                    timestamp: event.startedAt ?? event.timestamp
                });
                if (event.phase === 'completed' || event.phase === 'failed') {
                    upsertStage(existing.stages, {
                        key: 'response-sent',
                        label: event.phase === 'failed' ? 'Response Failed' : 'Response Sent',
                        order: 999,
                        status: event.phase,
                        timestamp: event.timestamp,
                        ...(typeof event.durationMs === 'number' ? { durationMs: event.durationMs } : {}),
                        ...(event.error ? { error: event.error } : {})
                    });
                }
            }
            if (event.kind === 'stage' && event.stageKey && event.stageLabel) {
                upsertStage(existing.stages, {
                    key: event.stageKey,
                    label: event.stageLabel,
                    order: event.order ?? existing.stages.length + 1,
                    status: toTimelineStatus(event.stageStatus),
                    timestamp: event.timestamp,
                    ...(typeof event.durationMs === 'number' ? { durationMs: event.durationMs } : {}),
                    ...(event.meta ? { meta: event.meta } : {}),
                    ...(event.error ? { error: event.error } : {})
                });
            }
            grouped.set(event.requestId, existing);
        }
        return [...grouped.values()]
            .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
            .map((timeline) => ({
            ...timeline,
            stages: [...timeline.stages].sort((left, right) => left.order - right.order)
        }));
    }, [events]);
    const pipelineStages = useMemo(() => {
        const byRoute = new Map();
        for (const timeline of timelines) {
            if (!PIPELINE_ORDER.some((item) => item.label === timeline.routeLabel)) {
                continue;
            }
            const current = byRoute.get(timeline.routeLabel);
            if (!current || timeline.updatedAt > (current.updatedAt ?? '')) {
                byRoute.set(timeline.routeLabel, {
                    key: timeline.routeLabel.toLowerCase(),
                    label: timeline.routeLabel,
                    status: timeline.phase,
                    ...(timeline.updatedAt ? { updatedAt: timeline.updatedAt } : {}),
                    ...(typeof timeline.durationMs === 'number' ? { durationMs: timeline.durationMs } : {})
                });
            }
        }
        return PIPELINE_ORDER.map((item) => {
            const existing = byRoute.get(item.label);
            return (existing ?? {
                key: item.key.toLowerCase(),
                label: item.label,
                status: 'idle'
            });
        });
    }, [timelines]);
    const jobRows = useMemo(() => {
        const grouped = new Map();
        for (const timeline of timelines) {
            const groupingKey = timeline.pipelineRunId ?? timeline.requestId;
            const existing = grouped.get(groupingKey);
            if (!existing) {
                grouped.set(groupingKey, {
                    id: groupingKey,
                    ...(timeline.pipelineRunId ? { pipelineRunId: timeline.pipelineRunId } : {}),
                    requestId: timeline.requestId,
                    label: timeline.pipelineRunId ? timeline.pipelineRunId : `${timeline.routeLabel} API`,
                    sourceLabel: timeline.pipelineRunId ? 'ui job' : 'external api',
                    ...(timeline.provider ? { provider: timeline.provider } : {}),
                    ...(timeline.model ? { model: timeline.model } : {}),
                    phase: timeline.phase,
                    createdAt: timeline.startedAt,
                    updatedAt: timeline.updatedAt,
                    ...(typeof timeline.durationMs === 'number' ? { durationMs: timeline.durationMs } : {}),
                    stages: createJobStages([timeline])
                });
                continue;
            }
            existing.updatedAt = maxIso(existing.updatedAt, timeline.updatedAt);
            existing.phase = mergePhase(existing.phase, timeline.phase);
            existing.createdAt = minIso(existing.createdAt, timeline.startedAt);
            if (timeline.provider) {
                existing.provider = timeline.provider;
            }
            if (timeline.model) {
                existing.model = timeline.model;
            }
            existing.stages = createJobStages([...timelines.filter((item) => (item.pipelineRunId ?? item.requestId) === groupingKey)]);
        }
        return [...grouped.values()]
            .map((row) => ({
            ...row,
            durationMs: Math.max(0, new Date(row.updatedAt).getTime() - new Date(row.createdAt).getTime())
        }))
            .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
            .slice(0, JOB_ROW_LIMIT);
    }, [timelines]);
    return {
        timelines,
        pipelineStages,
        jobRows,
        connectionState
    };
}
function upsertStage(stages, incoming) {
    const index = stages.findIndex((stage) => stage.key === incoming.key);
    if (index === -1) {
        stages.push(incoming);
        return;
    }
    stages[index] = {
        ...stages[index],
        ...incoming
    };
}
function toTimelineStatus(status) {
    if (!status) {
        return 'idle';
    }
    if (status === 'started') {
        return 'started';
    }
    return status;
}
function safeParse(value) {
    try {
        return JSON.parse(value);
    }
    catch {
        return null;
    }
}
function createJobStages(timelines) {
    const standardOrder = [
        { key: 'facts', label: 'Facts' },
        { key: 'intent', label: 'Intent' },
        { key: 'tone', label: 'Tone' },
        { key: 'cognitive', label: 'Cognitive' },
        { key: 'context', label: 'Context' },
        { key: 'topics', label: 'Topics' }
    ];
    const byLabel = new Map();
    for (const timeline of timelines) {
        byLabel.set(timeline.routeLabel, {
            key: timeline.routeLabel.toLowerCase(),
            label: timeline.routeLabel,
            status: timeline.phase,
            ...(timeline.updatedAt ? { updatedAt: timeline.updatedAt } : {}),
            ...(typeof timeline.durationMs === 'number' ? { durationMs: timeline.durationMs } : {})
        });
    }
    const known = standardOrder
        .filter((item) => byLabel.has(item.label) || timelines.some((timeline) => standardOrder.some((entry) => entry.label === timeline.routeLabel)))
        .map((item) => byLabel.get(item.label) ?? { key: item.key, label: item.label, status: 'idle' });
    if (known.length > 0) {
        return known;
    }
    return timelines.map((timeline) => ({
        key: timeline.routeLabel.toLowerCase(),
        label: timeline.routeLabel,
        status: timeline.phase,
        ...(timeline.updatedAt ? { updatedAt: timeline.updatedAt } : {}),
        ...(typeof timeline.durationMs === 'number' ? { durationMs: timeline.durationMs } : {})
    }));
}
function mergePhase(current, incoming) {
    if (current === 'failed' || incoming === 'failed') {
        return 'failed';
    }
    if (current === 'started' || incoming === 'started') {
        return 'started';
    }
    if (current === 'completed' || incoming === 'completed') {
        return 'completed';
    }
    return 'idle';
}
function minIso(left, right) {
    return left <= right ? left : right;
}
function maxIso(left, right) {
    return left >= right ? left : right;
}
