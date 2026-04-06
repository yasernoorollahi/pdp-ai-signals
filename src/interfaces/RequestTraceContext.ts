export interface RequestTraceContext {
  requestId: string;
  pipelineRunId?: string;
  routeLabel: string;
  url: string;
  method: string;
  provider?: string;
  model?: string;
}
