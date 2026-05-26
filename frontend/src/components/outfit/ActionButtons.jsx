import React from 'react';
import { Heart, Bookmark, Trash2 } from 'lucide-react';

const ActionButtons = ({ 
  outfitId, 
  onFeedback, 
  isProcessing, 
  isLiked, 
  isSaved,
  variant = 'floating',
  showDelete = true
}) => {

  const handleClick = (e, type) => {
    e.stopPropagation();
    onFeedback(outfitId, type);

    if (window.navigator?.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  // 🔥 Updated compact button style
  const btnClass = variant === 'floating' 
    ? 'w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur shadow-sm hover:scale-105 active:scale-95 transition-all'
    : 'flex items-center gap-2 px-6 py-3 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all';

  return (
    // 🔥 Vertical layout (IMPORTANT FIX)
    <div className={`flex ${variant === 'floating' ? 'flex-col items-center' : 'flex-row'} gap-2`}>
      
      {/* ❤️ LIKE */}
      <button 
        onClick={(e) => handleClick(e, 'like')}
        className={`${btnClass} group`}
        title="Like"
      >
        <Heart 
          className={`w-4 h-4 transition-colors ${
            isLiked 
              ? 'fill-rose-500 text-rose-500' 
              : 'text-gray-600 group-hover:text-rose-500'
          } ${
            (typeof isProcessing === 'function' 
              ? isProcessing(outfitId, 'like') 
              : isProcessing
            ) ? 'animate-pulse' : ''
          }`} 
        />
      </button>

      {/* 🔖 SAVE */}
      <button 
        onClick={(e) => handleClick(e, 'save')}
        className={`${btnClass} group`}
        title="Save to Wardrobe"
      >
        <Bookmark 
          className={`w-4 h-4 transition-colors ${
            isSaved 
              ? 'fill-amber-500 text-amber-500' 
              : 'text-gray-600 group-hover:text-amber-500'
          } ${
            (typeof isProcessing === 'function' 
              ? isProcessing(outfitId, 'save') 
              : isProcessing
            ) ? 'animate-pulse' : ''
          }`}
        />
      </button>

      {/* 🗑 DISLIKE */}
      {showDelete && (
        <button 
          onClick={(e) => handleClick(e, 'dislike')}
          className={`${btnClass} group hover:bg-rose-50`}
          title="Not for me"
        >
          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-rose-500 transition-colors" />
        </button>
      )}

    </div>
  );
};

export default ActionButtons;