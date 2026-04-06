import { randomUUID } from 'node:crypto';

export type LiveRequestPhase = 'started' | 'completed' | 'failed';
export type LiveEventKind = 'request' | 'stage';
export type LiveStageStatus = 'started' | 'completed' | 'failed';

export interface LiveRequestEvent {
  eventId: string;
  kind: LiveEventKind;
  requestId: string;
  pipelineRunId?: string;
  method: string;
  url: string;
  routeLabel: string;
  timestamp: string;
  source: 'api';
  phase?: LiveRequestPhase;
  stageKey?: string;
  stageLabel?: string;
  stageStatus?: LiveStageStatus;
  order?: number;
  statusCode?: number;
  durationMs?: number;
  startedAt?: string;
  provider?: string;
  model?: string;
  meta?: Record<string, unknown>;
  error?: string;
}

type Listener = (event: LiveRequestEvent) => void;

const MONITORED_ROUTE_LABELS: Record<string, string> = {
  '/extract/facts': 'Facts',
  '/extract/intent': 'Intent',
  '/extract/tone': 'Tone',
  '/extract/cognitive': 'Cognitive',
  '/extract/context': 'Context',
  '/extract/topics': 'Topics',
  '/extract/signals': 'Signals',
  '/extract/classify': 'Classifier',
  '/models/openai': 'Models',
  '/models/ollama': 'Models',
  '/health': 'Health'
};

export class LiveRequestMonitor {
  private readonly listeners = new Set<Listener>();
  private readonly history: LiveRequestEvent[] = [];
  private readonly historyLimit = 150;

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getHistory(): LiveRequestEvent[] {
    return [...this.history];
  }

  public emit(event: Omit<LiveRequestEvent, 'eventId'>): void {
    const payload: LiveRequestEvent = {
      ...event,
      eventId: randomUUID()
    };

    this.history.push(payload);
    if (this.history.length > this.historyLimit) {
      this.history.shift();
    }

    for (const listener of this.listeners) {
      listener(payload);
    }
  }

  public emitStage(event: Omit<LiveRequestEvent, 'eventId' | 'kind' | 'source'>): void {
    this.emit({
      ...event,
      kind: 'stage',
      source: 'api'
    });
  }

  public toRouteLabel(url: string): string {
    const pathname = url.split('?')[0] ?? url;
    return MONITORED_ROUTE_LABELS[pathname] ?? pathname;
  }
}
