/**
 * Application Configuration
 * Environment variables are prefixed with VITE_ to be exposed to the client
 */

export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
} as const;

