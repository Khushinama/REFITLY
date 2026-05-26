import React from 'react';
import { Shirt, CalendarDays, Pencil, Trash2, Loader2 } from 'lucide-react';

const WardrobeCard = ({ item, onEdit, onDelete }) => {
  if (item.isOptimistic) {
    return (
      <div className="group bg-white rounded-2xl p-4 border border-dashed border-[rgba(129,166,198,0.4)] animate-pulse flex flex-col gap-4 opacity-70">
        <div className="h-48 md:h-52 bg-[rgba(129,166,198,0.05)] rounded-xl relative overflow-hidden">
           {item.image && <img src={item.image} alt="Uploading..." className="w-full h-full object-cover opacity-40 grayscale" />}
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 flex items-center gap-2 shadow-sm">
                <Loader2 size={14} className="animate-spin text-[#81A6C6]" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#81A6C6]">Uploading...</span>
              </div>
           </div>
        </div>
        <div className="flex flex-col gap-3 px-1">
          <div className="h-4 w-3/4 bg-[rgba(129,166,198,0.1)] rounded-lg" />
          <div className="h-3 w-1/2 bg-[rgba(129,166,198,0.1)] rounded-lg" />
          <div className="flex gap-2 pt-2">
            <div className="h-6 w-16 bg-[rgba(129,166,198,0.05)] rounded-md" />
            <div className="h-6 w-20 bg-[rgba(129,166,198,0.05)] rounded-md" />
          </div>
        </div>
      </div>
    );
  }
  // Map common color names to hex if not already hex
  const colorMap = {
    'Navy': '#000080',
    'Black': '#000000',
    'White': '#FFFFFF',
    'Beige': '#F5F5DC',
    'Grey': '#808080',
    'Red': '#FF0000',
    'Blue': '#0000FF',
    'Green': '#008000',
    'Yellow': '#FFFF00',
    'Pink': '#FFC0CB',
    'Purple': '#800080',
  };

  const getHexColor = (color) => {
    if (!color) return 'transparent';
    if (color.startsWith('#')) return color;
    return colorMap[color] || color;
  };

  const getTimeAgo = (date) => {
    if (!date) return 'Recently';
    const diff = new Date() - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="group bg-white rounded-2xl p-4 border border-[rgba(180,165,148,0.2)] shadow-[0_2px_16px_rgba(129,166,198,0.06)] transition-all duration-400 ease-out cursor-pointer flex flex-col gap-4 hover:-translate-y-[8px] hover:scale-[1.03] hover:shadow-[0_24px_48px_rgba(129,166,198,0.2)] hover:border-[rgba(129,166,198,0.4)] hover:bg-[#FDFBF8]">
      {/* Image Area */}
      <div className="h-48 md:h-52 bg-[rgba(129,166,198,0.04)] rounded-xl flex items-center justify-center overflow-hidden relative border border-[rgba(180,165,148,0.1)]">
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <Shirt size={32} className="text-[#AACDDC] opacity-60" />
        )}

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Season Overlay (Subtle) */}
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/80 backdrop-blur-md rounded-full border border-white/40 shadow-sm">
           <span className="text-[9px] tracking-[0.12em] uppercase text-[#3D3D4E] font-bold">
            {item.season}
          </span>
        </div>

        {/* Hover Reveal Info Layer */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out pointer-events-none">
          <div className="flex flex-col gap-1.5">
            {item.fit && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/70 uppercase tracking-widest">Fit:</span>
                <span className="text-xs text-white font-medium">{item.fit}</span>
              </div>
            )}
            {item.pattern && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/70 uppercase tracking-widest">Type:</span>
                <span className="text-xs text-white font-medium">{item.pattern}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons with Tooltips */}
        <div className="absolute top-3 right-3 flex flex-col gap-3 
          opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 transform 
          md:translate-x-2 md:group-hover:translate-x-0
          pointer-events-auto
        ">
          <div className="relative group/tooltip">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(item); }}
              className="w-9 h-9 bg-white/95 backdrop-blur-md rounded-full border border-white/40 flex items-center justify-center text-[#3D3D4E] hover:bg-[#81A6C6] hover:text-white transition-all shadow-md hover:scale-110 active:scale-90"
            >
              <Pencil size={15} />
            </button>
            <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#1A1A2E] text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">
              Edit Item
            </span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col gap-4 px-1 flex-1">
        {/* Name and Color Label */}
        <div className="flex flex-col gap-1">
          <h3 className="font-['Inter'] text-[15px] font-bold text-[#1A1A2E] truncate group-hover:text-[#81A6C6] transition-colors leading-tight">
            {item.name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <div 
              className="w-3 h-3 rounded-full border border-black/10 flex-shrink-0"
              style={{ backgroundColor: getHexColor(item.color) }}
            />
            <span className="text-[11px] text-[#8A8A9A] font-medium tracking-wide">
              {item.color} <span className="opacity-60 font-normal">({item.colorFamily || 'Neutral'})</span>
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {/* Category Badge */}
          <div className="bg-[rgba(129,166,198,0.1)] rounded-lg px-3 py-1.5 transition-all group-hover:bg-[rgba(129,166,198,0.18)]">
            <span className="text-[9px] tracking-[0.15em] uppercase text-[#81A6C6] font-bold">
              {item.category === 'layer' ? 'Outerwear' : (item.category?.charAt(0).toUpperCase() + item.category?.slice(1)) || 'Unknown'}
            </span>
          </div>

          {/* Event Tag */}
          <div className="bg-[rgba(170,205,220,0.15)] rounded-lg px-3 py-1.5 flex items-center gap-2 border border-transparent group-hover:border-[rgba(170,205,220,0.3)]">
            <CalendarDays size={11} className="text-[#3D3D4E] opacity-60" />
            <span className="text-[9px] tracking-[0.15em] uppercase text-[#3D3D4E] font-bold">
              {Array.isArray(item.event) ? item.event.join(', ') : item.event}
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 mt-auto border-t border-[rgba(180,165,148,0.1)] flex justify-between items-center opacity-60 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px] tracking-widest uppercase text-[#8A8A9A]">Added {getTimeAgo(item.createdAt)}</span>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(item); }}
            className="w-8 h-8 rounded-full border border-[rgba(180,165,148,0.25)] flex items-center justify-center text-[#8A8A9A] hover:bg-red-50/50 hover:text-red-500 hover:border-red-200 transition-all duration-300 active:scale-95 cursor-pointer"
            title="Delete Item"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WardrobeCard;
