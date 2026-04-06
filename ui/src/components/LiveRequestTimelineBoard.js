import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
export function LiveRequestTimelineBoard({ rows, selectedRowId, onSelectRow }) {
    return (_jsxs("section", { className: "mb-6 rounded-[28px] border border-violet-200/15 bg-black/20 p-5 shadow-panel backdrop-blur-xl md:p-6", children: [_jsxs("div", { className: "mb-5 flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h2", { className: "font-display text-2xl font-semibold text-violet-50", children: "Live Streaming Pipeline" }), _jsx("p", { className: "mt-1 text-sm text-violet-100/75", children: "Each pipeline job gets its own row and shows which stage it is currently running." })] }), _jsxs("div", { className: "inline-flex items-center gap-2 rounded-full border border-violet-200/20 bg-white/5 px-3 py-1 text-xs text-violet-100/80", children: [_jsx("span", { className: "h-2.5 w-2.5 rounded-full bg-emerald-400" }), _jsxs("span", { children: [rows.filter((row) => row.phase === 'started').length, " active job(s)"] })] })] }), rows.length === 0 ? (_jsx("div", { className: "rounded-2xl border border-dashed border-violet-200/20 bg-violet-950/20 px-4 py-10 text-center text-sm text-violet-100/65", children: "Run a pipeline to see live job rows here." })) : (_jsx("div", { className: "space-y-3", children: rows.map((row, runIndex) => (_jsx(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: runIndex * 0.03 }, className: `overflow-hidden rounded-2xl border bg-[linear-gradient(135deg,rgba(31,17,67,0.78),rgba(12,8,24,0.9))] p-3 transition ${selectedRowId === row.id
                        ? 'border-fuchsia-200/45 shadow-[0_0_0_1px_rgba(232,121,249,0.18)]'
                        : 'border-violet-200/15'}`, children: _jsxs("button", { type: "button", onClick: () => onSelectRow?.(row), className: "block w-full text-left", children: [_jsxs("div", { className: "mb-3 flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("span", { className: "font-mono text-xs text-violet-100/80", children: row.label }), _jsx("span", { className: "text-[10px] text-violet-100/55", children: row.sourceLabel }), _jsx("span", { className: requestBadgeClassName(row.phase), children: requestLabel(row.phase) })] }), row.model ? (_jsxs("p", { className: "text-[10px] text-violet-200/60", children: ["model: ", row.model] })) : null] }), _jsxs("div", { className: "text-right text-[11px] text-violet-100/70", children: [_jsx("p", { children: formatClock(row.createdAt) }), _jsx("p", { children: formatDuration(row.durationMs) })] })] }), _jsx("div", { className: "overflow-hidden", children: _jsx("div", { className: "flex flex-wrap items-center gap-2", children: row.stages.map((stage, index) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(StageNode, { stage: stage }), index < row.stages.length - 1 ? _jsx(FlowArrow, { status: stage.status }) : null] }, stage.key))) }) })] }) }, row.id))) }))] }));
}
function StageNode({ stage }) {
    return (_jsxs("div", { className: "w-[118px] rounded-xl border border-violet-200/15 bg-black/25 p-2", children: [_jsxs("div", { className: "mb-1 flex items-center justify-between gap-1.5", children: [_jsx("span", { className: "text-[10px] font-medium leading-4 text-violet-50", children: stage.label }), _jsx("span", { className: stageBadgeClassName(stage.status), children: requestLabel(stage.status) })] }), _jsx("div", { className: "h-1.5 overflow-hidden rounded-full bg-violet-950/80", children: _jsx("div", { className: stageBarClassName(stage.status), style: { width: `${stageProgress(stage.status)}%` } }) }), _jsxs("div", { className: "mt-1 space-y-0.5 text-[9px] leading-4 text-violet-100/70", children: [_jsx("p", { children: stage.updatedAt ? formatClock(stage.updatedAt) : formatDuration(stage.durationMs) }), typeof stage.durationMs === 'number' ? _jsx("p", { children: formatDuration(stage.durationMs) }) : null, stage.error ? _jsx("p", { className: "truncate text-rose-200", children: stage.error }) : null] })] }));
}
function FlowArrow({ status }) {
    return (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { className: `h-px w-2 ${arrowLineClassName(status)}` }), _jsx("span", { className: `text-xs ${arrowTextClassName(status)}`, children: "\u2192" }), _jsx("span", { className: `h-px w-2 ${arrowLineClassName(status)}` })] }));
}
function requestLabel(status) {
    if (status === 'started') {
        return 'running';
    }
    if (status === 'completed') {
        return 'done';
    }
    if (status === 'failed') {
        return 'failed';
    }
    return 'idle';
}
function requestBadgeClassName(status) {
    if (status === 'completed') {
        return 'rounded-full border border-emerald-300/25 bg-emerald-400/10 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.14em] text-emerald-200';
    }
    if (status === 'failed') {
        return 'rounded-full border border-rose-300/25 bg-rose-400/10 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.14em] text-rose-200';
    }
    if (status === 'started') {
        return 'rounded-full border border-amber-300/25 bg-amber-400/10 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.14em] text-amber-100';
    }
    return 'rounded-full border border-violet-200/20 bg-violet-200/10 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.14em] text-violet-100/75';
}
function stageBadgeClassName(status) {
    return requestBadgeClassName(status);
}
function stageBarClassName(status) {
    if (status === 'completed') {
        return 'h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 transition-all duration-500';
    }
    if (status === 'failed') {
        return 'h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-300 transition-all duration-500';
    }
    if (status === 'started') {
        return 'h-full rounded-full bg-gradient-to-r from-amber-300 via-fuchsia-400 to-violet-400 transition-all duration-700';
    }
    return 'h-full rounded-full bg-violet-200/10 transition-all duration-500';
}
function stageProgress(status) {
    if (status === 'completed' || status === 'failed') {
        return 100;
    }
    if (status === 'started') {
        return 58;
    }
    return 0;
}
function arrowLineClassName(status) {
    if (status === 'completed') {
        return 'bg-emerald-300/80';
    }
    if (status === 'failed') {
        return 'bg-rose-300/80';
    }
    if (status === 'started') {
        return 'bg-amber-200/80';
    }
    return 'bg-violet-200/20';
}
function arrowTextClassName(status) {
    if (status === 'completed') {
        return 'text-emerald-200';
    }
    if (status === 'failed') {
        return 'text-rose-200';
    }
    if (status === 'started') {
        return 'text-amber-100';
    }
    return 'text-violet-200/35';
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
