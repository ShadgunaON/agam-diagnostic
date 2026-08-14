'use server';

import { blogService } from '@/services';
import { BlogArticle } from '@/domains/blog/model';
import { revalidatePath } from 'next/cache';

export async function createBlogArticleAction(articleData: Omit<BlogArticle, 'id'>) {
  const result = await blogService.createArticle(articleData);
  revalidatePath('/blog');
  revalidatePath('/admin/blogs');
  
  if (result.isSuccess) {
    return { success: true, data: result.value };
  }
  return { success: false, error: 'Failed to create' };
}

export async function updateBlogArticleAction(id: string, updates: Partial<BlogArticle>) {
  const result = await blogService.updateArticle(id, updates);
  revalidatePath('/blog');
  revalidatePath(`/blog/${id}`);
  revalidatePath('/admin/blogs');
  
  if (result.isSuccess) {
    return { success: true, data: result.value };
  }
  return { success: false, error: 'Failed to update' };
}
