/**
 * Base API Error class with HTTP status code support.
 */
export class APIError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details,
    };
  }
}

/**
 * Authentication error (401 Unauthorized).
 */
export class AuthError extends APIError {
  constructor(message = 'Authentication required', code = 'AUTH_REQUIRED') {
    super(message, 401, code);
    this.name = 'AuthError';
  }
}

/**
 * Authorization/Permission error (403 Forbidden).
 */
export class ForbiddenError extends APIError {
  constructor(message = 'Forbidden', code = 'FORBIDDEN') {
    super(message, 403, code);
    this.name = 'ForbiddenError';
  }
}

/**
 * Not Found error (404).
 */
export class NotFoundError extends APIError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(message, 404, code);
    this.name = 'NotFoundError';
  }
}

/**
 * Validation error (400 Bad Request).
 */
export class ValidationError extends APIError {
  constructor(
    message = 'Validation failed',
    details?: any,
    code = 'VALIDATION_ERROR'
  ) {
    super(message, 400, code, details);
    this.name = 'ValidationError';
  }
}

/**
 * Conflict error (409).
 * Used when a resource already exists or there's a conflict.
 */
export class ConflictError extends APIError {
  constructor(message = 'Resource conflict', code = 'CONFLICT') {
    super(message, 409, code);
    this.name = 'ConflictError';
  }
}

/**
 * Rate limit exceeded error (429).
 */
export class RateLimitError extends APIError {
  public readonly retryAfter?: number;

  constructor(
    message = 'Rate limit exceeded',
    retryAfter?: number,
    code = 'RATE_LIMIT_EXCEEDED'
  ) {
    super(message, 429, code, { retryAfter });
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Internal Server Error (500).
 */
export class InternalError extends APIError {
  constructor(message = 'Internal server error', code = 'INTERNAL_ERROR') {
    super(message, 500, code);
    this.name = 'InternalError';
  }
}

/**
 * Service Unavailable Error (503).
 */
export class ServiceUnavailableError extends APIError {
  constructor(
    message = 'Service temporarily unavailable',
    code = 'SERVICE_UNAVAILABLE'
  ) {
    super(message, 503, code);
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * Payment Required Error (402).
 */
export class PaymentRequiredError extends APIError {
  constructor(message = 'Payment required', code = 'PAYMENT_REQUIRED') {
    super(message, 402, code);
    this.name = 'PaymentRequiredError';
  }
}

/**
 * Type guard to check if error is an APIError.
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

/**
 * Converts any error to an APIError with appropriate status code.
 */
export function toAPIError(error: unknown): APIError {
  if (isAPIError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new InternalError(error.message);
  }

  return new InternalError('An unknown error occurred');
}

/**
 * Error response format for API endpoints.
 */
export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    statusCode: number;
    details?: any;
  };
}

/**
 * Formats an error for API response.
 */
export function formatErrorResponse(error: unknown): ErrorResponse {
  const apiError = toAPIError(error);

  return {
    error: {
      message: apiError.message,
      code: apiError.code,
      statusCode: apiError.statusCode,
      details: apiError.details,
    },
  };
}
