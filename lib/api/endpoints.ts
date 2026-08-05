/**
 * Centralized endpoint definitions.
 * This ensures no hardcoded URLs exist within components or domain layers.
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  BLOG: {
    LIST: '/blog/articles',
    DETAIL: (slug: string) => `/blog/articles/${slug}`,
    CATEGORIES: '/blog/categories',
  },
  SERVICES: {
    LIST: '/services',
    DETAIL: (slug: string) => `/services/${slug}`,
  },
  PACKAGES: {
    LIST: '/packages',
    DETAIL: (slug: string) => `/packages/${slug}`,
  },
  BOOKING: {
    CREATE: '/bookings',
    STATUS: (id: string) => `/bookings/${id}`,
  },
  REPORTS: {
    LIST: '/reports',
    DOWNLOAD: (id: string) => `/reports/${id}/download`,
  },
} as const;
