'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateBlogCache(id?: string) {
  revalidatePath('/blog');
  revalidatePath('/admin/blogs');
  if (id) {
    revalidatePath(`/blog/${id}`);
  }
  return { success: true };
}
