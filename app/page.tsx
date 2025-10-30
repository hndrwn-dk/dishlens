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
    resetTimer(); // Reset timer when starting to cook
  };

  const nextStep = () => {
    if (cookingRecipe && currentStep < cookingRecipe.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      resetTimer(); // Reset timer when moving to next step
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      resetTimer(); // Reset timer when moving to previous step
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

  const extractTimeFromStep = (stepText: string): number | null => {
    // Extract time in minutes from step text like "10 minutes", "5 mins", "2-3 minutes", etc.
    const patterns = [
      /(\d+)[\s-]*(?:to|-)[\s-]*(\d+)\s*(?:minute|min|mins)/i,
      /(\d+)\s*(?:minute|min|mins)/i,
    ];

    for (const pattern of patterns) {
      const match = stepText.match(pattern);
      if (match) {
        const time = parseInt(match[1]);
        return time * 60; // Convert to seconds
      }
    }
    return null;
  };

  const currentStepHasTimer = () => {
    if (!cookingRecipe?.steps?.[currentStep]) return false;
    return extractTimeFromStep(cookingRecipe.steps[currentStep]) !== null;
  };

  const getSuggestedTimeForStep = () => {
    if (!cookingRecipe?.steps?.[currentStep]) return 0;
    const timeInSeconds = extractTimeFromStep(cookingRecipe.steps[currentStep]);
    return timeInSeconds || 0;
  };

  const setTimerToSuggested = () => {
    const suggested = getSuggestedTimeForStep();
    if (suggested > 0) {
      resetTimer();
      setTimer(0);
    }
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
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Detected Ingredients</h3>
                <span className="text-sm text-gray-500">{detectedItems.length} items found</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {detectedItems.map((item, index) => {
                  const IconComponent = getIngredientIcon(item.name);
                  return (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-3 flex items-center gap-3 hover:shadow-md transition-shadow"
                    >
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <IconComponent className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm capitalize truncate">{item.name}</p>
                        <p className="text-xs text-green-700">{(item.confidence * 100).toFixed(0)}% match</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button
                onClick={generateRecipes}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3.5 px-6 rounded-xl font-bold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating Recipes...
                  </>
                ) : (
                  <>
                    <ChefHat className="w-5 h-5" />
                    Generate Recipes
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Recipe Cards */}
        {recipes.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8">Your Recipe Options</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {recipes.map((recipe, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100">
                  {/* Recipe Image */}
                  <div className="relative w-full h-56 bg-gradient-to-br from-green-100 to-blue-100">
                    {recipe.image_url ? (
                      <img 
                        src={recipe.image_url} 
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="w-16 h-16 text-green-600 opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm">
                      {recipe.total_time_min} min
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h4 className="font-bold text-xl mb-2 text-gray-900">{recipe.title}</h4>
                    
                    {/* Recipe Stats */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.total_time_min}m</span>
                      </div>
                      <div className="px-2 py-1 bg-gray-100 rounded text-xs font-medium capitalize">
                        {recipe.difficulty}
                      </div>
                      <div className="text-xs text-gray-500">
                        {recipe.servings} servings
                      </div>
                    </div>

                    {/* Ingredients Preview */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Key Ingredients</p>
                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredients?.slice(0, 3).map((ingredient: any, i: number) => (
                          <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                            {ingredient.item.split(' ').slice(0, 2).join(' ')}
                          </span>
                        ))}
                        {recipe.ingredients && recipe.ingredients.length > 3 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            +{recipe.ingredients.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Nutrition Info */}
                    {(recipe.calories_est || recipe.protein_g_est) && (
                      <div className="flex gap-4 mb-4 text-xs text-gray-600">
                        {recipe.calories_est && (
                          <div>
                            <span className="font-semibold">{recipe.calories_est}</span> cal
                          </div>
                        )}
                        {recipe.protein_g_est && (
                          <div>
                            <span className="font-semibold">{recipe.protein_g_est}g</span> protein
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => startCooking(recipe)}
                      className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-green-700 transition-all hover:shadow-md flex items-center justify-center gap-2"
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

                {/* Current Step */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">Step {currentStep + 1}:</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:bg-gray-300 transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={nextStep}
                        disabled={currentStep >= (cookingRecipe.steps?.length || 1) - 1}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:bg-green-700 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-gray-800 text-lg">{cookingRecipe.steps?.[currentStep] || 'No steps available'}</p>
                  </div>

                  {/* Timer - Only show if step has time requirement */}
                  {currentStepHasTimer() && (
                    <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-blue-600 font-medium">Step Timer</p>
                            <p className="text-2xl font-bold text-blue-800">{formatTime(timer)}</p>
                            {getSuggestedTimeForStep() > 0 && (
                              <p className="text-xs text-blue-600 mt-1">
                                Suggested: {Math.floor(getSuggestedTimeForStep() / 60)} minutes
                              </p>
                            )}
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
                  )}

                  {/* Mark Complete Button */}
                  <button
                    onClick={() => toggleStepComplete(currentStep)}
                    className={`w-full mt-4 px-4 py-3 rounded-lg font-medium ${
                      completedSteps.has(currentStep)
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {completedSteps.has(currentStep) ? 'Completed' : 'Mark as Complete'}
                  </button>
                </div>

                {/* All Steps Overview */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">All Steps Overview:</h3>
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
                        onClick={() => {
                          setCurrentStep(index);
                          resetTimer(); // Reset timer when clicking on a step
                        }}
                      >
                        <div className="flex items-start">
                          <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                            {index + 1}
                          </span>
                          <p className="text-sm text-gray-700 flex-1">{step}</p>
                          {completedSteps.has(index) && (
                            <span className="ml-auto text-green-600">✓</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}