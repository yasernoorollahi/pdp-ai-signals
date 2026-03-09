import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { motion } from 'framer-motion';
export function SignalPanel({ title, payload, provider }) {
    const confidence = payload ? Math.round(payload.meta.confidence * 100) : 0;
    const copyJson = async () => {
        if (!payload)
            return;
        await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    };
    return (_jsxs(motion.article, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, className: "rounded-2xl border border-violet-300/20 bg-black/20 p-4 shadow-glow", children: [_jsxs("header", { className: "mb-4 flex flex-wrap items-center gap-2 text-xs", children: [_jsx("span", { className: "rounded-full border border-violet-300/30 bg-violet-600/20 px-2 py-1 font-semibold text-violet-100", children: title }), payload ? (_jsxs(_Fragment, { children: [_jsxs("span", { className: "rounded-full border border-violet-300/30 bg-violet-500/15 px-2 py-1 text-violet-100", children: ["provider: ", provider] }), _jsxs("span", { className: "rounded-full border border-violet-300/30 bg-violet-500/15 px-2 py-1 text-violet-100", children: ["model: ", payload.meta.model] }), _jsx("button", { type: "button", onClick: () => {
                                    void copyJson();
                                }, className: "ml-auto rounded-lg border border-violet-200/30 px-2 py-1 text-violet-100 transition hover:bg-violet-500/20", children: "Copy JSON" })] })) : null] }), payload ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "mb-1 flex items-center justify-between text-xs text-violet-100/90", children: [_jsx("span", { children: "Confidence" }), _jsxs("span", { children: [confidence, "%"] })] }), _jsx("div", { className: "h-2 rounded-full bg-violet-950/70", children: _jsx(motion.div, { className: "h-full rounded-full bg-gradient-to-r from-fuchsia-300 via-violet-300 to-indigo-300", initial: { width: 0 }, animate: { width: `${confidence}%` }, transition: { duration: 0.6, ease: 'easeOut' } }) })] }), _jsx("pre", { className: "max-h-80 overflow-auto rounded-xl border border-violet-200/20 bg-[#120a24]/80 p-3 font-mono text-xs leading-relaxed text-violet-100", children: JSON.stringify(payload, null, 2) })] })) : (_jsx("p", { className: "text-sm text-violet-100/65", children: "Waiting for result..." }))] }));
}
