import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GradientBackground } from '../components/GradientBackground';
import { GlassCard } from '../components/GlassCard';
import { ProviderModelSelector } from '../components/ProviderModelSelector';
import { SignalPanel } from '../components/SignalPanel';
import { StepProgress } from '../components/StepProgress';
import { useSignalOrchestrator } from '../hooks/useSignalOrchestrator';
export function Dashboard() {
    const [text, setText] = useState('');
    const { provider, setProvider, model, setModel, currentModels, modelsLoading, modelsError, modelsInfo, reloadModels, processing, steps, activeStep, processingTimeMs, globalError, combinedData, canSubmit, run } = useSignalOrchestrator();
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
    return (_jsxs("div", { className: "relative min-h-screen pb-16", children: [_jsx(GradientBackground, {}), _jsxs("div", { className: "relative z-10 mx-auto w-full max-w-6xl px-4 pt-10 md:px-8", children: [_jsxs(motion.header, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "mb-6", children: [_jsx("h1", { className: "font-display text-3xl font-semibold tracking-tight text-violet-50 md:text-4xl", children: "PDP AI Signal Orchestration" }), _jsx("p", { className: "mt-2 text-violet-100/80", children: "Sequential extraction pipeline with real-time progress and model-level visibility." })] }), _jsxs("div", { className: "grid gap-6 xl:grid-cols-[360px_1fr]", children: [_jsx(GlassCard, { children: _jsxs("div", { className: "space-y-4", children: [_jsx(ProviderModelSelector, { provider: provider, onProviderChange: setProvider, model: model, models: currentModels, modelsLoading: modelsLoading, modelsError: modelsError, modelsInfo: modelsInfo, onModelChange: setModel, onReload: () => {
                                                void reloadModels();
                                            } }), _jsx("label", { className: "block text-sm font-medium text-violet-50", children: "Input Text" }), _jsx("textarea", { value: text, onChange: (event) => setText(event.target.value), disabled: processing, placeholder: "Paste user text here...", className: "min-h-48 w-full rounded-xl border border-violet-200/25 bg-black/25 p-3 text-sm text-violet-50 outline-none transition focus:border-violet-200/60 disabled:opacity-60" }), _jsxs("div", { className: "flex items-center justify-between text-xs text-violet-100/80", children: [_jsxs("span", { children: ["Completed: ", completedCount, "/6"] }), processingTimeMs ? _jsxs("span", { children: ["Total: ", (processingTimeMs / 1000).toFixed(2), "s"] }) : null] }), _jsx("button", { type: "button", disabled: !canSubmit || text.trim().length === 0, onClick: () => {
                                                void run(text);
                                            }, className: "w-full rounded-xl border border-fuchsia-200/45 bg-gradient-to-r from-fuchsia-600/70 to-violet-600/70 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45", children: processing ? 'Processing...' : 'Run Pipeline' }), globalError ? _jsx("p", { className: "text-xs text-rose-200", children: globalError }) : null] }) }), _jsxs("div", { className: "space-y-6", children: [_jsxs(GlassCard, { children: [_jsx("h2", { className: "mb-4 font-display text-xl font-semibold text-violet-50", children: "Progress" }), _jsx(StepProgress, { steps: steps })] }), _jsxs(GlassCard, { children: [_jsx("h2", { className: "mb-4 font-display text-xl font-semibold text-violet-50", children: "Combined Data" }), _jsx("pre", { className: "max-h-80 overflow-auto rounded-xl border border-violet-200/20 bg-[#120a24]/80 p-3 font-mono text-xs leading-relaxed text-violet-100", children: JSON.stringify(combinedData, null, 2) })] }), _jsx(AnimatePresence, { children: steps
                                            .filter((step) => step.result)
                                            .map((step) => (_jsx("section", { ref: (element) => {
                                                stepRefs.current[step.key] = element;
                                            }, children: _jsx(SignalPanel, { title: step.label, payload: step.result, provider: provider }) }, step.key))) })] })] })] })] }));
}
