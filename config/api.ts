export const apiConfig = {
  /**
   * The base URL for the backend API.
   * This should be driven by the environment.
   */
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  
  /**
   * Default timeout in milliseconds for all API requests.
   */
  timeout: 10000,
  
  /**
   * Default headers to attach to all requests.
   */
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};
