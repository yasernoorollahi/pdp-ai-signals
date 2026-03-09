import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    AI_PROVIDER: z.enum(['openai', 'ollama', 'mock']).default('mock'),
    AI_MODEL: z.string().trim().min(1).default('gpt-4.1-mini'),
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_BASE_URL: z.string().url().default('https://api.openai.com/v1'),
    OPENAI_MODELS: z.string().optional(),
    OLLAMA_BASE_URL: z.string().url().default('http://localhost:11434'),
    REQUEST_TIMEOUT_MS: z.coerce.number().int().min(0).default(0),
    PROVIDER_MAX_RETRIES: z.coerce.number().int().min(0).default(3),
    PROVIDER_RETRY_DELAY_MS: z.coerce.number().int().min(0).default(300)
  })
  .passthrough();

export type AppConfig = z.infer<typeof EnvSchema>;

export function loadConfig(): AppConfig {
  return EnvSchema.parse(process.env);
}
