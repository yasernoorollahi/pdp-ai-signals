import { AnimatePresence, motion } from 'framer-motion';
import type { StepResult } from '../hooks/useSignalOrchestrator';
import { AnimatedLoader } from './AnimatedLoader';

function StatusIcon({ status }: { status: StepResult['status'] }) {
  if (status === 'completed') {
    return <span className="text-emerald-300">✓</span>;
  }
  if (status === 'error') {
    return <span className="text-rose-300">!</span>;
  }
  return <span className="text-violet-200">•</span>;
}

export function StepProgress({ steps }: { steps: StepResult[] }) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <motion.div
          key={step.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="rounded-xl border border-violet-300/20 bg-violet-900/25 px-4 py-3"
        >
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <StatusIcon status={step.status} />
              <span className="font-medium text-violet-50">{step.label}</span>
              <span className="font-mono text-xs text-violet-200/80">{step.endpoint}</span>
            </div>
            {step.durationMs ? (
              <span className="font-mono text-xs text-violet-200/70">{step.durationMs.toFixed(0)} ms</span>
            ) : null}
          </div>

          <AnimatePresence>
            {step.status === 'running' ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-2"
              >
                <AnimatedLoader label={`Calling ${step.endpoint}...`} />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {step.error ? <p className="mt-2 text-xs text-rose-200">{step.error}</p> : null}
        </motion.div>
      ))}
    </div>
  );
}
