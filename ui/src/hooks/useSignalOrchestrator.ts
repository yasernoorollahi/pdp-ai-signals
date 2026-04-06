import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  fetchModels,
  runExtractionStep,
  STEP_ENDPOINTS,
  type ExtractionStepKey,
  type ProviderType,
  type SignalEnvelope
} from '../services/apiClient';

export type StepStatus = 'idle' | 'running' | 'completed' | 'error';

export interface StepResult {
  key: ExtractionStepKey;
  label: string;
  endpoint: string;
  status: StepStatus;
  result?: SignalEnvelope;
  durationMs?: number;
  error?: string;
}

export interface PipelineRun {
  id: string;
  text: string;
  provider: ProviderType;
  model: string;
  createdAt: string;
  processing: boolean;
  steps: StepResult[];
  activeStep: ExtractionStepKey | null;
  processingTimeMs: number | null;
  globalError: string | null;
}

export function useSignalOrchestrator() {
  const [provider, setProvider] = useState<ProviderType>('ollama');
  const [model, setModel] = useState('');
  const [modelsByProvider, setModelsByProvider] = useState<Record<ProviderType, string[]>>({
    openai: [],
    ollama: []
  });
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [modelsInfo, setModelsInfo] = useState<string | null>(null);
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const currentModels = modelsByProvider[provider] ?? [];

  const loadModels = useCallback(
    async (selectedProvider: ProviderType, force = false) => {
      if (!force && modelsByProvider[selectedProvider].length > 0) {
        return;
      }

      setModelsLoading(true);
      setModelsError(null);
      setModelsInfo(null);

      try {
        const payload = await fetchModels(selectedProvider);
        setModelsByProvider((prev) => ({ ...prev, [selectedProvider]: payload.models }));
        if (payload.warning) {
          setModelsInfo(payload.warning);
        }
        setModel((prev) => {
          if (prev && payload.models.includes(prev)) {
            return prev;
          }
          if (payload.defaultModel && payload.models.includes(payload.defaultModel)) {
            return payload.defaultModel;
          }
          return payload.models[0] ?? '';
        });
      } catch (error) {
        setModelsError(error instanceof Error ? error.message : 'Failed to load models.');
      } finally {
        setModelsLoading(false);
      }
    },
    [modelsByProvider]
  );

  useEffect(() => {
    void loadModels(provider);
  }, [loadModels, provider]);

  useEffect(() => {
    const available = modelsByProvider[provider] ?? [];
    if (available.length === 0) {
      setModel('');
      return;
    }

    if (!available.includes(model)) {
      setModel(available[0] ?? '');
    }
  }, [model, modelsByProvider, provider]);

  const updateRun = useCallback((runId: string, updater: (run: PipelineRun) => PipelineRun) => {
    setRuns((current) => current.map((run) => (run.id === runId ? updater(run) : run)));
  }, []);

  const run = useCallback(
    async (text: string) => {
      const cleanText = text.trim();
      if (!cleanText || !model) {
        return;
      }

      const runId = createRunId();
      const snapshotProvider = provider;
      const snapshotModel = model;

      setRuns((current) => [
        {
          id: runId,
          text: cleanText,
          provider: snapshotProvider,
          model: snapshotModel,
          createdAt: new Date().toISOString(),
          processing: true,
          steps: createEmptySteps(),
          activeStep: null,
          processingTimeMs: null,
          globalError: null
        },
        ...current
      ]);
      setSelectedRunId(runId);

      const processStart = performance.now();

      for (const step of STEP_ENDPOINTS) {
        updateRun(runId, (currentRun) => ({
          ...currentRun,
          activeStep: step.key,
          steps: currentRun.steps.map((item) =>
            item.key === step.key
              ? {
                  ...item,
                  status: 'running'
                }
              : item
          )
        }));

        const stepStart = performance.now();
        try {
          const result = await runExtractionStep(step.endpoint, {
            text: cleanText,
            provider: snapshotProvider,
            model: snapshotModel
          }, {
            pipelineRunId: runId
          });
          const durationMs = performance.now() - stepStart;

          updateRun(runId, (currentRun) => ({
            ...currentRun,
            steps: currentRun.steps.map((item) =>
              item.key === step.key
                ? {
                    ...item,
                    status: 'completed',
                    result,
                    durationMs
                  }
                : item
            )
          }));
        } catch (error) {
          const message = extractErrorMessage(error);
          updateRun(runId, (currentRun) => ({
            ...currentRun,
            processing: false,
            activeStep: step.key,
            processingTimeMs: performance.now() - processStart,
            globalError: `Step failed: ${step.label}. ${message}`,
            steps: currentRun.steps.map((item) =>
              item.key === step.key
                ? {
                    ...item,
                    status: 'error',
                    error: message
                  }
                : item
            )
          }));
          return;
        }
      }

      updateRun(runId, (currentRun) => ({
        ...currentRun,
        processing: false,
        activeStep: null,
        processingTimeMs: performance.now() - processStart
      }));
    },
    [model, provider, updateRun]
  );

  const selectedRun = useMemo(() => {
    if (runs.length === 0) {
      return null;
    }

    if (selectedRunId) {
      return runs.find((run) => run.id === selectedRunId) ?? runs[0];
    }

    return runs[0];
  }, [runs, selectedRunId]);

  const processingCount = useMemo(() => runs.filter((runItem) => runItem.processing).length, [runs]);
  const canSubmit = useMemo(() => model.length > 0, [model.length]);
  const combinedData = useMemo(
    () =>
      (selectedRun?.steps ?? []).reduce<Record<string, unknown>>((acc, step) => {
        if (step.result) {
          acc[step.key] = step.result.data;
        }
        return acc;
      }, {}),
    [selectedRun]
  );

  return {
    provider,
    setProvider,
    model,
    setModel,
    currentModels,
    modelsLoading,
    modelsError,
    modelsInfo,
    reloadModels: (force = true) => loadModels(provider, force),
    runs,
    selectedRun,
    selectedRunId,
    setSelectedRunId,
    processing: processingCount > 0,
    processingCount,
    steps: selectedRun?.steps ?? createEmptySteps(),
    activeStep: selectedRun?.activeStep ?? null,
    processingTimeMs: selectedRun?.processingTimeMs ?? null,
    globalError: selectedRun?.globalError ?? null,
    combinedData,
    canSubmit,
    run
  };
}

function createEmptySteps(): StepResult[] {
  return STEP_ENDPOINTS.map((step) => ({
    key: step.key,
    label: step.label,
    endpoint: step.endpoint,
    status: 'idle'
  }));
}

function createRunId(): string {
  return `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const details = error.response?.data?.error?.details;
    if (details) {
      return `${error.message} | ${JSON.stringify(details)}`;
    }
    return error.message;
  }

  return error instanceof Error ? error.message : 'Unexpected orchestration error';
}
