'use client';

import { useState, useEffect } from 'react';
import { Upload, ChefHat, X, Image as ImageIcon, UtensilsCrossed, Apple, Fish, Egg, Milk, Wheat, Beef, Carrot, Leaf, Pizza, Clock, Play, Pause, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [detectedItems, setDetectedItems] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [cookingRecipe, setCookingRecipe] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadSectionCollapsed, setUploadSectionCollapsed] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Preview the uploaded image
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsLoading(true);
    setDetectedItems([]);
    setShowUploadModal(false);
    
    try {
      console.log('Uploading image:', file.name, file.size, 'bytes');
      
      const formData = new FormData();
      formData.append('image', file);

      console.log('Calling /api/detect...');
      const response = await fetch('/api/detect', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        alert(`Error: ${errorData.error || 'Upload failed'}`);
        return;
      }

      const data = await response.json();
      console.log('Detection result:', data);
      
      setDetectedItems(data.items || []);
      
      if (!data.items || data.items.length === 0) {
        alert('No ingredients detected. Try a clearer photo of your fridge contents.');
      }
      
    } catch (error) {
      console.error('Error detecting ingredients:', error);
      alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const startCooking = (recipe: any) => {
    setCookingRecipe(recipe);
    setCurrentStep(0);
    setCompletedSteps(new Set());
  };

  const nextStep = () => {
    if (cookingRecipe && currentStep < cookingRecipe.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleStepComplete = (stepIndex: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepIndex)) {
      newCompleted.delete(stepIndex);
    } else {
      newCompleted.add(stepIndex);
    }
    setCompletedSteps(newCompleted);
  };

  const finishCooking = () => {
    setCookingRecipe(null);
    setCurrentStep(0);
    setCompletedSteps(new Set());
    stopTimer();
  };

  const startTimer = () => {
    if (timerInterval) return;
    setTimerRunning(true);
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const pauseTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
      setTimerRunning(false);
    }
  };

  const resetTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setTimer(0);
    setTimerRunning(false);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setTimer(0);
    setTimerRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getIngredientIcon = (ingredientName: string) => {
    const name = ingredientName.toLowerCase();
    
    if (name.includes('meat') || name.includes('beef') || name.includes('gosht') || name.includes('rendang') || name.includes('chicken') || name.includes('pork') || name.includes('lamb')) {
      return Beef;
    }
    if (name.includes('fish') || name.includes('salmon') || name.includes('tuna') || name.includes('seafood') || name.includes('shrimp')) {
      return Fish;
    }
    if (name.includes('egg')) {
      return Egg;
    }
    if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') || name.includes('cream') || name.includes('butter')) {
      return Milk;
    }
    if (name.includes('rice') || name.includes('wheat') || name.includes('bread') || name.includes('pasta') || name.includes('noodle') || name.includes('grain')) {
      return Wheat;
    }
    if (name.includes('carrot') || name.includes('potato') || name.includes('onion') || name.includes('garlic') || name.includes('tomato') || name.includes('pepper') || name.includes('vegetable')) {
      return Carrot;
    }
    if (name.includes('lettuce') || name.includes('spinach') || name.includes('cabbage') || name.includes('kale') || name.includes('herb') || name.includes('leaf') || name.includes('green')) {
      return Leaf;
    }
    if (name.includes('apple') || name.includes('fruit') || name.includes('banana') || name.includes('orange') || name.includes('berry')) {
      return Apple;
    }
    if (name.includes('condiment') || name.includes('sauce') || name.includes('spice') || name.includes('seasoning')) {
      return Pizza;
    }
    
    return UtensilsCrossed;
  };

  const generateRecipes = async () => {
    if (detectedItems.length === 0) return;

    setIsLoading(true);
    setRecipes([]);
    
    try {
      console.log('Generating recipes for detected items:', detectedItems);
      
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: detectedItems }),
      });

      console.log('Recipe API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Recipe API error:', errorData);
        alert(`Failed to generate recipes: ${errorData.error || 'Unknown error'}`);
        return;
      }

      const data = await response.json();
      console.log('Received recipes:', data.recipes);
      
      if (!data.recipes || data.recipes.length === 0) {
        alert('No recipes could be generated. Please try again.');
        return;
      }
      
      setRecipes(data.recipes || []);
    } catch (error) {
      console.error('Error generating recipes:', error);
      alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300">
            {/* Header - Always visible */}
            <div className="p-8 pb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">What&apos;s in your fridge?</h2>
              {uploadedImage && (
                <button
                  onClick={() => setUploadSectionCollapsed(!uploadSectionCollapsed)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {uploadSectionCollapsed ? (
                    <ChevronDown className="w-6 h-6" />
                  ) : (
                    <ChevronUp className="w-6 h-6" />
                  )}
                </button>
              )}
            </div>

            {/* Collapsible content */}
            {!uploadSectionCollapsed && (
              <div className="px-8 pb-8">
                {/* Uploaded Image Preview */}
                {uploadedImage && (
                  <div className="mb-6">
                    <img
                      src={uploadedImage}
                      alt="Uploaded fridge contents"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Image Upload Button */}
                <button
                  onClick={() => setShowUploadModal(true)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {uploadedImage ? 'Upload another photo' : 'Upload fridge photo'}
                  </span>
                </button>

                {isLoading && (
                  <div className="text-center text-gray-500 mt-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2">Analyzing ingredients...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Upload images</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="mb-2">
                    <span className="text-sm text-gray-600 underline">Click to upload</span>
                    <span className="text-sm text-gray-600"> or Drag & Drop</span>
                  </div>
                  <p className="text-xs text-gray-400">Supported formats: .jpeg, .png</p>
                  <p className="text-xs text-gray-400">Maximum file size of 12MB.</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageUpload}
                  disabled={isLoading}
                />
              </label>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Recent</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detected Items */}
        {detectedItems.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Detected Ingredients</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {detectedItems.map((item, index) => {
                  const IconComponent = getIngredientIcon(item.name);
                  return (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm flex items-center gap-2"
                    >
                      <IconComponent className="w-4 h-4" />
                      {item.name} ({(item.confidence * 100).toFixed(0)}%)
                    </span>
                  );
                })}
              </div>
              <button
                onClick={generateRecipes}
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* Recipe Image */}
                  <div className="w-full h-48 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                    {recipe.image_url ? (
                      <img 
                        src={recipe.image_url} 
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ChefHat className="w-16 h-16 text-green-600 opacity-50" />
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h4 className="font-semibold text-lg mb-2">{recipe.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {recipe.total_time_min} min • {recipe.difficulty} • Score: {recipe.score?.total || 'N/A'}
                    </p>
                    <div className="text-sm mb-4">
                      <p className="font-medium mb-2">Ingredients:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {recipe.ingredients?.slice(0, 4).map((ingredient: any, i: number) => (
                          <li key={i}>{ingredient.item}</li>
                        ))}
                        {recipe.ingredients && recipe.ingredients.length > 4 && (
                          <li className="text-gray-500">+{recipe.ingredients.length - 4} more...</li>
                        )}
                      </ul>
                    </div>
                    <button
                      onClick={() => startCooking(recipe)}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ChefHat className="w-4 h-4" />
                      Start Cooking
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cooking Mode */}
        {cookingRecipe && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <ChefHat className="w-7 h-7 text-green-600" />
                    {cookingRecipe.title}
                  </h2>
                  <button
                    onClick={finishCooking}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Step {currentStep + 1} of {cookingRecipe.steps?.length || 0}</span>
                    <span>{Math.round(((currentStep + 1) / (cookingRecipe.steps?.length || 1)) * 100)}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / (cookingRecipe.steps?.length || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Timer */}
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Cooking Timer</p>
                        <p className="text-2xl font-bold text-gray-800">{formatTime(timer)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!timerRunning ? (
                        <button
                          onClick={startTimer}
                          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          title="Start Timer"
                        >
                          <Play className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={pauseTimer}
                          className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                          title="Pause Timer"
                        >
                          <Pause className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={resetTimer}
                        className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        title="Reset Timer"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Current Step */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Current Step:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800">{cookingRecipe.steps?.[currentStep] || 'No steps available'}</p>
                  </div>
                </div>

                {/* All Steps */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">All Steps:</h3>
                  <div className="space-y-2">
                    {(cookingRecipe.steps || []).map((step: string, index: number) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          index === currentStep
                            ? 'border-green-500 bg-green-50'
                            : completedSteps.has(index)
                            ? 'border-green-300 bg-green-25'
                            : 'border-gray-200 bg-white'
                        }`}
                        onClick={() => setCurrentStep(index)}
                      >
                        <div className="flex items-start">
                          <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                            {index + 1}
                          </span>
                          <p className="text-sm text-gray-700">{step}</p>
                          {completedSteps.has(index) && (
                            <span className="ml-auto text-green-600">✓</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                  
                  <button
                    onClick={() => toggleStepComplete(currentStep)}
                    className={`px-4 py-2 rounded-lg ${
                      completedSteps.has(currentStep)
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {completedSteps.has(currentStep) ? '✓ Completed' : 'Mark Complete'}
                  </button>
                  
                  <button
                    onClick={nextStep}
                    disabled={currentStep >= (cookingRecipe.steps?.length || 1) - 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}