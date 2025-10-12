'use client';

import { useState } from 'react';
import { X, Edit3 } from 'lucide-react';
import { DetectedItem } from '@/types';

interface IngredientChipsProps {
  items: DetectedItem[];
  onUpdate: (items: DetectedItem[]) => void;
}

export default function IngredientChips({ items, onUpdate }: IngredientChipsProps) {
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (index: number) => {
    setEditingItem(index);
    setEditValue(items[index].name);
  };

  const handleSave = () => {
    if (editingItem !== null && editValue.trim()) {
      const updatedItems = [...items];
      updatedItems[editingItem] = { ...updatedItems[editingItem], name: editValue.trim() };
      onUpdate(updatedItems);
    }
    setEditingItem(null);
    setEditValue('');
  };

  const handleRemove = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onUpdate(updatedItems);
  };

  const handleAdd = () => {
    if (editValue.trim()) {
      const newItem: DetectedItem = {
        name: editValue.trim(),
        confidence: 1.0,
        qty_guess: '',
        form: 'fresh'
      };
      onUpdate([...items, newItem]);
      setEditValue('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Chips */}
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm"
          >
            {editingItem === index ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                className="bg-transparent border-none outline-none text-sm"
                autoFocus
              />
            ) : (
              <>
                <span className="font-medium">{item.name}</span>
                {item.qty_guess && (
                  <span className="text-green-600">({item.qty_guess})</span>
                )}
                <button
                  onClick={() => handleEdit(index)}
                  className="text-green-600 hover:text-green-700"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleRemove(index)}
                  className="text-green-600 hover:text-green-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add New Item */}
      <div className="flex gap-2">
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add ingredient..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <button
          onClick={handleAdd}
          disabled={!editValue.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>
    </div>
  );
}