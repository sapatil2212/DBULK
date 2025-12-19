export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export function successResponse<T>(data: T, meta?: APIResponse['meta']): APIResponse<T> {
  return {
    success: true,
    data,
    meta,
  };
}

export function errorResponse(code: string, message: string): APIResponse {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}

export function handleError(error: unknown): APIResponse {
  if (error instanceof AppError) {
    return errorResponse(error.code, error.message);
  }

  if (error instanceof Error) {
    console.error('Unhandled error:', error);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred');
  }

  return errorResponse('UNKNOWN_ERROR', 'An unknown error occurred');
}
