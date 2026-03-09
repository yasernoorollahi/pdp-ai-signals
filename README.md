# PDP AI Signal Service (Backend)

Main backend service for cognitive signal extraction from text, built as a stateless TypeScript/Fastify microservice.

This repository also contains a secondary UI app in `ui/`, used only for API testing. UI docs are in [ui/README.md](./ui/README.md).

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [API Reference](#api-reference)
- [Request Examples](#request-examples)
- [Error Handling](#error-handling)
- [GitHub Readiness and Security](#github-readiness-and-security)

## Overview
This service extracts structured signals from raw text with no database dependency.
It follows a layered architecture and supports provider swapping (OpenAI/Ollama/Mock) through configuration.

## Features
- Capability-based extraction:
  - `facts`
  - `intent`
  - `tone`
  - `cognitive`
  - `context`
  - `topics`
- One-shot full extraction via `POST /extract/signals`
- Message usefulness classification via `POST /extract/classify`
- Per-request provider/model override support
- Strict Zod-based output validation
- Standardized error responses and request timing logs
- Built-in Swagger/OpenAPI docs

## Architecture

```txt
src/
 ├── controllers/         # Transport layer (no business logic)
 ├── services/            # Application services and extraction logic
 ├── interfaces/          # Cross-layer contracts
 ├── adapters/
 │    └── ai-providers/   # OpenAI / Ollama / Mock adapters
 ├── prompts/             # Prompt templates per capability
 ├── schemas/             # Input/output schemas (Zod)
 ├── orchestrator/        # Sequential extraction pipeline
 ├── config/              # Env loading, provider factory, DI container, swagger
 ├── utils/               # Retry, errors, logger, strict JSON parsing
 └── server.ts            # Fastify bootstrap
```

### Request Flow (Summary)
1. Controller validates input using `ExtractRequestSchema`.
2. `ExtractionServiceFactory` creates the target extraction service.
3. Provider is selected by env config or request-level override.
4. Prompt is sent to the model and parsed as strict JSON.
5. Output is validated against Zod schema.
6. Structured response (or standardized error) is returned.

## Prerequisites
- Node.js `>=20`
- npm
- For OpenAI provider: `OPENAI_API_KEY`
- For Ollama provider: running Ollama service (default `http://localhost:11434`)

## Quick Start
```bash
npm install
cp .env.example .env
npm run dev
```

Default service URL:
- `http://localhost:3000`

Swagger:
- `http://localhost:3000/api-docs`
- `http://localhost:3000/api-docs.json`

## Environment Variables
Sample file: `.env.example`

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | Service port | `3000` |
| `AI_PROVIDER` | Default provider (`openai`/`ollama`/`mock`) | `mock` |
| `AI_MODEL` | Default model | `gpt-4.1-mini` |
| `OPENAI_API_KEY` | OpenAI API key (required for `openai`) | - |
| `OPENAI_BASE_URL` | OpenAI base URL | `https://api.openai.com/v1` |
| `OPENAI_MODELS` | Comma-separated OpenAI model list | - |
| `OLLAMA_BASE_URL` | Ollama base URL | `http://localhost:11434` |
| `REQUEST_TIMEOUT_MS` | Provider timeout in ms (`0` = disabled) | `0` |
| `PROVIDER_MAX_RETRIES` | Max retry attempts | `3` |
| `PROVIDER_RETRY_DELAY_MS` | Delay between retries in ms | `300` |

## Scripts
```bash
npm run dev        # Run backend in watch mode
npm run typecheck  # Run TypeScript type checking
npm run build      # Build to dist/
npm start          # Run dist/server.js
npm run ui:dev     # Run UI app from repository root
npm run ui:build   # Build UI app from repository root
```

## API Reference

### Base URL
`http://localhost:3000`

### Common Extraction Request Payload
Used by extraction endpoints:

```json
{
  "text": "raw input text",
  "provider": "openai | ollama | mock",
  "model": "model-name"
}
```

`provider` and `model` are optional.

### Endpoints

| Method | Path | Description | Success Response |
|---|---|---|---|
| `GET` | `/health` | Health check | `{ status, service }` |
| `GET` | `/models/openai` | List OpenAI models from env config | `{ provider, models, defaultModel }` |
| `GET` | `/models/ollama` | Discover Ollama models via API/CLI/fallback | `{ provider, models, defaultModel, warning? }` |
| `POST` | `/extract/facts` | Extract facts signal | `SignalEnvelope<FactsData>` |
| `POST` | `/extract/intent` | Extract intent signal | `SignalEnvelope<IntentData>` |
| `POST` | `/extract/tone` | Extract tone signal | `SignalEnvelope<ToneData>` |
| `POST` | `/extract/cognitive` | Extract cognitive signal | `SignalEnvelope<CognitiveData>` |
| `POST` | `/extract/context` | Extract context signal | `SignalEnvelope<ContextData>` |
| `POST` | `/extract/topics` | Extract topics signal | `SignalEnvelope<TopicsData>` |
| `POST` | `/extract/signals` | Extract full composite signals | `FullSignals` |
| `POST` | `/extract/classify` | Classify message usefulness | `{ score, decision, reason }` |

### Common Response Envelope (Capability Endpoints)
For `facts`, `intent`, `tone`, `cognitive`, `context`, and `topics`:

```json
{
  "meta": {
    "language": "fa|en|...",
    "model": "model-name",
    "confidence": 0.0
  },
  "data": {}
}
```

### Important Note on `/extract/signals`
`/extract/signals` returns a direct `FullSignals` object (not envelope-wrapped):

```json
{
  "facts": {},
  "intent": {},
  "tone": {},
  "cognitive": {},
  "context": {},
  "topics": {},
  "behavioral_modeling": {},
  "confidence": 0.0
}
```

### Error Status Codes
Typical extraction endpoint errors:
- `400` Request validation error
- `422` Model output validation error
- `502` Provider error
- `500` Internal server error

## Request Examples

### Health
```bash
curl -s http://localhost:3000/health
```

### Facts Extraction
```bash
curl -s -X POST http://localhost:3000/extract/facts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Today I worked on the project and had a team meeting.",
    "provider": "mock"
  }'
```

### Full Signals
```bash
curl -s -X POST http://localhost:3000/extract/signals \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Today I had multiple meetings, felt tired, but completed my main task.",
    "provider": "openai",
    "model": "gpt-4.1-mini"
  }'
```

### Message Classifier
```bash
curl -s -X POST http://localhost:3000/extract/classify \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I am uncertain about my next step in the project timeline.",
    "provider": "ollama"
  }'
```

## Error Handling
Error response format:

```json
{
  "error": {
    "code": "REQUEST_VALIDATION_ERROR | OUTPUT_VALIDATION_ERROR | PROVIDER_ERROR | INTERNAL_ERROR | CONFIG_ERROR",
    "message": "human readable message",
    "details": {}
  }
}
```

## GitHub Readiness and Security
- No hardcoded real secrets were found in source files.
- `.env.example` includes placeholders only.
- Before pushing:
  - Never commit your real `.env`.
  - Rotate keys immediately if any real key was ever exposed.
- A root `.gitignore` is now included to prevent committing build/dependency/system files.
- Existing `.DS_Store` files are covered by `.gitignore`.

## Secondary UI App
For the API test dashboard, see [ui/README.md](./ui/README.md).
