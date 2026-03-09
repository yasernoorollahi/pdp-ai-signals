import { motion } from 'framer-motion';
import type { SignalEnvelope } from '../services/apiClient';

interface SignalPanelProps {
  title: string;
  payload: SignalEnvelope | undefined;
  provider: string;
}

export function SignalPanel({ title, payload, provider }: SignalPanelProps) {
  const confidence = payload ? Math.round(payload.meta.confidence * 100) : 0;

  const copyJson = async () => {
    if (!payload) return;
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-violet-300/20 bg-black/20 p-4 shadow-glow"
    >
      <header className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full border border-violet-300/30 bg-violet-600/20 px-2 py-1 font-semibold text-violet-100">
          {title}
        </span>
        {payload ? (
          <>
            <span className="rounded-full border border-violet-300/30 bg-violet-500/15 px-2 py-1 text-violet-100">
              provider: {provider}
            </span>
            <span className="rounded-full border border-violet-300/30 bg-violet-500/15 px-2 py-1 text-violet-100">
              model: {payload.meta.model}
            </span>
            <button
              type="button"
              onClick={() => {
                void copyJson();
              }}
              className="ml-auto rounded-lg border border-violet-200/30 px-2 py-1 text-violet-100 transition hover:bg-violet-500/20"
            >
              Copy JSON
            </button>
          </>
        ) : null}
      </header>

      {payload ? (
        <>
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between text-xs text-violet-100/90">
              <span>Confidence</span>
              <span>{confidence}%</span>
            </div>
            <div className="h-2 rounded-full bg-violet-950/70">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-fuchsia-300 via-violet-300 to-indigo-300"
                initial={{ width: 0 }}
                animate={{ width: `${confidence}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>
          <pre className="max-h-80 overflow-auto rounded-xl border border-violet-200/20 bg-[#120a24]/80 p-3 font-mono text-xs leading-relaxed text-violet-100">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </>
      ) : (
        <p className="text-sm text-violet-100/65">Waiting for result...</p>
      )}
    </motion.article>
  );
}
