/**
 * A generic Result type for handling successes and failures without throwing exceptions.
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

export class Success<T> {
  public readonly isSuccess = true;
  public readonly isFailure = false;

  constructor(public readonly value: T) {}
}

export class Failure<E> {
  public readonly isSuccess = false;
  public readonly isFailure = true;

  constructor(public readonly error: E) {}
}

/**
 * Utility functions for creating Result instances.
 */
export const success = <T>(value: T): Success<T> => new Success(value);
export const failure = <E>(error: E): Failure<E> => new Failure(error);
