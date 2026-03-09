import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
export function AnimatedLoader({ label }) {
    return (_jsxs("div", { className: "flex items-center gap-3 text-sm text-violet-100", children: [_jsx(motion.span, { className: "inline-block h-4 w-4 rounded-full border-2 border-violet-300 border-t-transparent", animate: { rotate: 360 }, transition: { duration: 0.9, repeat: Number.POSITIVE_INFINITY, ease: 'linear' } }), _jsx(motion.span, { animate: { opacity: [0.5, 1, 0.5] }, transition: { duration: 1.3, repeat: Number.POSITIVE_INFINITY }, children: label })] }));
}
