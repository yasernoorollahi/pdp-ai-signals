import { useEffect, useMemo, useState } from 'react';

export type LiveEventKind = 'request' | 'stage';
export type LiveRequestPhase = 'idle' | 'started' | 'completed' | 'failed';
export type LiveStageStatus = 'started' | 'completed' | 'failed';
export type LiveConnectionState = 'connecting' | 'connected' | 'disconnected';

export interface LiveRequestEvent {
  eventId: string;
  kind: LiveEventKind;
  requestId: string;
  pipelineRunId?: string;
  method: string;
  url: string;
  routeLabel: string;
  timestamp: string;
  source: 'api';
  phase?: Exclude<LiveRequestPhase, 'idle'>;
  stageKey?: string;
  stageLabel?: string;
  stageStatus?: LiveStageStatus;
  order?: number;
  statusCode?: number;
  durationMs?: number;
  startedAt?: string;
  provider?: string;
  model?: string;
  meta?: Record<string, unknown>;
  error?: string;
}

export interface RequestTimelineStage {
  key: string;
  label: string;
  order: number;
  status: LiveRequestPhase;
  timestamp?: string;
  durationMs?: number;
  meta?: Record<string, unknown>;
  error?: string;
}

export interface RequestTimeline {
  requestId: string;
  pipelineRunId?: string;
  routeLabel: string;
  method: string;
  url: string;
  provider?: string;
  model?: string;
  phase: LiveRequestPhase;
  startedAt: string;
  updatedAt: string;
  durationMs?: number;
  statusCode?: number;
  error?: string;
  stages: RequestTimelineStage[];
}

export interface PipelineStageSummary {
  key: string;
  label: string;
  status: LiveRequestPhase;
  updatedAt?: string;
  durationMs?: number;
}

export interface LiveJobRow {
  id: string;
  pipelineRunId?: string;
  requestId: string;
  label: string;
  sourceLabel: string;
  provider?: string;
  model?: string;
  phase: LiveRequestPhase;
  createdAt: string;
  updatedAt: string;
  durationMs?: number;
  stages: PipelineStageSummary[];
}

const EVENT_LIMIT = 160;
const JOB_ROW_LIMIT = 12;
const PIPELINE_ORDER: Array<{ key: string; label: string }> = [
  { key: 'Facts', label: 'Facts' },
  { key: 'Intent', label: 'Intent' },
  { key: 'Tone', label: 'Tone' },
  { key: 'Cognitive', label: 'Cognitive' },
  { key: 'Context', label: 'Context' },
  { key: 'Topics', label: 'Topics' }
];

