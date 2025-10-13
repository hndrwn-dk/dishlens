'use client';

import { useState } from 'react';
import { Upload, ChefHat } from 'lucide-react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [detectedItems, setDetectedItems] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setDetectedItems([]);
    
    try {
      console.log('📤 Uploading image:', file.name, file.size, 'bytes');
      
      const formData = new FormData();
      formData.append('image', file);

      console.log('🌐 Calling /api/detect...');
      const response = await fetch('/api/detect', {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        alert(`Error: ${errorData.error || 'Upload failed'}`);
        return;
      }

      const data = await response.json();
      console.log('✅ Detection result:', data);
      
      setDetectedItems(data.items || []);
      
      if (!data.items || data.items.length === 0) {
        alert('No ingredients detected. Try a clearer photo of your fridge contents.');
      }
      
    } catch (error) {
      console.error('💥 Error detecting ingredients:', error);
      alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <ChefHat className="w-10 h-10 text-green-600" />
            DishLens
          </h1>
          <p className="text-gray-600">Turn your fridge into dinner in 20 seconds</p>
        </div>

        {/* Upload Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-4">What&apos;s in your fridge?</h2>
            
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
              <div className="flex flex-wrap gap-2 mb-4">
                {detectedItems.map((item, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm"
                  >
                    {item.name} ({(item.confidence * 100).toFixed(0)}%)
                  </span>
                ))}
              </div>
              <button
                onClick={generateRecipes}
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
                  <h4 className="font-semibold text-lg mb-2">{recipe.title}</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {recipe.total_time_min} min • {recipe.difficulty} • Score: {recipe.score?.total || 'N/A'}
                  </p>
                  <div className="text-sm">
                    <p className="font-medium mb-2">Ingredients:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {recipe.ingredients?.slice(0, 4).map((ingredient: any, i: number) => (
                        <li key={i}>{ingredient.item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}