import React from 'react';

const ImageStack = ({ items, variant = 'grid' }) => {
  if (!items) return null;

  const { top, bottom, dress, layer, shoes } = items;
  const isModal = variant === 'modal';

  const renderItem = (item, className = "") => (
    <ItemImage 
      item={item} 
      variant={variant} 
      className={className} 
    />
  );

  // Layout logic for vertical cards
  if (layer && top && bottom && shoes) {
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-1.5 h-full">
        {renderItem(layer, "row-span-1")}
        {renderItem(top, "row-span-1")}
        {renderItem(bottom, "row-span-1")}
        {renderItem(shoes, "row-span-1")}
      </div>
    );
  }

  if (dress && shoes) {
    return (
      <div className="flex flex-col gap-1.5 h-full">
        {renderItem(dress, "flex-[3] min-h-0")}
        {renderItem(shoes, "flex-[1] min-h-0")}
      </div>
    );
  }

  // Default: Top + Bottom + Shoes
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex-[0.9] grid grid-cols-2 gap-2 min-h-0">
        {renderItem(top, "h-full")}
        {renderItem(bottom, "h-full")}
      </div>
      {renderItem(shoes, "flex-[1.1] min-h-0")}
    </div>
  );
};

const ItemImage = ({ item, variant, className }) => {
  if (!item) return <div className={`bg-gray-50 rounded-2xl ${className}`} />;
  
  return (
    <div className={`relative group overflow-hidden rounded-2xl bg-gray-50 ${className}`}>
      <img
        src={item.image || item.imageUrl || item.url || ''}
        alt={item.category || 'clothes'}
        className={`w-full h-full object-contain p-2 transition-transform duration-700 group-hover:scale-105`}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black-[0.02] transition-colors duration-300" />
    </div>
  );
};

export default ImageStack;
