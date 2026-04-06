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

  const {
    provider,
    setProvider,
    model,
    setModel,
    currentModels,
    modelsLoading,
    modelsError,
    modelsInfo,
    reloadModels,
    runs,
    selectedRun,
    setSelectedRunId,
    processingCount,
    processing,
    steps,
    activeStep,
    processingTimeMs,
    globalError,
    combinedData,
    canSubmit,
    run
  } = useSignalOrchestrator();

  const stepRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!activeStep) return;
    const target = stepRefs.current[activeStep];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeStep]);

  const completedCount = useMemo(() => steps.filter((step) => step.status === 'completed').length, [steps]);

  return (
    <div className="relative min-h-screen pb-16">
      <GradientBackground />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-10 md:px-8">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-3xl font-semibold tracking-tight text-violet-50 md:text-4xl">
            PDP AI Signal Orchestration
          </h1>
          <p className="mt-2 text-violet-100/80">
            Sequential extraction pipeline with real-time progress and model-level visibility.
          </p>
        </motion.header>

        <LiveRequestTimelineBoard
          rows={jobRows}
          {...(selectedRun?.id ? { selectedRowId: selectedRun.id } : {})}
          onSelectRow={(row) => {
            if (row.pipelineRunId) {
              setSelectedRunId(row.pipelineRunId);
            }
          }}
        />

        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <GlassCard>
            <div className="space-y-4">
              <ProviderModelSelector
                provider={provider}
                onProviderChange={setProvider}
                model={model}
                models={currentModels}
                modelsLoading={modelsLoading}
                modelsError={modelsError}
                modelsInfo={modelsInfo}
                onModelChange={setModel}
                onReload={() => {
                  void reloadModels();
                }}
              />

              <label className="block text-sm font-medium text-violet-50">Input Text</label>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Paste user text here..."
                className="min-h-48 w-full rounded-xl border border-violet-200/25 bg-black/25 p-3 text-sm text-violet-50 outline-none transition focus:border-violet-200/60"
              />

              <div className="flex items-center justify-between text-xs text-violet-100/80">
                <span>Completed: {completedCount}/6</span>
                {processingTimeMs ? <span>Total: {(processingTimeMs / 1000).toFixed(2)}s</span> : null}
              </div>

              <button
                type="button"
                disabled={!canSubmit || text.trim().length === 0}
                onClick={() => {
                  void run(text);
                }}
                className="w-full rounded-xl border border-fuchsia-200/45 bg-gradient-to-r from-fuchsia-600/70 to-violet-600/70 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {processing ? `Run Another Pipeline (${processingCount} active)` : 'Run Pipeline'}
              </button>

              {globalError ? <p className="text-xs text-rose-200">{globalError}</p> : null}
            </div>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-xl font-semibold text-violet-50">Pipeline Jobs</h2>
                <span className="text-xs text-violet-100/70">{runs.length} total runs</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {runs.length === 0 ? (
                  <p className="text-sm text-violet-100/65">Run a pipeline to see jobs here.</p>
                ) : (
                  runs.map((runItem) => (
                    <button
                      key={runItem.id}
                      type="button"
                      onClick={() => setSelectedRunId(runItem.id)}
                      className={`rounded-xl border px-3 py-2 text-left transition ${
                        selectedRun?.id === runItem.id
                          ? 'border-fuchsia-200/45 bg-fuchsia-500/15 text-violet-50'
                          : 'border-violet-200/15 bg-black/20 text-violet-100/75 hover:border-violet-200/35'
                      }`}
                    >
                      <p className="font-mono text-[11px]">{runItem.id}</p>
                      <p className="mt-1 text-xs">
                        {runItem.processing ? 'running' : runItem.globalError ? 'failed' : 'done'}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </GlassCard>

            <GlassCard>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-xl font-semibold text-violet-50">Progress</h2>
                {selectedRun ? (
                  <span className="font-mono text-xs text-violet-100/70">{selectedRun.id}</span>
                ) : null}
              </div>
              <StepProgress steps={steps} />
            </GlassCard>

            <GlassCard>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-xl font-semibold text-violet-50">Combined Data</h2>
                {selectedRun ? (
                  <span className="text-xs text-violet-100/70">
                    {selectedRun.processing ? 'Running' : selectedRun.globalError ? 'Failed' : 'Completed'}
                  </span>
                ) : null}
              </div>
              <pre className="max-h-80 overflow-auto rounded-xl border border-violet-200/20 bg-[#120a24]/80 p-3 font-mono text-xs leading-relaxed text-violet-100">
                {JSON.stringify(combinedData, null, 2)}
              </pre>
            </GlassCard>

            <AnimatePresence>
              {steps
                .filter((step) => step.result)
                .map((step) => (
                  <section
                    key={step.key}
                    ref={(element) => {
                      stepRefs.current[step.key] = element;
                    }}
                  >
                    <SignalPanel
                      title={step.label}
                      payload={step.result}
                      provider={selectedRun?.provider ?? provider}
                    />
                  </section>
                ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
