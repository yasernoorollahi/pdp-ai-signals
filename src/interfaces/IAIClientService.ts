export interface IAIClientService {
  generate(prompt: string): Promise<string>;
  getModelName(): string;
}
