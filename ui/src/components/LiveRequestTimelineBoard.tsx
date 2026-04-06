import { motion } from 'framer-motion';
import type { LiveJobRow } from '../hooks/useLiveRequestMonitor';

interface LiveRequestTimelineBoardProps {
  rows: LiveJobRow[];
  selectedRowId?: string;
  onSelectRow?: (row: LiveJobRow) => void;
}

export function LiveRequestTimelineBoard({ rows, selectedRowId, onSelectRow }: LiveRequestTimelineBoardProps) {
  return (
    <section className="mb-6 rounded-[28px] border border-violet-200/15 bg-black/20 p-5 shadow-panel backdrop-blur-xl md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-violet-50">Live Streaming Pipeline</h2>
          <p className="mt-1 text-sm text-violet-100/75">
            Each pipeline job gets its own row and shows which stage it is currently running.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/20 bg-white/5 px-3 py-1 text-xs text-violet-100/80">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span>{rows.filter((row) => row.phase === 'started').length} active job(s)</span>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-violet-200/20 bg-violet-950/20 px-4 py-10 text-center text-sm text-violet-100/65">
          Run a pipeline to see live job rows here.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row, runIndex) => (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: runIndex * 0.03 }}
              className={`overflow-hidden rounded-2xl border bg-[linear-gradient(135deg,rgba(31,17,67,0.78),rgba(12,8,24,0.9))] p-3 transition ${
                selectedRowId === row.id
                  ? 'border-fuchsia-200/45 shadow-[0_0_0_1px_rgba(232,121,249,0.18)]'
                  : 'border-violet-200/15'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectRow?.(row)}
                className="block w-full text-left"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-violet-100/80">{row.label}</span>
                      <span className="text-[10px] text-violet-100/55">{row.sourceLabel}</span>
                      <span className={requestBadgeClassName(row.phase)}>{requestLabel(row.phase)}</span>
                    </div>
                    {row.model ? (
                      <p className="text-[10px] text-violet-200/60">model: {row.model}</p>
                    ) : null}
                  </div>

                  <div className="text-right text-[11px] text-violet-100/70">
                    <p>{formatClock(row.createdAt)}</p>
                    <p>{formatDuration(row.durationMs)}</p>
                  </div>
                </div>

                <div className="overflow-hidden">
                  <div className="flex flex-wrap items-center gap-2">
                    {row.stages.map((stage, index) => (
                      <div key={stage.key} className="flex items-center gap-2">
                        <StageNode stage={stage} />
                        {index < row.stages.length - 1 ? <FlowArrow status={stage.status} /> : null}
                      </div>
                    ))}
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

function StageNode({ stage }: { stage: { label: string; status: 'idle' | 'started' | 'completed' | 'failed'; durationMs?: number; updatedAt?: string; error?: string } }) {
  return (
    <div className="w-[118px] rounded-xl border border-violet-200/15 bg-black/25 p-2">
      <div className="mb-1 flex items-center justify-between gap-1.5">
        <span className="text-[10px] font-medium leading-4 text-violet-50">{stage.label}</span>
        <span className={stageBadgeClassName(stage.status)}>{requestLabel(stage.status)}</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-violet-950/80">
        <div className={stageBarClassName(stage.status)} style={{ width: `${stageProgress(stage.status)}%` }} />
      </div>

      <div className="mt-1 space-y-0.5 text-[9px] leading-4 text-violet-100/70">
        <p>{stage.updatedAt ? formatClock(stage.updatedAt) : formatDuration(stage.durationMs)}</p>
        {typeof stage.durationMs === 'number' ? <p>{formatDuration(stage.durationMs)}</p> : null}
        {stage.error ? <p className="truncate text-rose-200">{stage.error}</p> : null}
      </div>
    </div>
  );
}

function FlowArrow({ status }: { status: 'idle' | 'started' | 'completed' | 'failed' }) {
  return (
    <div className="flex items-center gap-1">
      <span className={`h-px w-2 ${arrowLineClassName(status)}`} />
      <span className={`text-xs ${arrowTextClassName(status)}`}>→</span>
      <span className={`h-px w-2 ${arrowLineClassName(status)}`} />
    </div>
  );
}

function requestLabel(status: 'idle' | 'started' | 'completed' | 'failed'): string {
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

function requestBadgeClassName(status: 'idle' | 'started' | 'completed' | 'failed') {
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

function stageBadgeClassName(status: 'idle' | 'started' | 'completed' | 'failed') {
  return requestBadgeClassName(status);
}

function stageBarClassName(status: 'idle' | 'started' | 'completed' | 'failed') {
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

function stageProgress(status: 'idle' | 'started' | 'completed' | 'failed') {
  if (status === 'completed' || status === 'failed') {
    return 100;
  }
  if (status === 'started') {
    return 58;
  }
  return 0;
}

function arrowLineClassName(status: 'idle' | 'started' | 'completed' | 'failed') {
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

function arrowTextClassName(status: 'idle' | 'started' | 'completed' | 'failed') {
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

function formatClock(value: string): string {
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}


function formatDuration(durationMs?: number): string {
  if (typeof durationMs !== 'number') {
    return '--';
  }
  if (durationMs < 1000) {
    return `${durationMs.toFixed(0)} ms`;
  }
  return `${(durationMs / 1000).toFixed(2)} s`;
}
