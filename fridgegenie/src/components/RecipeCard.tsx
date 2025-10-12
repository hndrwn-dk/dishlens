'use client';

import { useState } from 'react';
import { Clock, Star, ChefHat, Flame } from 'lucide-react';
import { Recipe } from '@/types';
import SwapModal from './SwapModal';

interface RecipeCardProps {
  recipe: Recipe;
  onCookNow: () => void;
}

export default function RecipeCard({ recipe, onCookNow }: RecipeCardProps) {
  const [showSwap, setShowSwap] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
        {/* Recipe Image Placeholder */}
        <div className="h-48 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
          <ChefHat className="w-16 h-16 text-green-400" />
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
              {recipe.title}
            </h3>
            <div className="flex items-center gap-1 text-sm text-gray-500 ml-2">
              <Clock className="w-4 h-4" />
              <span>{recipe.total_time_min}m</span>
            </div>
          </div>

          {/* Score and Difficulty */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className={`font-semibold ${getScoreColor(recipe.score.total)}`}>
                {recipe.score.total}
              </span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
              {recipe.difficulty}
            </span>
            {recipe.calories_est && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Flame className="w-3 h-3" />
                <span>{recipe.calories_est} cal</span>
              </div>
            )}
          </div>

          {/* Ingredients Preview */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Ingredients:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {recipe.ingredients.slice(0, 4).map((ingredient, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>•</span>
                    <span>{ingredient.item}</span>
                  </span>
                  <button
                    onClick={() => setShowSwap(true)}
                    className="text-green-600 hover:text-green-700 text-xs"
                  >
                    swap
                  </button>
                </li>
              ))}
              {recipe.ingredients.length > 4 && (
                <li className="text-gray-400 text-xs">
                  +{recipe.ingredients.length - 4} more...
                </li>
              )}
            </ul>
          </div>

          {/* Pantry Items */}
          {recipe.pantry_used.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500">
                Pantry: {recipe.pantry_used.join(', ')}
              </p>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={onCookNow}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Cook Now
          </button>
        </div>
      </div>

      {showSwap && (
        <SwapModal
          recipe={recipe}
          onClose={() => setShowSwap(false)}
        />
      )}
    </>
  );
}