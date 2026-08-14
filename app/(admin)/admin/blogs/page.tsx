'use client';

import React, { useState, useEffect } from 'react';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { useToast } from '@/components/admin/feedback/Toast';
import { Drawer } from '@/components/ui/Drawer';
import { blogService } from '@/services';
import { BlogArticle } from '@/domains/blog/model';
import { createBlogArticleAction, updateBlogArticleAction } from './actions';

export default function AdminBlogsPage() {
  const [mounted, setMounted] = useState(false);
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  
  const { toast, error } = useToast();

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Patient Education');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    setMounted(true);
    const loadArticles = async () => {
      const result = await blogService.getArticles(1, 100);
      if (result.isSuccess && result.value) {
        setArticles(result.value.data);
      }
    };
    loadArticles();
  }, []);

  if (!mounted) return null;

  const handleOpenEditor = (article?: BlogArticle) => {
    if (article) {
      setEditingArticleId(article.id);
      setNewTitle(article.title);
      setNewCategory(article.category);
      setNewDescription(article.description);
      setNewImageUrl(article.imageUrl || article.image || '');
      setNewContent(article.content || '');
    } else {
      setEditingArticleId(null);
      setNewTitle('');
      setNewCategory('Patient Education');
      setNewDescription('');
      setNewImageUrl('');
      setNewContent('');
    }
    setIsEditorOpen(true);
  };

  const handlePublish = async () => {
    if (!newTitle) return;
    
    if (editingArticleId) {
      const updates: Partial<BlogArticle> = {
        title: newTitle,
        category: newCategory,
        description: newDescription,
        imageUrl: newImageUrl,
        image: newImageUrl,
        content: newContent,
      };
      
      const result = await updateBlogArticleAction(editingArticleId, updates);
      if (result.success && result.data) {
        setArticles(articles.map(a => a.id === editingArticleId ? result.data! : a));
        setIsEditorOpen(false);
        toast({ title: 'Article Updated', description: 'Your changes have been saved.', variant: 'success' });
      } else {
        error('Update Failed', 'Could not update the article at this time.');
      }
    } else {
      const newArticleData: Omit<BlogArticle, 'id'> = {
        title: newTitle,
        category: newCategory,
        slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        description: newDescription,
        content: newContent,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        authorId: 'admin',
        icon: 'fileText',
        colorPrimary: '#3b82f6',
        colorSecondary: '#bfdbfe',
        status: 'Published',
        author: 'Admin User',
        views: 0,
        imageUrl: newImageUrl,
        image: newImageUrl
      };
      
      const result = await createBlogArticleAction(newArticleData);
      
      if (result.success && result.data) {
        setArticles([result.data, ...articles]);
        setIsEditorOpen(false);
        toast({ title: 'Post Published', description: 'Your blog article is now live.', variant: 'success' });
      } else {
        error('Publishing Failed', 'Could not create the article at this time.');
      }
    }
  };

  return (
    <AdminPageTemplate>
      <div 
        className="admin-page-container w-full max-w-[1600px] mx-auto p-4 lg:p-10 lg:py-8 flex flex-col gap-4 lg:gap-8 min-h-full"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* TOP HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 lg:px-8 lg:py-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 m-0 tracking-tight">Content & Articles</h1>
            <p className="text-[14px] sm:text-[15px] font-medium text-slate-500 mt-1">Create, publish, and manage health insights for the public portal.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={() => handleOpenEditor()}
              className="w-full sm:w-auto h-[44px] px-6 rounded-xl border-none bg-slate-900 text-white text-[14px] font-bold flex items-center justify-center sm:justify-start gap-2 cursor-pointer shadow-[0_4px_12px_rgba(15,23,42,0.15)] transition-transform hover:-translate-y-0.5"
            >
              <AdminIcon name="plus" className="w-[18px] h-[18px]" />
              Write New Article
            </button>
          </div>
        </div>

        {/* DASHBOARD STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          {[
            { label: 'Published Articles', value: articles.filter(a => a.status === 'Published').length.toString(), icon: 'fileText', color: '#3b82f6' },
            { label: 'Drafts in Progress', value: articles.filter(a => a.status === 'Draft').length.toString(), icon: 'edit', color: '#f59e0b' },
            { label: 'Total Views (30d)', value: '12.4K', icon: 'eye', color: '#10b981' },
            { label: 'Avg Read Time', value: '3m 12s', icon: 'clock', color: '#8b5cf6' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 lg:p-6 flex items-center gap-4 shadow-sm">
              <div className="w-[48px] h-[48px] rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                <AdminIcon name={stat.icon as any} className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900 leading-tight">{stat.value}</div>
                <div className="text-[13px] font-semibold text-slate-500 mt-1">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ARTICLES GRID */}
        <div className="bg-white rounded-[24px] border border-slate-200 p-4 lg:p-8 shadow-sm flex-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 lg:mb-6 gap-4">
            <h3 className="text-xl font-extrabold text-slate-900 m-0">Article Library</h3>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <select className="h-9 px-3 rounded-lg border border-slate-200 text-[13px] font-semibold text-slate-600 outline-none bg-slate-50 w-full sm:w-auto">
                <option>All Categories</option>
                <option>Patient Education</option>
                <option>Medical Research</option>
              </select>
              <select className="h-9 px-3 rounded-lg border border-slate-200 text-[13px] font-semibold text-slate-600 outline-none bg-slate-50 w-full sm:w-auto">
                <option>All Statuses</option>
                <option>Published</option>
                <option>Draft</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {articles.map(article => (
              <div 
                key={article.id} 
                className="rounded-2xl border border-slate-200 overflow-hidden bg-white transition-shadow duration-200 hover:shadow-lg hover:shadow-slate-200/50 flex flex-col group relative"
              >
                <div className="h-[180px] w-full relative bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${article.imageUrl || article.image})` }}>
                  <div className={`absolute top-3 left-3 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase ${article.status === 'Published' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                    {article.status}
                  </div>
                  <button 
                    onClick={() => handleOpenEditor(article)}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur text-slate-700 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-slate-200 hover:bg-white"
                  >
                    <AdminIcon name="edit" className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 lg:p-5 flex-1 flex flex-col">
                  <div className="text-[12px] font-bold text-blue-500 uppercase tracking-wider mb-2">
                    {article.category}
                  </div>
                  <h4 className="text-lg font-extrabold text-slate-900 m-0 mb-3 leading-snug line-clamp-2">
                    {article.title}
                  </h4>
                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 text-[10px] font-extrabold flex items-center justify-center text-slate-600">
                        {(article.author || 'A').split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-[13px] font-semibold text-slate-500">{article.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[13px] font-semibold text-slate-400">
                      <AdminIcon name="eye" className="w-3.5 h-3.5" />
                      {article.views}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ARTICLE EDITOR DRAWER */}
      <Drawer open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <Drawer.Content side="right" className="p-0 bg-white sm:w-[600px] w-full flex flex-col h-full max-h-[100dvh]">
          <div className="p-4 lg:p-6 border-b border-slate-200 flex justify-between items-start sm:items-center gap-4 shrink-0">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 m-0">{editingArticleId ? 'Edit Article' : 'Write New Article'}</h2>
              <p className="text-sm text-slate-500 mt-1">{editingArticleId ? 'Update this post and publish changes.' : 'Publish health insights to the public portal.'}</p>
            </div>
            <button onClick={() => setIsEditorOpen(false)} className="bg-transparent border-none cursor-pointer text-slate-400 hover:text-slate-600">
              <AdminIcon name="x" className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4 lg:p-6 flex flex-col gap-4 lg:gap-6 flex-1 overflow-y-auto">
            
            <div>
              <label className="block text-[13px] font-extrabold text-slate-700 mb-2">Article Title</label>
              <input 
                type="text" 
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Importance of Vitamin D Testing" 
                className="w-full h-12 px-4 rounded-xl border border-slate-300 text-sm outline-none font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
              />
            </div>

            <div>
              <label className="block text-[13px] font-extrabold text-slate-700 mb-2">Description / Excerpt</label>
              <textarea 
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                placeholder="Brief summary..." 
                className="w-full h-24 p-4 rounded-xl border border-slate-300 text-sm outline-none font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none" 
              />
            </div>

            <div>
              <label className="block text-[13px] font-extrabold text-slate-700 mb-2">Category</label>
              <select 
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-300 text-sm outline-none bg-white font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option>Patient Education</option>
                <option>Medical Research</option>
                <option>Health & Wellness</option>
                <option>Preventive Care</option>
                <option>Genetics</option>
                <option>Diagnostics</option>
                <option>Guidelines</option>
                <option>Press Release</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-extrabold text-slate-700 mb-2">Cover Image URL</label>
              <input 
                type="text" 
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                placeholder="e.g. /images/blog_heart.png or https://..." 
                className="w-full h-12 px-4 rounded-xl border border-slate-300 text-sm outline-none font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
              />
            </div>

            <div className="flex flex-col flex-1 min-h-[300px]">
              <label className="block text-[13px] font-extrabold text-slate-700 mb-2">Article Content (HTML supported)</label>
              <div className="border border-slate-300 rounded-xl overflow-hidden flex flex-col flex-1">
                <div className="p-2 px-3 bg-slate-50 border-b border-slate-300 flex flex-wrap gap-2">
                  <button type="button" className="w-7 h-7 border-none bg-transparent font-extrabold cursor-pointer hover:bg-slate-200 rounded">B</button>
                  <button type="button" className="w-7 h-7 border-none bg-transparent italic cursor-pointer hover:bg-slate-200 rounded">I</button>
                  <button type="button" className="w-7 h-7 border-none bg-transparent underline cursor-pointer hover:bg-slate-200 rounded">U</button>
                  <div className="w-px h-full bg-slate-300 mx-1" />
                  <button type="button" className="w-7 h-7 border-none bg-transparent cursor-pointer hover:bg-slate-200 rounded text-slate-500 font-bold px-2 w-auto">&lt;h2&gt;</button>
                  <button type="button" className="w-7 h-7 border-none bg-transparent cursor-pointer hover:bg-slate-200 rounded text-slate-500 font-bold px-2 w-auto">&lt;p&gt;</button>
                </div>
                <textarea 
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="<h2>Start writing...</h2><p>Your HTML content goes here.</p>" 
                  className="w-full flex-1 p-4 border-none text-[14px] font-mono outline-none resize-none min-h-[200px] leading-relaxed" 
                />
              </div>
            </div>
            
          </div>
          <div className="p-4 lg:p-6 border-t border-slate-200 bg-slate-50 flex flex-col-reverse sm:flex-row gap-3 justify-end shrink-0">
             <button onClick={() => setIsEditorOpen(false)} className="h-12 px-6 rounded-xl bg-white text-slate-600 text-sm font-extrabold border border-slate-300 cursor-pointer hover:bg-slate-50 w-full sm:w-auto">
              Cancel
            </button>
            <button onClick={handlePublish} className="h-12 px-6 rounded-xl bg-slate-900 text-white text-sm font-extrabold border-none cursor-pointer flex items-center justify-center sm:justify-start gap-2 hover:bg-slate-800 w-full sm:w-auto">
              <AdminIcon name={editingArticleId ? 'save' : 'send'} className="w-4 h-4" />
              {editingArticleId ? 'Save Changes' : 'Publish Article'}
            </button>
          </div>
        </Drawer.Content>
      </Drawer>
    </AdminPageTemplate>
  );
}
