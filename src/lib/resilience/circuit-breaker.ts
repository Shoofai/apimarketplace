import { logger } from '@/lib/utils/logger';
import { ServiceUnavailableError } from '@/lib/utils/errors';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold: number;   // failures before opening
  resetTimeoutMs: number;     // ms before trying half-open
  halfOpenMaxAttempts: number; // attempts in half-open before re-opening
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private halfOpenAttempts = 0;

  constructor(
    private readonly name: string,
    private readonly options: CircuitBreakerOptions
  ) {}

  get currentState(): CircuitState { return this.state; }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.options.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
        this.halfOpenAttempts = 0;
        logger.info(`Circuit breaker ${this.name}: OPEN -> HALF_OPEN`);
      } else {
        throw new ServiceUnavailableError(`${this.name} service is temporarily unavailable (circuit open)`);
      }
    }

    if (this.state === 'HALF_OPEN' && this.halfOpenAttempts >= this.options.halfOpenMaxAttempts) {
      this.state = 'OPEN';
      this.lastFailureTime = Date.now();
      logger.warn(`Circuit breaker ${this.name}: HALF_OPEN -> OPEN (max attempts)`);
      throw new ServiceUnavailableError(`${this.name} service is temporarily unavailable`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.failureCount = 0;
      logger.info(`Circuit breaker ${this.name}: HALF_OPEN -> CLOSED`);
    }
    this.failureCount = 0;
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.state === 'HALF_OPEN') {
      this.halfOpenAttempts++;
    }
    if (this.failureCount >= this.options.failureThreshold) {
      this.state = 'OPEN';
      logger.warn(`Circuit breaker ${this.name}: -> OPEN (failures: ${this.failureCount})`);
    }
  }

  /** For health endpoint reporting */
  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime).toISOString() : null,
    };
  }
}
