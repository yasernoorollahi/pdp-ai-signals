import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GradientBackground } from '../components/GradientBackground';
import { GlassCard } from '../components/GlassCard';
import { LiveRequestTimelineBoard } from '../components/LiveRequestTimelineBoard';
import { ProviderModelSelector } from '../components/ProviderModelSelector';
import { SignalPanel } from '../components/SignalPanel';
import { StepProgress } from '../components/StepProgress';
import { useLiveRequestMonitor } from '../hooks/useLiveRequestMonitor';
import { useSignalOrchestrator } from '../hooks/useSignalOrchestrator';
export function Dashboard() {
    const [text, setText] = useState('');
    const { jobRows } = useLiveRequestMonitor();
    const { provider, setProvider, model, setModel, currentModels, modelsLoading, modelsError, modelsInfo, reloadModels, runs, selectedRun, setSelectedRunId, processingCount, processing, steps, activeStep, processingTimeMs, globalError, combinedData, canSubmit, run } = useSignalOrchestrator();
    const stepRefs = useRef({});
    useEffect(() => {
        if (!activeStep)
            return;
        const target = stepRefs.current[activeStep];
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [activeStep]);
    const completedCount = useMemo(() => steps.filter((step) => step.status === 'completed').length, [steps]);
    return (_jsxs("div", { className: "relative min-h-screen pb-16", children: [_jsx(GradientBackground, {}), _jsxs("div", { className: "relative z-10 mx-auto w-full max-w-6xl px-4 pt-10 md:px-8", children: [_jsxs(motion.header, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "mb-6", children: [_jsx("h1", { className: "font-display text-3xl font-semibold tracking-tight text-violet-50 md:text-4xl", children: "PDP AI Signal Orchestration" }), _jsx("p", { className: "mt-2 text-violet-100/80", children: "Sequential extraction pipeline with real-time progress and model-level visibility." })] }), _jsx(LiveRequestTimelineBoard, { rows: jobRows, ...(selectedRun?.id ? { selectedRowId: selectedRun.id } : {}), onSelectRow: (row) => {
                            if (row.pipelineRunId) {
                                setSelectedRunId(row.pipelineRunId);
                            }
                        } }), _jsxs("div", { className: "grid gap-6 xl:grid-cols-[360px_1fr]", children: [_jsx(GlassCard, { children: _jsxs("div", { className: "space-y-4", children: [_jsx(ProviderModelSelector, { provider: provider, onProviderChange: setProvider, model: model, models: currentModels, modelsLoading: modelsLoading, modelsError: modelsError, modelsInfo: modelsInfo, onModelChange: setModel, onReload: () => {
                                                void reloadModels();
                                            } }), _jsx("label", { className: "block text-sm font-medium text-violet-50", children: "Input Text" }), _jsx("textarea", { value: text, onChange: (event) => setText(event.target.value), placeholder: "Paste user text here...", className: "min-h-48 w-full rounded-xl border border-violet-200/25 bg-black/25 p-3 text-sm text-violet-50 outline-none transition focus:border-violet-200/60" }), _jsxs("div", { className: "flex items-center justify-between text-xs text-violet-100/80", children: [_jsxs("span", { children: ["Completed: ", completedCount, "/6"] }), processingTimeMs ? _jsxs("span", { children: ["Total: ", (processingTimeMs / 1000).toFixed(2), "s"] }) : null] }), _jsx("button", { type: "button", disabled: !canSubmit || text.trim().length === 0, onClick: () => {
                                                void run(text);
                                            }, className: "w-full rounded-xl border border-fuchsia-200/45 bg-gradient-to-r from-fuchsia-600/70 to-violet-600/70 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45", children: processing ? `Run Another Pipeline (${processingCount} active)` : 'Run Pipeline' }), globalError ? _jsx("p", { className: "text-xs text-rose-200", children: globalError }) : null] }) }), _jsxs("div", { className: "space-y-6", children: [_jsxs(GlassCard, { children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsx("h2", { className: "font-display text-xl font-semibold text-violet-50", children: "Pipeline Jobs" }), _jsxs("span", { className: "text-xs text-violet-100/70", children: [runs.length, " total runs"] })] }), _jsx("div", { className: "mt-4 flex flex-wrap gap-2", children: runs.length === 0 ? (_jsx("p", { className: "text-sm text-violet-100/65", children: "Run a pipeline to see jobs here." })) : (runs.map((runItem) => (_jsxs("button", { type: "button", onClick: () => setSelectedRunId(runItem.id), className: `rounded-xl border px-3 py-2 text-left transition ${selectedRun?.id === runItem.id
                                                        ? 'border-fuchsia-200/45 bg-fuchsia-500/15 text-violet-50'
                                                        : 'border-violet-200/15 bg-black/20 text-violet-100/75 hover:border-violet-200/35'}`, children: [_jsx("p", { className: "font-mono text-[11px]", children: runItem.id }), _jsx("p", { className: "mt-1 text-xs", children: runItem.processing ? 'running' : runItem.globalError ? 'failed' : 'done' })] }, runItem.id)))) })] }), _jsxs(GlassCard, { children: [_jsxs("div", { className: "mb-4 flex flex-wrap items-center justify-between gap-3", children: [_jsx("h2", { className: "font-display text-xl font-semibold text-violet-50", children: "Progress" }), selectedRun ? (_jsx("span", { className: "font-mono text-xs text-violet-100/70", children: selectedRun.id })) : null] }), _jsx(StepProgress, { steps: steps })] }), _jsxs(GlassCard, { children: [_jsxs("div", { className: "mb-4 flex flex-wrap items-center justify-between gap-3", children: [_jsx("h2", { className: "font-display text-xl font-semibold text-violet-50", children: "Combined Data" }), selectedRun ? (_jsx("span", { className: "text-xs text-violet-100/70", children: selectedRun.processing ? 'Running' : selectedRun.globalError ? 'Failed' : 'Completed' })) : null] }), _jsx("pre", { className: "max-h-80 overflow-auto rounded-xl border border-violet-200/20 bg-[#120a24]/80 p-3 font-mono text-xs leading-relaxed text-violet-100", children: JSON.stringify(combinedData, null, 2) })] }), _jsx(AnimatePresence, { children: steps
                                            .filter((step) => step.result)
                                            .map((step) => (_jsx("section", { ref: (element) => {
                                                stepRefs.current[step.key] = element;
                                            }, children: _jsx(SignalPanel, { title: step.label, payload: step.result, provider: selectedRun?.provider ?? provider }) }, step.key))) })] })] })] })] }));
}
