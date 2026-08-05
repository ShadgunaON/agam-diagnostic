/**
 * Base Application Error
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(message: string, code = 'APP_ERROR', status = 500, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Network error occurred', details?: unknown) {
    super(message, 'NETWORK_ERROR', 0, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden access') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 'NOT_FOUND', 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 'CONFLICT', 409);
  }
}

export class ServerError extends AppError {
  constructor(message = 'Internal server error', details?: unknown) {
    super(message, 'SERVER_ERROR', 500, details);
  }
}

export class UnknownError extends AppError {
  constructor(message = 'An unknown error occurred', details?: unknown) {
    super(message, 'UNKNOWN_ERROR', 500, details);
  }
}
