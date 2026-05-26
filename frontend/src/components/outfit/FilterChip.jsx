import React from 'react';

/**
 * Reusable Chip component for filtering
 * @param {Object} props
 * @param {string} props.label - Display text
 * @param {string} props.emoji - Optional emoji
 * @param {boolean} props.isActive - Toggle state
 * @param {Function} props.onClick - Click handler
 * @param {string} props.type - 'radio' or 'checkbox' style
 */
const FilterChip = ({ label, emoji, isActive, onClick, type = 'radio' }) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200
        ${isActive 
          ? 'bg-[#81A6C6] text-white border-transparent shadow-[0_4px_12px_rgba(129,166,198,0.3)] scale-105' 
          : 'bg-white text-[#3D3D4E] border-[rgba(180,165,148,0.2)] hover:border-[#81A6C6] hover:bg-[#FDFBF8]'
        }
      `}
      aria-pressed={isActive}
    >
      {emoji && <span className="text-lg">{emoji}</span>}
      <span className="font-medium text-sm whitespace-nowrap">{label}</span>
      {type === 'checkbox' && isActive && (
        <span className="ml-1 text-xs opacity-80">✓</span>
      )}
    </button>
  );
};

export default FilterChip;
