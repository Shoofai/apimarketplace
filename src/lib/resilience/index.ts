import { CircuitBreaker } from './circuit-breaker';

export { CircuitBreaker } from './circuit-breaker';
export type { CircuitState, CircuitBreakerOptions } from './circuit-breaker';

export const stripeBreaker = new CircuitBreaker('stripe', {
  failureThreshold: 5,
  resetTimeoutMs: 30_000,
  halfOpenMaxAttempts: 2,
});

export const kongBreaker = new CircuitBreaker('kong', {
  failureThreshold: 3,
  resetTimeoutMs: 15_000,
  halfOpenMaxAttempts: 1,
});

export const resendBreaker = new CircuitBreaker('resend', {
  failureThreshold: 5,
  resetTimeoutMs: 60_000,
  halfOpenMaxAttempts: 2,
});
