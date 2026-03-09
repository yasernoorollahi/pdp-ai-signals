import type { ProviderType } from '../services/apiClient';

interface ProviderModelSelectorProps {
  provider: ProviderType;
  onProviderChange: (value: ProviderType) => void;
  model: string;
  models: string[];
  modelsLoading: boolean;
  modelsError: string | null;
  modelsInfo: string | null;
  onModelChange: (value: string) => void;
  onReload: () => void;
}

export function ProviderModelSelector({
  provider,
  onProviderChange,
  model,
  models,
  modelsLoading,
  modelsError,
  modelsInfo,
  onModelChange,
  onReload
}: ProviderModelSelectorProps) {
  return (
    <div className="rounded-2xl border border-violet-200/25 bg-black/20 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-violet-50">Provider</span>
          <select
            value={provider}
            onChange={(event) => onProviderChange(event.target.value as ProviderType)}
            className="rounded-lg border border-violet-200/30 bg-violet-950/40 px-3 py-2 text-violet-50 outline-none transition focus:border-violet-200/60"
          >
            <option value="ollama">Ollama</option>
            <option value="openai">OpenAI</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-violet-50">Model</span>
          <select
            value={model}
            onChange={(event) => onModelChange(event.target.value)}
            disabled={modelsLoading || models.length === 0}
            className="rounded-lg border border-violet-200/30 bg-violet-950/40 px-3 py-2 text-violet-50 outline-none transition focus:border-violet-200/60 disabled:opacity-50"
          >
            {models.length === 0 ? <option value="">No model available</option> : null}
            {models.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={onReload}
          className="h-10 min-w-24 rounded-lg border border-violet-200/35 px-4 text-sm text-violet-100 transition hover:bg-violet-500/20"
        >
          {modelsLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {modelsError ? <p className="mt-2 text-xs text-rose-200">{modelsError}</p> : null}
      {!modelsError && modelsInfo ? <p className="mt-2 text-xs text-violet-200/85">{modelsInfo}</p> : null}
    </div>
  );
}
