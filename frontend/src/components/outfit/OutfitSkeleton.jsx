import React from 'react';

const OutfitSkeleton = () => {
  return (
    <div className="bg-white rounded-3xl p-3 mb-6 border border-[rgba(180,165,148,0.12)] shadow-sm animate-pulse">
      {/* Image Section Skeleton */}
      <div className="aspect-[3/4] rounded-2xl bg-gray-50 mb-4" />
      
      {/* Content Skeleton */}
      <div className="space-y-3 px-1">
        <div className="flex items-center justify-between gap-3">
          <div className="w-2/3 h-5 bg-gray-100 rounded-md" />
          <div className="w-8 h-4 bg-gray-50 rounded-full" />
        </div>
        <div className="w-1/3 h-4 bg-gray-50 rounded-md" />
      </div>
    </div>
  );
};

export default OutfitSkeleton;
