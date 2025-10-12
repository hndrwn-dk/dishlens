'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Play, Pause, RotateCcw, Check } from 'lucide-react';
import { Recipe } from '@/types';

interface CookModeProps {
  recipe: Recipe;
  onBack: () => void;
}

export default function CookMode({ recipe, onBack }: CookModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Extract time from step text (e.g., "bake 12 min" -> 12)
  const extractTimeFromStep = (step: string): number => {
    const timeMatch = step.match(/(\d+)\s*min/);
    return timeMatch ? parseInt(timeMatch[1]) * 60 : 0; // Convert to seconds
  };

  // Start timer when step has time
  useEffect(() => {
    const timeInStep = extractTimeFromStep(recipe.steps?.[currentStep] || '');
    if (timeInStep > 0) {
      setTimeRemaining(timeInStep);
      setIsTimerRunning(true);
    } else {
      setTimeRemaining(0);
      setIsTimerRunning(false);
    }
  }, [currentStep, recipe.steps]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nextStep = () => {
    if (currentStep < (recipe.steps?.length || 0) - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // const toggleStepComplete = (stepIndex: number) => {
  //   const newCompleted = new Set(completedSteps);
  //   if (newCompleted.has(stepIndex)) {
  //     newCompleted.delete(stepIndex);
  //   } else {
  //     newCompleted.add(stepIndex);
  //   }
  //   setCompletedSteps(newCompleted);
  // };

  const resetTimer = () => {
    const timeInStep = extractTimeFromStep(recipe.steps?.[currentStep] || '');
    setTimeRemaining(timeInStep);
    setIsTimerRunning(false);
  };

  // Add null checks to prevent errors
  if (!recipe || !recipe.steps) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Recipes
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">{recipe.title}</h1>
            <p className="text-gray-600">
              Step {currentStep + 1} of {recipe.steps?.length || 0}
            </p>
          </div>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Main Cooking Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Timer */}
              {timeRemaining > 0 && (
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center gap-4 bg-gray-100 rounded-2xl p-4">
                    <Clock className="w-6 h-6 text-green-600" />
                    <span className="text-3xl font-mono font-bold text-gray-900">
                      {formatTime(timeRemaining)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={resetTimer}
                        className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Step */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Current Step</h3>
                <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                  <p className="text-lg text-gray-800">{recipe.steps?.[currentStep] || ''}</p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={nextStep}
                  disabled={currentStep === (recipe.steps?.length || 0) - 1}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Step
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ingredients */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Ingredients</h3>
              <ul className="space-y-2">
                {recipe.ingredients?.map((ingredient, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm">
                      {ingredient.item} {ingredient.amount && `(${ingredient.amount})`}
                    </span>
                  </li>
                )) || []}
              </ul>
            </div>

            {/* All Steps */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">All Steps</h3>
              <div className="space-y-3">
                {recipe.steps?.map((step, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      index === currentStep
                        ? 'bg-green-100 border-2 border-green-500'
                        : completedSteps.has(index)
                        ? 'bg-gray-100'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {completedSteps.has(index) ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-400 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{step}</p>
                        <span className="text-xs text-gray-500">Step {index + 1}</span>
                      </div>
                    </div>
                  </div>
                )) || []}
              </div>
            </div>

            {/* Recipe Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Recipe Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Time:</span>
                  <span className="font-medium">{recipe.total_time_min} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className="font-medium capitalize">{recipe.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Servings:</span>
                  <span className="font-medium">{recipe.servings}</span>
                </div>
                {recipe.calories_est && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Calories:</span>
                    <span className="font-medium">{recipe.calories_est} per serving</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}