import React from 'react';
import { ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';
import { AdminButton } from '../primitives/AdminButton';

interface AdminArrayEditorProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number, onChangeItem: (updated: T) => void) => React.ReactNode;
  defaultNewItem: T;
  addButtonText?: string;
  itemTitle?: (item: T, index: number) => string;
}

export function AdminArrayEditor<T>({ 
  items, 
  onChange, 
  renderItem, 
  defaultNewItem, 
  addButtonText = 'Add Item',
  itemTitle
}: AdminArrayEditorProps<T>) {
  
  const handleAdd = () => {
    onChange([...items, { ...defaultNewItem }]);
  };

  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    onChange(newItems);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    onChange(newItems);
  };

  const handleChangeItem = (index: number, updatedItem: T) => {
    const newItems = [...items];
    newItems[index] = updatedItem;
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-md bg-white shadow-sm">
          <div className="bg-gray-50 border-b border-gray-200 p-3 flex justify-between items-center rounded-t-md">
            <h5 className="font-medium text-sm text-gray-700">
              {itemTitle ? itemTitle(item, index) : `Item ${index + 1}`}
            </h5>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move Up"
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleMoveDown(index)}
                disabled={index === items.length - 1}
                className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move Down"
              >
                <ChevronDown size={16} />
              </button>
              <div className="w-px h-4 bg-gray-300 mx-1"></div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                title="Remove Item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="p-4">
            {renderItem(item, index, (updated) => handleChangeItem(index, updated))}
          </div>
        </div>
      ))}
      
      {items.length === 0 && (
        <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 text-sm">
          No items added yet.
        </div>
      )}

      <div className="pt-2">
        <AdminButton variant="secondary" onClick={handleAdd} className="flex items-center gap-2">
          <Plus size={16} />
          {addButtonText}
        </AdminButton>
      </div>
    </div>
  );
}
