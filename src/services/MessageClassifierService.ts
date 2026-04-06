import type { IAIClientService } from '../interfaces/IAIClientService.js';
import type { IMessageClassifierService } from '../interfaces/IMessageClassifierService.js';
import { buildMessageClassifierPrompt } from '../prompts/message-classifier.prompt.js';
import {
  MessageClassificationResultSchema,
  type MessageClassificationDecision,
  type MessageClassificationResult
} from '../schemas/message-classifier.schema.js';
import { OutputValidationError } from '../utils/errors.js';
import { parseStrictJson } from '../utils/parseJson.js';
import type { LiveRequestMonitor } from '../utils/liveRequestMonitor.js';
import type { RequestTraceContext } from '../interfaces/RequestTraceContext.js';
import { emitTraceStage } from '../utils/requestTracing.js';

export class MessageClassifierService implements IMessageClassifierService {
  constructor(
    private readonly aiClient: IAIClientService,
    private readonly liveRequestMonitor?: LiveRequestMonitor,
    private readonly trace?: RequestTraceContext
  ) {}

  public async classify(text: string): Promise<MessageClassificationResult> {
    this.emitStage('service-start', 'Classification Start', 'started', 1, {
      textLength: text.length
    });
    const prompt = buildMessageClassifierPrompt(text);
    this.emitStage('prompt-built', 'Prompt Built', 'completed', 2, {
      promptLength: prompt.length
    });
    const raw = await this.aiClient.generate(prompt);
    const parsed = parseStrictJson(raw);
    this.emitStage('response-parsed', 'Response Parsed', 'completed', 5);
    const normalized = this.normalizeParsedOutput(parsed);
    const validated = MessageClassificationResultSchema.safeParse(normalized);

    if (!validated.success) {
      this.emitStage('schema-validation', 'Schema Validated', 'failed', 6, {
        issues: validated.error.issues.length
      });
      throw new OutputValidationError('Message classification output failed schema validation', {
        issues: validated.error.format(),
        raw
      });
    }

    this.emitStage('schema-validation', 'Schema Validated', 'completed', 6, {
      score: validated.data.score,
      decision: validated.data.decision
    });
    return validated.data;
  }

  private normalizeParsedOutput(parsed: unknown): unknown {
    if (typeof parsed !== 'object' || parsed === null) {
      return parsed;
    }

    const candidate = parsed as Record<string, unknown>;
    const numericScore = this.toNumericScore(candidate.score);
    const boundedScore = Math.max(0, Math.min(1, numericScore));
    const normalizedDecision: MessageClassificationDecision = boundedScore >= 0.6 ? 'USEFUL' : 'IGNORE';

    return {
      score: boundedScore,
      decision: normalizedDecision,
      reason:
        typeof candidate.reason === 'string' && candidate.reason.trim().length > 0
          ? candidate.reason.trim()
          : `Score ${boundedScore.toFixed(2)} classified as ${normalizedDecision}`
    };
  }

  private toNumericScore(value: unknown): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value.trim());
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    throw new OutputValidationError('Message classification output missing a numeric score', { score: value });
  }

  private emitStage(
    stageKey: string,
    label: string,
    status: 'started' | 'completed' | 'failed',
    order: number,
    meta?: Record<string, unknown>
  ): void {
    if (!this.liveRequestMonitor || !this.trace) {
      return;
    }

    emitTraceStage(this.liveRequestMonitor, this.trace, stageKey, label, status, {
      order,
      ...(meta ? { meta } : {})
    });
  }
}
