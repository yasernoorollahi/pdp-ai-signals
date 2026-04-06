import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
export function LiveRequestConsole({ connectionState, routeStates, events, now }) {
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-violet-50", children: "Live Backend Monitor" }), _jsx("p", { className: "text-xs text-violet-100/70", children: "Every backend request appears here, including calls triggered outside the UI." })] }), _jsxs("div", { className: "inline-flex items-center gap-2 rounded-full border border-violet-200/20 bg-black/20 px-3 py-1 text-xs text-violet-100/80", children: [_jsx("span", { className: connectionDotClassName(connectionState) }), _jsx("span", { children: connectionLabel(connectionState) })] })] }), _jsx("div", { className: "grid gap-3 md:grid-cols-2 xl:grid-cols-3", children: routeStates.map((state, index) => {
                    const liveDurationMs = state.phase === 'started' && state.startedAt
                        ? Math.max(0, now - new Date(state.startedAt).getTime())
                        : state.durationMs;
                    return (_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.03 }, className: "rounded-xl border border-violet-200/15 bg-black/20 p-3", children: [_jsxs("div", { className: "mb-2 flex items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-violet-50", children: state.routeLabel }), _jsx("p", { className: "font-mono text-[11px] text-violet-200/65", children: state.url })] }), _jsx("span", { className: statusBadgeClassName(state.phase), children: statusLabel(state.phase) })] }), _jsx("div", { className: "h-2 overflow-hidden rounded-full bg-violet-950/70", children: _jsx("div", { className: progressBarClassName(state.phase), style: { width: `${state.progress}%` } }) }), _jsxs("div", { className: "mt-2 flex items-center justify-between text-[11px] text-violet-100/75", children: [_jsx("span", { children: formatDuration(liveDurationMs) }), _jsx("span", { children: state.updatedAt ? formatClock(state.updatedAt) : 'waiting' })] }), state.statusCode ? (_jsxs("p", { className: "mt-2 font-mono text-[11px] text-violet-200/70", children: ["HTTP ", state.statusCode] })) : null, state.error ? _jsx("p", { className: "mt-2 text-[11px] text-rose-200", children: state.error }) : null] }, state.routeLabel));
                }) }), _jsxs("div", { className: "rounded-xl border border-violet-200/15 bg-[#120a24]/85", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-violet-200/10 px-4 py-3", children: [_jsx("p", { className: "text-sm font-medium text-violet-50", children: "Request Console" }), _jsxs("p", { className: "text-xs text-violet-100/70", children: [events.length, " recent events"] })] }), _jsx("div", { className: "max-h-96 overflow-auto px-4 py-3 font-mono text-xs leading-6 text-violet-100", children: events.length === 0 ? (_jsx("p", { className: "text-violet-200/60", children: "Waiting for backend activity..." })) : (events.map((event) => (_jsxs("div", { className: "border-b border-violet-200/8 py-2 last:border-b-0", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-1", children: [_jsx("span", { className: "text-violet-200/65", children: formatClock(event.timestamp) }), _jsx("span", { className: statusTextClassName(event.phase), children: statusLabel(event.phase) }), _jsx("span", { className: "text-violet-50", children: event.routeLabel }), _jsx("span", { className: "text-violet-200/75", children: event.method }), _jsx("span", { className: "text-violet-200/65", children: event.url })] }), _jsxs("div", { className: "mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-violet-200/65", children: [_jsxs("span", { children: ["request: ", event.requestId] }), event.statusCode ? _jsxs("span", { children: ["status: ", event.statusCode] }) : null, typeof event.durationMs === 'number' ? _jsxs("span", { children: ["duration: ", formatDuration(event.durationMs)] }) : null] }), event.error ? _jsx("p", { className: "mt-1 text-[11px] text-rose-200", children: event.error }) : null] }, event.eventId)))) })] })] }));
}
function connectionLabel(state) {
    if (state === 'connected') {
        return 'stream connected';
    }
    if (state === 'connecting') {
        return 'connecting';
    }
    return 'reconnecting';
}
function connectionDotClassName(state) {
    if (state === 'connected') {
        return 'h-2.5 w-2.5 rounded-full bg-emerald-400';
    }
    if (state === 'connecting') {
        return 'h-2.5 w-2.5 rounded-full bg-amber-300';
    }
    return 'h-2.5 w-2.5 rounded-full bg-rose-300';
}
function statusLabel(phase) {
    if (phase === 'idle') {
        return 'idle';
    }
    if (phase === 'started') {
        return 'running';
    }
    if (phase === 'completed') {
        return 'done';
    }
    return 'failed';
}
function statusBadgeClassName(phase) {
    if (phase === 'idle') {
        return 'rounded-full border border-violet-200/20 bg-violet-200/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-violet-100/75';
    }
    if (phase === 'completed') {
        return 'rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-200';
    }
    if (phase === 'failed') {
        return 'rounded-full border border-rose-300/25 bg-rose-400/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-rose-200';
    }
    return 'rounded-full border border-amber-300/25 bg-amber-400/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-amber-100';
}
function progressBarClassName(phase) {
    if (phase === 'idle') {
        return 'h-full rounded-full bg-violet-200/10 transition-all duration-500';
    }
    if (phase === 'completed') {
        return 'h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 transition-all duration-500';
    }
    if (phase === 'failed') {
        return 'h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-300 transition-all duration-500';
    }
    return 'h-full rounded-full bg-gradient-to-r from-amber-300 via-fuchsia-400 to-violet-400 transition-all duration-700';
}
function statusTextClassName(phase) {
    if (phase === 'idle') {
        return 'text-violet-200/70';
    }
    if (phase === 'completed') {
        return 'text-emerald-200';
    }
    if (phase === 'failed') {
        return 'text-rose-200';
    }
    return 'text-amber-100';
}
function formatClock(value) {
    return new Date(value).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}
function formatDuration(durationMs) {
    if (typeof durationMs !== 'number') {
        return '--';
    }
    if (durationMs < 1000) {
        return `${durationMs.toFixed(0)} ms`;
    }
    return `${(durationMs / 1000).toFixed(2)} s`;
}
