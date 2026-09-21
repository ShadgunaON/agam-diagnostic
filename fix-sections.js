const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'app', '(admin)', 'admin', 'website', 'pages', 'health-packages', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const categoryCode = `
      case 'category':
        return (
          <div className="space-y-6">
            <SectionHeader
              title="Category Section"
              description="Intro text before the categories."
            />
            <CMSSectionContainer
              title="Visibility Control"
              rightElement={<VisibilityToggle value={content.category?.isVisible ?? true} onChange={(v) => updateSection('category', 'isVisible', v)} />}
            />
            
            <CMSSectionContainer title="Content">
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <AdminInput
                    label="Eyebrow"
                    value={content.category?.eyebrow || ''}
                    onChange={(val) => updateSection('category', 'eyebrow', val)}
                  />
                  <AdminInput
                    label="Title"
                    value={content.category?.title || ''}
                    onChange={(val) => updateSection('category', 'title', val)}
                  />
                </div>
                <AdminTextarea
                  label="Description"
                  value={content.category?.description || ''}
                  onChange={(val) => updateSection('category', 'description', val)}
                  rows={2}
                />
              </div>
            </CMSSectionContainer>
          </div>
        );
`;

const advantageCode = `
      case 'advantage':
        return (
          <div className="space-y-6">
            <SectionHeader
              title="Advantage Section"
              description="Why choose AGAM for Health Packages."
            />
            <CMSSectionContainer
              title="Visibility Control"
              rightElement={<VisibilityToggle value={content.advantage?.isVisible ?? true} onChange={(v) => updateSection('advantage', 'isVisible', v)} />}
            />
            
            <CMSSectionContainer title="Content">
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <AdminInput
                    label="Eyebrow"
                    value={content.advantage?.eyebrow || ''}
                    onChange={(val) => updateSection('advantage', 'eyebrow', val)}
                  />
                  <AdminInput
                    label="Title"
                    value={content.advantage?.title || ''}
                    onChange={(val) => updateSection('advantage', 'title', val)}
                  />
                </div>
                <AdminTextarea
                  label="Description"
                  value={content.advantage?.description || ''}
                  onChange={(val) => updateSection('advantage', 'description', val)}
                  rows={2}
                />
              </div>
            </CMSSectionContainer>
            
            <CMSSectionContainer title="Advantage Features">
              <div className="p-5 space-y-6">
                {content.advantage?.items?.map((item, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative group">
                    <button 
                      onClick={() => removeItem('advantage', 'items', idx)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid gap-4 mt-2">
                      <div className="grid grid-cols-[auto_1fr] gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                          <AdminIconPicker 
                            value={item.icon || 'award'} 
                            onChange={(val) => updateItem('advantage', 'items', idx, 'icon', val)} 
                          />
                        </div>
                        <AdminInput
                          label="Title"
                          value={item.title || ''}
                          onChange={(val) => updateItem('advantage', 'items', idx, 'title', val)}
                        />
                      </div>
                      <AdminTextarea
                        label="Description"
                        value={item.description || ''}
                        onChange={(val) => updateItem('advantage', 'items', idx, 'description', val)}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                <AdminButton 
                  variant="secondary" 
                  onClick={() => addItem('advantage', 'items', { title: 'New Advantage', description: '', icon: 'shield' })}
                  className="w-full justify-center border-dashed"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Advantage Feature
                </AdminButton>
              </div>
            </CMSSectionContainer>
          </div>
        );
`;

content = content.replace("case 'featured':", categoryCode + '\n' + advantageCode + "\n      case 'featured':");

fs.writeFileSync(filePath, content);
console.log('Added missing sections');
