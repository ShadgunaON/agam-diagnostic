/**
 * Centralized application routing constants.
 * These map directly to the Next.js App Router folders.
 */
export const routes = {
  home: '/',
  about: '/about',
  contact: '/contact',
  faq: '/faq',
  privacyPolicy: '/privacy-policy',
  terms: '/terms',
  
  auth: {
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
  },
  
  blog: {
    index: '/blog',
    detail: (slug: string) => `/blog/${slug}`,
  },
  
  services: {
    index: '/services',
    detail: (slug: string) => `/services/${slug}`,
  },
  
  packages: {
    index: '/health-packages',
    detail: (slug: string) => `/health-packages/${slug}`,
  },
  
  booking: {
    index: '/book',
    success: (id: string) => `/book/success/${id}`,
  },
  
  reports: {
    index: '/reports',
    detail: (id: string) => `/reports/${id}`,
  },
} as const;