export function useLiveRequestMonitor() {
  const [events, setEvents] = useState<LiveRequestEvent[]>([]);
  const [connectionState, setConnectionState] = useState<LiveConnectionState>('connecting');

  useEffect(() => {
    const source = new EventSource('/monitor/stream');

    const handleSnapshot = (event: MessageEvent<string>) => {
      const payload = safeParse<LiveRequestEvent[]>(event.data);
      if (!payload) {
        return;
      }
      setEvents(payload.slice(-EVENT_LIMIT));
      setConnectionState('connected');
    };

    const handleRequest = (event: MessageEvent<string>) => {
      const payload = safeParse<LiveRequestEvent>(event.data);
      if (!payload) {
        return;
      }
      setEvents((current) => [...current, payload].slice(-EVENT_LIMIT));
      setConnectionState('connected');
    };

    source.addEventListener('snapshot', handleSnapshot as EventListener);
    source.addEventListener('request', handleRequest as EventListener);
    source.onopen = () => setConnectionState('connected');
    source.onerror = () => setConnectionState('disconnected');

    return () => {
      source.removeEventListener('snapshot', handleSnapshot as EventListener);
      source.removeEventListener('request', handleRequest as EventListener);
      source.onopen = null;
      source.close();
    };
  }, []);

  const timelines = useMemo(() => {
    const grouped = new Map<string, RequestTimeline>();

    for (const event of events) {
      const existing: RequestTimeline = grouped.get(event.requestId) ?? {
        requestId: event.requestId,
        ...(event.pipelineRunId ? { pipelineRunId: event.pipelineRunId } : {}),
        routeLabel: event.routeLabel,
        method: event.method,
        url: event.url,
        phase: 'idle' as LiveRequestPhase,
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
    const byRoute = new Map<string, PipelineStageSummary>();

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
      return (
        existing ?? {
          key: item.key.toLowerCase(),
          label: item.label,
          status: 'idle' as LiveRequestPhase
        }
      );
    });
  }, [timelines]);

  const jobRows = useMemo(() => {
    const uiRows = new Map<string, LiveJobRow>();
    const externalTimelines: RequestTimeline[] = [];

    for (const timeline of timelines) {
      if (!timeline.pipelineRunId) {
        externalTimelines.push(timeline);
        continue;
      }

      const groupingKey = timeline.pipelineRunId;
      const existing = uiRows.get(groupingKey);

      if (!existing) {
        uiRows.set(groupingKey, {
          id: groupingKey,
          pipelineRunId: groupingKey,
          requestId: timeline.requestId,
          label: groupingKey,
          sourceLabel: 'ui job',
          ...(timeline.provider ? { provider: timeline.provider } : {}),
          ...(timeline.model ? { model: timeline.model } : {}),
          phase: timeline.phase,
          createdAt: timeline.startedAt,
          updatedAt: timeline.updatedAt,
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
      existing.stages = createJobStages(
        timelines.filter((item) => item.pipelineRunId === groupingKey)
      );
    }

    const externalRows = createExternalJobRows(externalTimelines);

    return [...uiRows.values(), ...externalRows]
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

function upsertStage(stages: RequestTimelineStage[], incoming: RequestTimelineStage) {
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

function toTimelineStatus(status?: LiveStageStatus): LiveRequestPhase {
  if (!status) {
    return 'idle';
  }
  if (status === 'started') {
    return 'started';
  }
  return status;
}

function safeParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function createJobStages(timelines: RequestTimeline[]): PipelineStageSummary[] {
  const standardOrder = [
    { key: 'facts', label: 'Facts' },
    { key: 'intent', label: 'Intent' },
    { key: 'tone', label: 'Tone' },
    { key: 'cognitive', label: 'Cognitive' },
    { key: 'context', label: 'Context' },
    { key: 'topics', label: 'Topics' }
  ];

  const byLabel = new Map<string, PipelineStageSummary>();

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
    .map((item) => byLabel.get(item.label) ?? { key: item.key, label: item.label, status: 'idle' as LiveRequestPhase });

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

function mergePhase(current: LiveRequestPhase, incoming: LiveRequestPhase): LiveRequestPhase {
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

function minIso(left: string, right: string): string {
  return left <= right ? left : right;
}

function maxIso(left: string, right: string): string {
  return left >= right ? left : right;
}

function createExternalJobRows(timelines: RequestTimeline[]): LiveJobRow[] {
  const batches = new Map<
    string,
    {
      id: string;
      provider?: string;
      model?: string;
      createdAt: string;
      updatedAt: string;
      timelines: RequestTimeline[];
      minuteLabel: string;
    }
  >();

  for (const timeline of timelines) {
    const minuteBucket = toMinuteBucket(timeline.startedAt);
    const providerKey = timeline.provider ?? 'default';
    const modelKey = timeline.model ?? 'default';
    const batchKey = `${minuteBucket}__${providerKey}__${modelKey}`;
    const existing = batches.get(batchKey);

    if (!existing) {
      batches.set(batchKey, {
        id: `external-${batchKey}`,
        ...(timeline.provider ? { provider: timeline.provider } : {}),
        ...(timeline.model ? { model: timeline.model } : {}),
        createdAt: timeline.startedAt,
        updatedAt: timeline.updatedAt,
        timelines: [timeline],
        minuteLabel: formatMinuteLabel(timeline.startedAt)
      });
      continue;
    }

    existing.createdAt = minIso(existing.createdAt, timeline.startedAt);
    existing.updatedAt = maxIso(existing.updatedAt, timeline.updatedAt);
    const existingIndex = existing.timelines.findIndex((item) => item.routeLabel === timeline.routeLabel);
    if (existingIndex >= 0) {
      const currentTimeline = existing.timelines[existingIndex];
      if (currentTimeline) {
        existing.timelines[existingIndex] = preferNewerTimeline(currentTimeline, timeline);
      }
    } else {
      existing.timelines.push(timeline);
    }
  }

  return [...batches.values()].map((batch) => ({
    id: batch.id,
    requestId: batch.timelines[0]?.requestId ?? batch.id,
    label: `External ${batch.minuteLabel}`,
    sourceLabel: 'external api',
    ...(batch.provider ? { provider: batch.provider } : {}),
    ...(batch.model ? { model: batch.model } : {}),
    phase: batch.timelines.reduce<LiveRequestPhase>((current, timeline) => mergePhase(current, timeline.phase), 'idle'),
    createdAt: batch.createdAt,
    updatedAt: batch.updatedAt,
    stages: createJobStages(batch.timelines)
  }));
}

function preferNewerTimeline(left: RequestTimeline, right: RequestTimeline): RequestTimeline {
  return right.updatedAt >= left.updatedAt ? right : left;
}

function toMinuteBucket(value: string): string {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatMinuteLabel(value: string): string {
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}
