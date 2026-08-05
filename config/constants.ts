/**
 * Global business constants.
 */
export const constants = {
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
  seo: {
    titleTemplate: '%s | Agam Diagnostics',
    defaultDescription: 'Advancing healthcare through innovative diagnostic solutions and precision medicine.',
  },
  contact: {
    phone: '+91 89408 94079',
    email: 'contact@agamdiagnostics.com',
    whatsapp: '918940894079',
  },
} as const;
