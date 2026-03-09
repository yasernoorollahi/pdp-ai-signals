import { motion } from 'framer-motion';

export function AnimatedLoader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-violet-100">
      <motion.span
        className="inline-block h-4 w-4 rounded-full border-2 border-violet-300 border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
      />
      <motion.span
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.3, repeat: Number.POSITIVE_INFINITY }}
      >
        {label}
      </motion.span>
    </div>
  );
}
