import React from 'react';
import OutfitCard from './OutfitCard';
import OutfitSkeleton from './OutfitSkeleton';

const OutfitGrid = ({ 
  outfits, 
  loading, 
  event, 
  onFeedback, 
  isProcessing, 
  onCardClick,
  lastElementRef 
}) => {
  // Grid container styles for Pinterest-style vertical flow
  const gridClasses = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start max-w-[1200px] mx-auto w-full px-4 sm:px-0";

  if (loading && outfits.length === 0) {
    return (
      <div className={gridClasses}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <OutfitSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={gridClasses}>
      {outfits.map((outfit, index) => {
        const isLast = index === outfits.length - 1;
        return (
          <div key={outfit.id} className="h-auto">
            <OutfitCard 
              outfit={outfit}
              event={event}
              onFeedback={onFeedback}
              isProcessing={isProcessing}
              onClick={onCardClick}
              innerRef={isLast ? lastElementRef : null}
            />
          </div>
        );
      })}
    </div>
  );
};

export default OutfitGrid;
