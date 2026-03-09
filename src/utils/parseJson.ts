import { OutputValidationError } from './errors.js';

function stripMarkdownCodeFence(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  return trimmed;
}

function appendMissingClosers(input: string): string {
  const stack: string[] = [];
  let inString = false;
  let escaped = false;

  for (const char of input) {
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') {
      stack.push('}');
      continue;
    }

    if (char === '[') {
      stack.push(']');
      continue;
    }

    if (char === '}' || char === ']') {
      if (stack[stack.length - 1] === char) {
        stack.pop();
      }
    }
  }

  if (stack.length === 0) {
    return input;
  }

  return input + stack.reverse().join('');
}

export function parseStrictJson(raw: string): unknown {
  const sanitized = stripMarkdownCodeFence(raw);

  try {
    return JSON.parse(sanitized);
  } catch {
    try {
      const repaired = appendMissingClosers(sanitized);
      return JSON.parse(repaired);
    } catch {
      throw new OutputValidationError('Provider output is not valid JSON', { raw });
    }
  }
}
