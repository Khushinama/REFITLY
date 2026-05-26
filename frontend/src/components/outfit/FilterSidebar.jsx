import React from 'react';
import FilterSection from './FilterSection';
import FilterChip from './FilterChip';
import { EVENTS, STYLES, SEASONS } from '../../utils/constants';
import { X, SlidersHorizontal } from 'lucide-react';

const FilterSidebar = ({ filters, setFilters, onClear }) => {
  const handleToggleStyle = (styleId) => {
    setFilters(prev => ({
      ...prev,
      style: prev.style.includes(styleId)
        ? prev.style.filter(s => s !== styleId)
        : [...prev.style, styleId]
    }));
  };

  return (
    <aside className="hidden lg:block w-72 sticky top-24 h-[calc(100vh-120px)] overflow-y-auto pr-4 custom-scrollbar">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-[#81A6C6]" />
          <h2 className="text-xl font-bold text-[#1A1A2E] font-playfair">Filters</h2>
        </div>
        <button 
          onClick={onClear}
          className="text-xs font-medium text-[#8A8A9A] hover:text-[#81A6C6] transition-colors"
        >
          Clear All
        </button>
      </div>

      <FilterSection title="Occasion">
        {EVENTS.map((event) => (
          <FilterChip
            key={event.id}
            label={event.label}
            emoji={event.emoji}
            isActive={filters.event === event.id}
            onClick={() => setFilters(prev => ({ ...prev, event: event.id }))}
          />
        ))}
      </FilterSection>

      <FilterSection title="Style Vibe">
        {STYLES.map((style) => (
          <FilterChip
            key={style.id}
            label={style.label}
            emoji={style.emoji}
            type="checkbox"
            isActive={filters.style.includes(style.id)}
            onClick={() => handleToggleStyle(style.id)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Season">
        {SEASONS.map((season) => (
          <FilterChip
            key={season.id}
            label={season.label}
            emoji={season.emoji}
            isActive={filters.season === season.id}
            onClick={() => setFilters(prev => ({ ...prev, season: season.id }))}
          />
        ))}
      </FilterSection>

      <FilterSection title="Smart Filtering">
        <label className="flex items-center justify-between w-full p-4 rounded-2xl bg-[#FDFBF8] border border-[rgba(180,165,148,0.2)] cursor-pointer hover:bg-white transition-colors">
          <span className="text-sm font-medium text-[#3D3D4E]">Exclude recently worn</span>
          <input 
            type="checkbox" 
            className="w-4 h-4 rounded text-[#81A6C6] border-[rgba(180,165,148,0.4)] focus:ring-[#81A6C6]"
            checked={filters.excludeRecent}
            onChange={(e) => setFilters(prev => ({ ...prev, excludeRecent: e.target.checked }))}
          />
        </label>
      </FilterSection>
    </aside>
  );
};

export default FilterSidebar;
