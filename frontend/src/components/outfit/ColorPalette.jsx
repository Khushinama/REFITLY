import React from 'react';

const ColorPalette = ({ colors }) => {
  if (!colors || colors.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 mt-2">
      {colors.map((color, index) => (
        <div
          key={index}
          className="w-4 h-4 rounded-full border border-gray-100 shadow-sm transition-transform hover:scale-125"
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium ml-1">
        Palette
      </span>
    </div>
  );
};

export default ColorPalette;
