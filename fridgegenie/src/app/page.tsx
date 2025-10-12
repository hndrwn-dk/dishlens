'use client';

import { useState } from 'react';
import { Upload, ChefHat, Clock, Star } from 'lucide-react';
import { DetectedItem, Recipe } from '@/types';
import RecipeCard from '@/components/RecipeCard';
import CookMode from '@/components/CookMode';
import IngredientChips from '@/components/IngredientChips';

export default function Home() {
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cookMode, setCookMode] = useState<Recipe | null>(null);
  const [textInput, setTextInput] = useState('');

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/detect', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setDetectedItems(data.items || []);
    } catch (error) {
      console.error('Error detecting ingredients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('text', textInput);

      const response = await fetch('/api/detect', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setDetectedItems(data.items || []);
      setTextInput('');
    } catch (error) {
      console.error('Error detecting ingredients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecipes = async () => {
    if (detectedItems.length === 0) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: detectedItems }),
      });

      const data = await response.json();
      setRecipes(data.recipes || []);
    } catch (error) {
      console.error('Error generating recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDetectedItems = (items: DetectedItem[]) => {
    setDetectedItems(items);
  };

  if (cookMode) {
    return <CookMode recipe={cookMode} onBack={() => setCookMode(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <ChefHat className="w-10 h-10 text-green-600" />
            FridgeGenie
          </h1>
          <p className="text-gray-600">Turn your fridge into dinner in 20 seconds</p>
        </div>

        {/* Upload Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-4">What's in your fridge?</h2>
            
            {/* Image Upload */}
            <div className="mb-6">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Upload fridge photo</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isLoading}
                />
              </label>
            </div>

            {/* Text Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or type ingredients manually:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="e.g., chicken breast, broccoli, carrots, onion..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={handleTextSubmit}
                  disabled={isLoading || !textInput.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>

            {isLoading && (
              <div className="text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2">Analyzing ingredients...</p>
              </div>
            )}
          </div>
        </div>

        {/* Detected Items */}
        {detectedItems.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Detected Ingredients</h3>
              <IngredientChips 
                items={detectedItems} 
                onUpdate={updateDetectedItems}
              />
              <button
                onClick={generateRecipes}
                disabled={isLoading}
                className="mt-4 w-full bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Generating Recipes...' : 'Generate Recipes'}
              </button>
            </div>
          </div>
        )}

        {/* Recipe Cards */}
        {recipes.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-semibold text-center mb-6">Your Recipe Options</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {recipes.map((recipe, index) => (
                <RecipeCard
                  key={index}
                  recipe={recipe}
                  onCookNow={() => setCookMode(recipe)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}