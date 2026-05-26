import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWardrobe } from '../store/slices/wardrobeSlice';
import { Shirt, Plus } from 'lucide-react';
import WardrobeCard from './WardrobeCard';

const WardrobeGrid = ({ onAddClick, onEdit, onDelete }) => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.wardrobe);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeEvent, setActiveEvent] = useState('All');

  const categories = ['All', 'Top', 'Bottom', 'Footwear', 'Accessory', 'Dress', 'Outerwear'];
  const events = ['All', 'Casual', 'Party', 'Formal', 'Sports', 'Ethnic'];

  useEffect(() => {
    dispatch(fetchWardrobe());
  }, [dispatch]);

  useEffect(() => {
    let filtered = items;

    // Filter by Category
    if (activeCategory !== 'All') {
      const categoryMapping = {
        'Top': 'top',
        'Bottom': 'bottom',
        'Footwear': 'footwear',
        'Accessory': 'accessory',
        'Dress': 'dress',
        'Outerwear': 'layer'
      };
      const normalizedCat = categoryMapping[activeCategory] || activeCategory.toLowerCase();
      filtered = filtered.filter(item => item.category === normalizedCat);
    }

    // Filter by Event
    if (activeEvent !== 'All') {
      filtered = filtered.filter(item => {
        if (Array.isArray(item.event)) {
          return item.event.includes(activeEvent);
        }
        return item.event === activeEvent;
      });
    }

    setFilteredItems(filtered);
  }, [activeCategory, activeEvent, items]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-[rgba(129,166,198,0.06)] animate-pulse rounded-2xl h-64 shadow-sm" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6 md:gap-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
        <div>
          <span className="text-[9px] md:text-[10px] tracking-widest uppercase text-[#8A8A9A] mb-1 block">
            Your Collection
          </span>
          <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl text-[#1A1A2E] font-normal">
            Wardrobe
          </h2>
        </div>

        {/* Filter Section */}
        <div className="flex flex-col gap-3">
          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] text-[#8A8A9A] uppercase tracking-widest mr-2">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 md:px-4 py-1 md:py-1.5 text-[10px] md:text-xs rounded-full transition-all duration-300 border cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[rgba(129,166,198,0.12)] border-[rgba(129,166,198,0.3)] text-[#81A6C6] font-medium'
                    : 'bg-transparent border-[rgba(180,165,148,0.3)] text-[#8A8A9A] hover:bg-[rgba(180,165,148,0.05)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Event Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] text-[#8A8A9A] uppercase tracking-widest mr-2">Event:</span>
            {events.map((ev) => (
              <button
                key={ev}
                onClick={() => setActiveEvent(ev)}
                className={`px-3 md:px-4 py-1 md:py-1.5 text-[10px] md:text-xs rounded-full transition-all duration-300 border cursor-pointer whitespace-nowrap ${
                  activeEvent === ev
                    ? 'bg-[rgba(170,205,220,0.15)] border-[rgba(170,205,220,0.4)] text-[#AACDDC] font-medium'
                    : 'bg-transparent border-[rgba(180,165,148,0.3)] text-[#8A8A9A] hover:bg-[rgba(180,165,148,0.05)]'
                }`}
              >
                {ev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid or Empty State */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 md:py-20 bg-[rgba(129,166,198,0.03)] rounded-2xl md:rounded-3xl border border-dashed border-[rgba(180,165,148,0.3)] px-4">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-[rgba(170,205,220,0.15)] rounded-full flex items-center justify-center mb-4 md:mb-6">
            <Shirt size={24} className="md:size-[32px] text-[#AACDDC]" />
          </div>
          <h3 className="font-['Playfair_Display'] text-xl md:text-2xl text-[#1A1A2E] mb-2 text-center">
            Your wardrobe is empty
          </h3>
          <p className="text-xs md:text-sm text-[#8A8A9A] max-w-[240px] md:max-w-xs text-center mb-6 md:mb-8">
            Start building your collection — add your first item to get started.
          </p>
          <button 
            onClick={onAddClick}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#81A6C6] hover:bg-[#6B90B0] text-white text-xs md:text-sm font-medium tracking-wide rounded-full transition-all duration-300 ease-out hover:scale-105 active:scale-95 hover:shadow-[0_6px_20px_rgba(129,166,198,0.3)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            Add First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredItems.map((item) => (
            <WardrobeCard 
              key={item._id} 
              item={item} 
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WardrobeGrid;
