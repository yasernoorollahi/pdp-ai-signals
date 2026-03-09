import { jsx as _jsx } from "react/jsx-runtime";
import { motion } from 'framer-motion';
const blobs = [
    { className: 'left-[-12rem] top-[-10rem] h-[26rem] w-[26rem] bg-fuchsia-500/30' },
    { className: 'right-[-14rem] top-[10%] h-[24rem] w-[24rem] bg-violet-500/25' },
    { className: 'bottom-[-12rem] left-[30%] h-[28rem] w-[28rem] bg-indigo-500/25' }
];
export function GradientBackground() {
    return (_jsx("div", { className: "pointer-events-none fixed inset-0 overflow-hidden", children: blobs.map((blob) => (_jsx(motion.div, { className: `absolute rounded-full blur-3xl ${blob.className}`, animate: {
                x: [0, 18, -12, 0],
                y: [0, -14, 10, 0]
            }, transition: {
                duration: 18,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut'
            } }, blob.className))) }));
}
