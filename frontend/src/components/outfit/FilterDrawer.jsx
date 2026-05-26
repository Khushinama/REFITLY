import React from 'react';
import { X, Check } from 'lucide-react';
import {
  FaTshirt,
  FaBriefcase,
  FaGlassCheers,
  FaHeart,
  FaPlane,
  FaSun,
  FaSnowflake
} from "react-icons/fa";

const OCCASIONS = [
  { label: "Casual", icon: FaTshirt },
  { label: "Formal", icon: FaBriefcase },
  { label: "Party", icon: FaGlassCheers },
  { label: "Date Night", icon: FaHeart },
  { label: "Office", icon: FaBriefcase },
  { label: "Vacation", icon: FaPlane }
];

const STYLES = [
  { label: "Minimal", icon: FaTshirt },
  { label: "Classy", icon: FaBriefcase },
  { label: "Streetwear", icon: FaTshirt },
  { label: "Bohemian", icon: FaSun },
  { label: "Trendy", icon: FaGlassCheers }
];

const SEASONS = [
  { label: "All", icon: FaTshirt, value: "all" },
  { label: "Summer", icon: FaSun, value: "summer" },
  { label: "Winter", icon: FaSnowflake, value: "winter" }
];

const FilterDrawer = ({ 
  isOpen, 
  onClose, 
  filters, 
  onEventClick, 
  onStyleClick, 
  onSeasonClick 
}) => {
  return (
    <>
      {/* Overlay Background */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Right Side Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[380px] bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1A1A2E] font-playfair">Filters</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} className="text-[#8A8A9A]" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* Occasion Section */}
            <section>
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#8A8A9A] mb-4">Occasion</h3>
              <div className="grid grid-cols-2 gap-3">
                {OCCASIONS.map((item) => {
                  const isActive = filters.eventLabel === item.label;
                  return (
                    <button
                      key={item.label}
                      onClick={() => onEventClick(item.label)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-[#81A6C6] border-[#81A6C6] text-white shadow-md' 
                          : 'bg-white border-gray-100 text-[#3D3D4E] hover:border-[#81A6C6]/30 hover:bg-[#FDFBF8]'
                      }`}
                    >
                      <item.icon className={isActive ? 'text-white' : 'text-[#81A6C6]'} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {isActive && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Style Section */}
            <section>
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#8A8A9A] mb-4">Style Preference</h3>
              <div className="flex flex-wrap gap-3">
                {STYLES.map((style) => {
                  const isActive = filters.style.includes(style.label);
                  return (
                    <button
                      key={style.label}
                      onClick={() => onStyleClick(style.label)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold transition-all ${
                        isActive 
                          ? 'bg-[#1A1A2E] border-[#1A1A2E] text-white' 
                          : 'bg-white border-gray-100 text-[#3D3D4E] hover:border-[#81A6C6]/30'
                      }`}
                    >
                      <style.icon className={isActive ? 'text-white' : 'text-[#81A6C6]'} />
                      {style.label}
                      {isActive && <Check size={12} />}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Season Section */}
            <section>
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#8A8A9A] mb-4">Season</h3>
              <div className="grid grid-cols-3 gap-3">
                {SEASONS.map((season) => {
                  const isActive = filters.season === season.value;
                  return (
                    <button
                      key={season.label}
                      onClick={() => onSeasonClick(season.value)}
                      className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all ${
                        isActive 
                          ? 'bg-[#F7F0E8] border-[#81A6C6] text-[#1A1A2E]' 
                          : 'bg-white border-gray-100 text-[#8A8A9A] hover:border-[#81A6C6]/30'
                      }`}
                    >
                      <season.icon className={isActive ? 'text-[#81A6C6]' : 'text-gray-300'} size={20} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{season.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50/50">
            <button
              onClick={onClose}
              className="w-full py-4 bg-[#1A1A2E] hover:bg-black text-white font-bold rounded-2xl shadow-lg transition-all transform active:scale-95"
            >
              View Results
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterDrawer;
