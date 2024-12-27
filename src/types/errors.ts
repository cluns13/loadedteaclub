export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class LocationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'LOCATION_ERROR', 400, details);
    this.name = 'LocationError';
  }
}

export class PlacesError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'PLACES_ERROR', 400, details);
    this.name = 'PlacesError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'AUTH_ERROR', 401, details);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'NOT_FOUND', 404, details);
    this.name = 'NotFoundError';
  }
}

export type ErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
