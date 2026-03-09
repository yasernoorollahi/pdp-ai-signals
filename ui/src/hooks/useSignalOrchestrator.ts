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

const EMPTY_STEPS: StepResult[] = STEP_ENDPOINTS.map((step) => ({
  key: step.key,
  label: step.label,
  endpoint: step.endpoint,
  status: 'idle'
}));

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
  const [processing, setProcessing] = useState(false);
  const [steps, setSteps] = useState<StepResult[]>(EMPTY_STEPS);
  const [processingTimeMs, setProcessingTimeMs] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<ExtractionStepKey | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

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

  const run = useCallback(
    async (text: string) => {
      const cleanText = text.trim();
      if (!cleanText || !model || processing) {
        return;
      }

      setProcessing(true);
      setGlobalError(null);
      setProcessingTimeMs(null);
      setSteps(EMPTY_STEPS);

      const processStart = performance.now();

      for (const step of STEP_ENDPOINTS) {
        setActiveStep(step.key);
        setSteps((prev) =>
          prev.map((item) =>
            item.key === step.key
              ? {
                  ...item,
                  status: 'running'
                }
              : item
          )
        );

        const stepStart = performance.now();
        try {
          const result = await runExtractionStep(step.endpoint, {
            text: cleanText,
            provider,
            model
          });
          const durationMs = performance.now() - stepStart;

          setSteps((prev) =>
            prev.map((item) =>
              item.key === step.key
                ? {
                    ...item,
                    status: 'completed',
                    result,
                    durationMs
                  }
                : item
            )
          );
        } catch (error) {
          const message = extractErrorMessage(error);
          setSteps((prev) =>
            prev.map((item) =>
              item.key === step.key
                ? {
                    ...item,
                    status: 'error',
                    error: message
                  }
                : item
            )
          );
          setGlobalError(`Step failed: ${step.label}. ${message}`);
          setProcessing(false);
          setActiveStep(step.key);
          setProcessingTimeMs(performance.now() - processStart);
          return;
        }
      }

      setProcessing(false);
      setActiveStep(null);
      setProcessingTimeMs(performance.now() - processStart);
    },
    [model, processing, provider]
  );

  const canSubmit = useMemo(() => !processing && model.length > 0, [model.length, processing]);
  const combinedData = useMemo(
    () =>
      steps.reduce<Record<string, unknown>>((acc, step) => {
        if (step.result) {
          acc[step.key] = step.result.data;
        }
        return acc;
      }, {}),
    [steps]
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
    processing,
    steps,
    activeStep,
    processingTimeMs,
    globalError,
    combinedData,
    canSubmit,
    run
  };
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
