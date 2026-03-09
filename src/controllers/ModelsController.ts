import type { FastifyInstance } from 'fastify';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { AppConfig } from '../config/env.js';

const execFileAsync = promisify(execFile);

interface OllamaTagsResponse {
  models?: Array<{
    name?: string;
    model?: string;
  }>;
}

export class ModelsController {
  constructor(private readonly config: AppConfig) {}

  public register(app: FastifyInstance): void {
    /**
     * @openapi
     * /models/ollama:
     *   get:
     *     tags: [Models]
     *     summary: List Ollama models
     *     responses:
     *       '200':
     *         description: Discovered Ollama models
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ModelListResponse'
     */
    app.get('/models/ollama', async (_request, reply) => {
      const { models, warning } = await this.fetchOllamaModels();
      reply.status(200).send({
        provider: 'ollama',
        models,
        defaultModel: this.getOllamaDefaultModel(models),
        warning
      });
    });

    /**
     * @openapi
     * /models/openai:
     *   get:
     *     tags: [Models]
     *     summary: List configured OpenAI models
     *     responses:
     *       '200':
     *         description: Configured OpenAI models
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ModelListResponse'
     */
    app.get('/models/openai', async (_request, reply) => {
      const models = this.getOpenAIModels();
      reply.status(200).send({
        provider: 'openai',
        models,
        defaultModel: this.config.AI_PROVIDER === 'openai' ? this.config.AI_MODEL : null
      });
    });
  }

  private getOpenAIModels(): string[] {
    const configured = this.config.OPENAI_MODELS?.split(',')
      .map((model) => model.trim())
      .filter((model) => model.length > 0);

    if (configured && configured.length > 0) {
      return [...new Set(configured)];
    }

    return [this.config.AI_MODEL];
  }

  private getOllamaDefaultModel(models: string[]): string | null {
    if (this.config.AI_PROVIDER === 'ollama') {
      return this.config.AI_MODEL;
    }

    return models[0] ?? null;
  }

  private async fetchOllamaModels(): Promise<{ models: string[]; warning?: string }> {
    const discoveredFromApi = await this.fetchOllamaModelsFromApi();
    if (discoveredFromApi.length > 0) {
      return { models: discoveredFromApi };
    }

    const discoveredFromCli = await this.fetchOllamaModelsFromCli();
    if (discoveredFromCli.length > 0) {
      return {
        models: discoveredFromCli,
        warning: 'Loaded models using local ollama CLI fallback.'
      };
    }

    const fallback = this.config.AI_MODEL.trim();
    if (fallback.length > 0) {
      return {
        models: [fallback],
        warning: 'Could not auto-discover Ollama models. Using configured AI_MODEL fallback.'
      };
    }

    return {
      models: [],
      warning: 'Could not auto-discover Ollama models. Ensure Ollama is running and accessible.'
    };
  }

  private async fetchOllamaModelsFromApi(): Promise<string[]> {
    const controller = new AbortController();
    const timeoutId =
      this.config.REQUEST_TIMEOUT_MS > 0
        ? setTimeout(() => controller.abort(), this.config.REQUEST_TIMEOUT_MS)
        : null;

    try {
      const response = await fetch(`${this.config.OLLAMA_BASE_URL}/api/tags`, {
        signal: this.config.REQUEST_TIMEOUT_MS > 0 ? controller.signal : null
      });

      if (!response.ok) {
        return [];
      }

      const payload = (await response.json()) as OllamaTagsResponse;
      const discovered = payload.models
        ?.map((entry) => (entry.name ?? entry.model ?? '').trim())
        .filter((name) => name.length > 0);

      if (!discovered || discovered.length === 0) {
        return [];
      }

      return [...new Set(discovered)];
    } catch {
      return [];
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  private async fetchOllamaModelsFromCli(): Promise<string[]> {
    try {
      const { stdout } = await execFileAsync('ollama', ['list'], {
        timeout: this.config.REQUEST_TIMEOUT_MS > 0 ? this.config.REQUEST_TIMEOUT_MS : undefined
      });
      return this.parseOllamaListOutput(stdout);
    } catch {
      return [];
    }
  }

  private parseOllamaListOutput(output: string): string[] {
    const lines = output
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length <= 1) {
      return [];
    }

    const rows = lines.slice(1);
    const names = rows
      .map((line) => line.split(/\s{2,}/)[0]?.trim() ?? '')
      .filter((name) => name.length > 0 && name.toUpperCase() !== 'NAME');

    return [...new Set(names)];
  }
}
