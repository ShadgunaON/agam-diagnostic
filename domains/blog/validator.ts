/**
 * Placeholder for domain validation logic.
 * In the future, this can be implemented using Zod, Yup, or generic TS checks.
 */
export const BlogValidators = {
  isValidSlug: (slug: string): boolean => {
    return /^[a-z0-9-]+$/.test(slug);
  },
};
