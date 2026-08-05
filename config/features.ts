import { env } from './env';

/**
 * Feature flag configuration.
 * Prepares the application for future A/B testing or gradual rollouts
 * without introducing any runtime provider dependencies.
 */
export const features = {
  /** Enables the new user dashboard / reports section */
  enableUserDashboard: false,
  
  /** Enables online payment processing during booking */
  enableOnlinePayments: false,
  
  /** Enables user authentication flows */
  enableAuth: false,
  
  /** Example of environment-driven flag */
  enableDebugTools: env.isDevelopment,
} as const;
