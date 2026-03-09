export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class OutputValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 422, 'OUTPUT_VALIDATION_ERROR', details);
  }
}

export class ProviderError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 502, 'PROVIDER_ERROR', details);
  }
}
