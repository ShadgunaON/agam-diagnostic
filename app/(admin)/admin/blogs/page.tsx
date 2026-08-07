'use client';

import React, { useState } from 'react';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { useToast } from '@/components/admin/feedback/Toast';
import { Drawer } from '@/components/ui/Drawer';

type Article = {
  id: string;
  title: string;
  category: string;
  status: 'Published' | 'Draft';
  author: string;
  date: string;
  views: number;
  image: string;
};

const initialArticles: Article[] = [
  {
    id: '1',
    title: 'Understanding Your Complete Blood Count (CBC) Results',
    category: 'Patient Education',
    status: 'Published',
    author: 'Dr. Sarah Jenkins',
    date: 'Aug 1, 2026',
    views: 1240,
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '2',
    title: 'The Future of Molecular Diagnostics in Preventive Care',
    category: 'Medical Research',
    status: 'Published',
    author: 'Dr. Robert Wilson',
    date: 'Jul 28, 2026',
    views: 890,
    image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '3',
    title: 'Preparing for Your Fasting Lipid Profile: What to Know',
    category: 'Guidelines',
    status: 'Draft',
    author: 'Editorial Team',
    date: 'Aug 5, 2026',
    views: 0,
    image: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&fit=crop&w=600&q=80'
  }
];

export default function AdminBlogsPage() {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { toast } = useToast();

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Patient Education');

  const handlePublish = () => {
    if (!newTitle) return;
    const newArticle: Article = {
      id: Math.random().toString(),
      title: newTitle,
      category: newCategory,
      status: 'Published',
      author: 'Admin User',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      views: 0,
      image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=600&q=80'
    };
    
    setArticles([newArticle, ...articles]);
    setIsEditorOpen(false);
    setNewTitle('');
    toast({ title: 'Post Published', description: 'Your blog article is now live.', variant: 'success' });
  };

  return (
    <AdminPageTemplate>
      <div 
        style={{ 
          maxWidth: '1600px', 
          width: '100%',
          margin: '0 auto', 
          padding: '32px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          minHeight: '100%',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}
      >
        {/* TOP HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: '24px 32px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Content & Articles</h1>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#64748b', margin: '4px 0 0 0' }}>Create, publish, and manage health insights for the public portal.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => setIsEditorOpen(true)}
              style={{ 
                height: '44px', padding: '0 24px', borderRadius: '12px', border: 'none', 
                backgroundColor: '#0f172a', color: '#ffffff', 
                fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)', transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              <AdminIcon name="plus" style={{ width: '18px', height: '18px' }} />
              Write New Article
            </button>
          </div>
        </div>

        {/* DASHBOARD STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {[
            { label: 'Published Articles', value: articles.filter(a => a.status === 'Published').length.toString(), icon: 'fileText', color: '#3b82f6' },
            { label: 'Drafts in Progress', value: articles.filter(a => a.status === 'Draft').length.toString(), icon: 'edit', color: '#f59e0b' },
            { label: 'Total Views (30d)', value: '12.4K', icon: 'eye', color: '#10b981' },
            { label: 'Avg Read Time', value: '3m 12s', icon: 'clock', color: '#8b5cf6' },
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AdminIcon name={stat.icon as any} style={{ width: '24px', height: '24px' }} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{stat.value}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginTop: '4px' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ARTICLES GRID */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Article Library</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select style={{ height: '36px', padding: '0 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 600, color: '#475569', outline: 'none', backgroundColor: '#f8fafc' }}>
                <option>All Categories</option>
                <option>Patient Education</option>
                <option>Medical Research</option>
              </select>
              <select style={{ height: '36px', padding: '0 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 600, color: '#475569', outline: 'none', backgroundColor: '#f8fafc' }}>
                <option>All Statuses</option>
                <option>Published</option>
                <option>Draft</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {articles.map(article => (
              <div 
                key={article.id} 
                style={{ 
                  borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', backgroundColor: '#ffffff',
                  transition: 'box-shadow 0.2s', cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ height: '180px', width: '100%', backgroundImage: `url(${article.image})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: article.status === 'Published' ? '#10b981' : '#f59e0b', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>
                    {article.status}
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    {article.category}
                  </div>
                  <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {article.title}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#f1f5f9', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                        {article.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>{article.date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>
                      <AdminIcon name="eye" style={{ width: '14px', height: '14px' }} />
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
        <Drawer.Content side="right" className="p-0 bg-white sm:w-[600px] w-full flex flex-col">
          <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Write New Article</h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Publish health insights to the public portal.</p>
            </div>
            <button onClick={() => setIsEditorOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <AdminIcon name="x" style={{ width: '24px', height: '24px' }} />
            </button>
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, overflowY: 'auto' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>Article Title</label>
              <input 
                type="text" 
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Importance of Vitamin D Testing" 
                style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', fontWeight: 600 }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>Category</label>
              <select 
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#ffffff', fontWeight: 600 }}
              >
                <option>Patient Education</option>
                <option>Medical Research</option>
                <option>Guidelines</option>
                <option>Press Release</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>Cover Image URL</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="text" 
                  disabled
                  defaultValue="https://images.unsplash.com/auto=format&fit=crop" 
                  style={{ flex: 1, height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px dashed #cbd5e1', fontSize: '13px', outline: 'none', backgroundColor: '#f8fafc', color: '#94a3b8' }} 
                />
                <button style={{ padding: '0 20px', height: '48px', borderRadius: '12px', backgroundColor: '#f1f5f9', border: 'none', fontSize: '13px', fontWeight: 700, color: '#475569' }}>Browse</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>Article Content</label>
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ padding: '8px 12px', backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1', display: 'flex', gap: '8px' }}>
                  <button style={{ width: '28px', height: '28px', border: 'none', background: 'none', fontWeight: 800, cursor: 'pointer' }}>B</button>
                  <button style={{ width: '28px', height: '28px', border: 'none', background: 'none', fontStyle: 'italic', cursor: 'pointer' }}>I</button>
                  <button style={{ width: '28px', height: '28px', border: 'none', background: 'none', textDecoration: 'underline', cursor: 'pointer' }}>U</button>
                  <div style={{ width: '1px', height: '100%', backgroundColor: '#cbd5e1', margin: '0 4px' }} />
                  <button style={{ width: '28px', height: '28px', border: 'none', background: 'none', cursor: 'pointer' }}>🔗</button>
                </div>
                <textarea 
                  placeholder="Start writing..." 
                  style={{ width: '100%', flex: 1, padding: '16px', border: 'none', fontSize: '14px', outline: 'none', resize: 'none', minHeight: '200px', lineHeight: 1.6 }} 
                />
              </div>
            </div>
            
          </div>
          <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
             <button onClick={() => setIsEditorOpen(false)} style={{ height: '48px', padding: '0 24px', borderRadius: '12px', backgroundColor: '#ffffff', color: '#475569', fontSize: '14px', fontWeight: 800, border: '1px solid #cbd5e1', cursor: 'pointer' }}>
              Save as Draft
            </button>
            <button onClick={handlePublish} style={{ height: '48px', padding: '0 24px', borderRadius: '12px', backgroundColor: '#0f172a', color: '#ffffff', fontSize: '14px', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AdminIcon name="send" style={{ width: '16px', height: '16px' }} />
              Publish Article
            </button>
          </div>
        </Drawer.Content>
      </Drawer>
    </AdminPageTemplate>
  );
}
