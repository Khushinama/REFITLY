import React from 'react';
import { Search, Sparkles, RefreshCcw } from 'lucide-react';

const EmptyState = ({ type = 'no-results', onReset, customTitle, customDescription, customCta }) => {
  const content = {
    'no-results': {
      emoji: '🔍',
      title: 'No matches found',
      description: "We couldn't find outfits with these exact filters. Try broadening your style search!",
      cta: 'Clear Filters'
    },
    'insufficient-wardrobe': {
      emoji: '👔',
      title: 'Your closet needs a few more items',
      description: "Add a few more tops and bottoms so our AI can start styling combinations for you.",
      cta: 'Add to Wardrobe'
    },
    'error': {
      emoji: '⚡',
      title: 'Something went wrong',
      description: "Our fashion bots got tangled. Let's try that again.",
      cta: 'Try Again'
    }
  };

  const { emoji, title, description, cta } = content[type] || content['no-results'];

  const displayTitle = customTitle || title;
  const displayDescription = customDescription || description;
  const displayCta = customCta || cta;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white/50 backdrop-blur-sm rounded-[32px] border border-dashed border-gray-200">
      <div className="text-6xl mb-6 animate-float">{emoji}</div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{displayTitle}</h3>
      <p className="text-gray-500 max-w-md mb-8">{displayDescription}</p>
      
      <button 
        onClick={onReset}
        className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-rose-600 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gray-200"
      >
        {type === 'error' ? <RefreshCcw className="w-4 h-4" /> : <Search className="w-4 h-4" />}
        {displayCta}
      </button>

      {type === 'no-results' && (
        <div className="mt-12 flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <div className="h-px w-8 bg-gray-200" />
          <span>Stylist Tip</span>
          <div className="h-px w-8 bg-gray-200" />
        </div>
      )}
    </div>
  );
};

export default EmptyState;
