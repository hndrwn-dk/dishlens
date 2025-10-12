'use client';

import { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Recipe } from '@/types';

interface SwapModalProps {
  recipe: Recipe;
  onClose: () => void;
}

export default function SwapModal({ recipe, onClose }: SwapModalProps) {
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [swapWith, setSwapWith] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSwap = async () => {
    if (!selectedIngredient || !swapWith) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipe,
          swapOut: selectedIngredient,
          swapIn: swapWith,
        }),
      });

      const data = await response.json();
      if (data.recipe) {
        // In a real app, you'd update the recipe in the parent component
        console.log('Swapped recipe:', data.recipe);
        onClose();
      }
    } catch (error) {
      console.error('Error swapping ingredient:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Swap Ingredient</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select ingredient to swap:
            </label>
            <select
              value={selectedIngredient}
              onChange={(e) => setSelectedIngredient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Choose an ingredient...</option>
              {recipe.ingredients.map((ingredient, index) => (
                <option key={index} value={ingredient.item}>
                  {ingredient.item} {ingredient.amount && `(${ingredient.amount})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Replace with:
            </label>
            <input
              type="text"
              value={swapWith}
              onChange={(e) => setSwapWith(e.target.value)}
              placeholder="e.g., chicken, tofu, mushrooms..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSwap}
              disabled={!selectedIngredient || !swapWith || isLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  Swap <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}