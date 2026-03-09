import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AnimatePresence, motion } from 'framer-motion';
import { AnimatedLoader } from './AnimatedLoader';
function StatusIcon({ status }) {
    if (status === 'completed') {
        return _jsx("span", { className: "text-emerald-300", children: "\u2713" });
    }
    if (status === 'error') {
        return _jsx("span", { className: "text-rose-300", children: "!" });
    }
    return _jsx("span", { className: "text-violet-200", children: "\u2022" });
}
export function StepProgress({ steps }) {
    return (_jsx("div", { className: "space-y-3", children: steps.map((step, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.05 }, className: "rounded-xl border border-violet-300/20 bg-violet-900/25 px-4 py-3", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(StatusIcon, { status: step.status }), _jsx("span", { className: "font-medium text-violet-50", children: step.label }), _jsx("span", { className: "font-mono text-xs text-violet-200/80", children: step.endpoint })] }), step.durationMs ? (_jsxs("span", { className: "font-mono text-xs text-violet-200/70", children: [step.durationMs.toFixed(0), " ms"] })) : null] }), _jsx(AnimatePresence, { children: step.status === 'running' ? (_jsx(motion.div, { initial: { opacity: 0, y: -6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 }, className: "mt-2", children: _jsx(AnimatedLoader, { label: `Calling ${step.endpoint}...` }) })) : null }), step.error ? _jsx("p", { className: "mt-2 text-xs text-rose-200", children: step.error }) : null] }, step.key))) }));
}
