import React, { useMemo, useState } from 'react';
import { 
  X, 
  Shirt, 
  CheckCircle2, 
  Heart, 
  Bookmark, 
  Share2,
  Gem,
  Check,
  TrendingUp,
  Palette,
  MapPin,
  Plus
} from 'lucide-react';
import { submitOutfitFeedback } from '../services/api/recommendationApi';

const findBestMatch = (itemStr, items) => {
  if (!itemStr || !items || items.length === 0) return null;
  const searchTerms = itemStr.toLowerCase().split(' ');
  
  let bestMatch = null;
  let maxScore = 0;

  items.forEach(item => {
      const itemWords = [
          ...(item.name || '').toLowerCase().split(' '),
          (item.category || '').toLowerCase(),
          (item.color || '').toLowerCase(),
          ...(item.styleTags || []).map(t => t.toLowerCase())
      ];

      let score = 0;
      searchTerms.forEach(term => {
          if (term.length < 3 && term !== 't') return; 
          if (itemWords.some(word => word.includes(term) || term.includes(word))) {
              score++;
          }
      });

      if (score > maxScore) {
          maxScore = score;
          bestMatch = item;
      }
  });

  return maxScore > 0 ? bestMatch : null;
};

// Advanced Accessory Matching Logic
const findAccessoryMatch = (itemStr, items) => {
  if (!itemStr || !items || items.length === 0) return null;
  const searchTerms = itemStr.toLowerCase().split(' ');
  
  let bestMatch = null;
  let maxScore = 0;

  items.forEach(item => {
      const itemCategory = (item.category || '').toLowerCase();
      const itemSubCategory = (item.subCategory || '').toLowerCase();
      const itemName = (item.name || '').toLowerCase();
      const itemColor = (item.color || '').toLowerCase();
      const itemOccasion = (item.occasion || '').toLowerCase();
      const itemStyleTags = (item.styleTags || []).map(t => t.toLowerCase());

      let score = 0;
      searchTerms.forEach(term => {
          if (term.length < 3) return;
          
          // Match category or name (Watch <-> Watch, etc.)
          if (itemCategory.includes(term) || itemSubCategory.includes(term) || itemName.includes(term)) {
              score += 3;
          }
          // Match style
          if (itemStyleTags.some(t => t.includes(term))) {
              score += 2;
          }
          // Match color compatibility
          if (itemColor.includes(term)) {
              score += 2;
          }
          // Match occasion
          if (itemOccasion.includes(term)) {
              score += 1;
          }
      });

      if (score > maxScore) {
          maxScore = score;
          bestMatch = item;
      }
  });

  // Require a decent match score for accessories to be considered "owned"
  return maxScore >= 3 ? bestMatch : null;
};

const shortenReason = (text) => {
  if (!text) return "";
  const words = text.split(" ");
  if (words.length <= 7) return text;
  return words.slice(0, 7).join(" ").replace(/[.,!?]+$/, '');
};

const getCategoryEmoji = (label) => {
  if (!label) return '';
  const lower = label.toLowerCase();
  if (lower.includes('top')) return '👕';
  if (lower.includes('bottom')) return '👖';
  if (lower.includes('footwear') || lower.includes('shoes') || lower.includes('sneakers')) return '👟';
  if (lower.includes('watch')) return '⌚';
  if (lower.includes('bag') || lower.includes('tote')) return '👜';
  if (lower.includes('sunglasses') || lower.includes('glasses')) return '🕶';
  return '';
};

const OutfitItemCard = ({ label, suggestedName, match, pexelsImage }) => {
  const displayImage = match?.image || pexelsImage;
  return (
  <div className="flex flex-col gap-2">
    <div className="w-full aspect-[4/5] rounded-2xl bg-[#F7F0E8] overflow-hidden flex items-center justify-center border border-[#81A6C6]/10 relative group shadow-sm">
      {displayImage ? (
        <img src={displayImage} alt={suggestedName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <div className="flex flex-col items-center justify-center text-[#81A6C6]/60 p-4 text-center">
           <span className="text-3xl mb-2">{getCategoryEmoji(label)}</span>
           <span className="text-[10px] uppercase tracking-wider font-semibold">{label}</span>
        </div>
      )}
      {match && (
        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 shadow-sm border border-gray-100">
          <CheckCircle2 size={12} className="text-green-500" />
          <span className="text-[9px] font-bold tracking-wider text-[#1A1A1A] uppercase">Owned</span>
        </div>
      )}
      {!match && displayImage && (
        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 shadow-sm border border-gray-100">
          
          <span className="text-[9px] font-bold tracking-wider text-[#1A1A1A] uppercase">Suggested</span>
        </div>
      )}
    </div>
    <div>
      <p className="text-[9px] font-bold tracking-[0.15em] text-[#81A6C6] uppercase mb-0.5">{label}</p>
      <p className="text-sm text-[#1A1A1A] font-medium leading-tight">{suggestedName}</p>
    </div>
  </div>
)};

const FullLookModal = ({ isOpen, onClose, suggestion, wardrobeItems }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { topMatch, bottomMatch, footwearMatch, ownedAccessories, recommendedAccessories } = useMemo(() => {
    if (!suggestion) return { topMatch: null, bottomMatch: null, footwearMatch: null, ownedAccessories: [], recommendedAccessories: [] };
    const tops = wardrobeItems.filter(i => i.category === 'top' || i.category === 'layer');
    const bottoms = wardrobeItems.filter(i => i.category === 'bottom');
    const footwears = wardrobeItems.filter(i => i.category === 'footwear');
    const accessories = wardrobeItems.filter(i => i.category === 'accessory');

    const topMatch = findBestMatch(suggestion.top, tops);
    const bottomMatch = findBestMatch(suggestion.bottom, bottoms);
    const footwearMatch = findBestMatch(suggestion.footwear, footwears);

    const allSuggestedAccs = suggestion.accessories || [];
    const owned = [];
    const recommended = [];

    allSuggestedAccs.forEach(accStr => {
      const match = findAccessoryMatch(accStr, accessories);
      if (match) {
        owned.push({ name: accStr, match });
      } else {
        recommended.push(accStr);
      }
    });

    return { topMatch, bottomMatch, footwearMatch, ownedAccessories: owned, recommendedAccessories: recommended };
  }, [suggestion, wardrobeItems]);

  const handleFeedback = async (type) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    const prevSaved = isSaved;
    const prevLiked = isLiked;
    
    if (type === 'save') setIsSaved(!isSaved);
    if (type === 'like') setIsLiked(!isLiked);

    try {
        const outfitId = suggestion.title;
        const formattedOutfit = {
            items: {
                top: topMatch || { name: suggestion.top, category: 'top' },
                bottom: bottomMatch || { name: suggestion.bottom, category: 'bottom' },
                shoes: footwearMatch || { name: suggestion.footwear, category: 'footwear' }
            },
            reasons: suggestion.whyItWorks,
            accessories: suggestion.accessories,
            title: suggestion.title,
            description: suggestion.description
        };

        const res = await submitOutfitFeedback(outfitId, type, formattedOutfit);
        if (!res?.success) {
            if (type === 'save') setIsSaved(prevSaved);
            if (type === 'like') setIsLiked(prevLiked);
        }
    } catch (err) {
        if (type === 'save') setIsSaved(prevSaved);
        if (type === 'like') setIsLiked(prevLiked);
    } finally {
        setIsProcessing(false);
    }
  };

  if (!isOpen || !suggestion) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1A1A1A]/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-6xl h-[85vh] sm:h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-slide-up relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Actions */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-[#1A1A1A] hover:bg-[#F7F0E8] transition-colors border border-gray-100 shadow-sm"
        >
          <X size={20} />
        </button>

        {/* Modal Content - Scrollable Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* LEFT COLUMN: Visuals */}
            <div className="space-y-12">
              
              {/* Outfit Preview */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  
                  <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-[#81A6C6]">Outfit Preview</h4>
                </div>
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  <OutfitItemCard label="Top" suggestedName={suggestion.top} match={topMatch} pexelsImage={suggestion?.images?.top} />
                  <OutfitItemCard label="Bottom" suggestedName={suggestion.bottom} match={bottomMatch} pexelsImage={suggestion?.images?.bottom} />
                  <OutfitItemCard label="Footwear" suggestedName={suggestion.footwear} match={footwearMatch} pexelsImage={suggestion?.images?.footwear} />
                </div>
              </div>

              {/* Owned Accessories */}
              <div className="space-y-6 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Gem size={16} className="text-[#81A6C6]" />
                  <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-[#81A6C6]">From Your Wardrobe</h4>
                </div>
                
                {ownedAccessories.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {ownedAccessories.map((acc, idx) => {
                         const displayImg = acc.match.image || (suggestion?.images?.accessories && suggestion.images.accessories[acc.name]);
                         return (
                        <div key={idx} className="flex flex-col gap-2 group">
                           <div className="w-full aspect-square rounded-2xl bg-[#F7F0E8] overflow-hidden flex items-center justify-center border border-gray-200 relative shadow-sm">
                             {displayImg ? (
                               <img src={displayImg} alt={acc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                             ) : (
                               <div className="flex flex-col items-center justify-center text-[#81A6C6]/60 p-2 text-center h-full w-full">
                                  <span className="text-2xl mb-1">{getCategoryEmoji(acc.name)}</span>
                               </div>
                             )}
                             <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 shadow-sm border border-gray-100">
                               <CheckCircle2 size={12} className="text-green-500" />
                               <span className="text-[9px] font-bold tracking-wider text-[#1A1A1A] uppercase">Owned</span>
                             </div>
                           </div>
                           <p className="text-xs font-semibold text-[#1A1A1A] leading-tight text-center truncate px-1">{acc.name}</p>
                        </div>
                      )})}
                    </div>
                ) : (
                  <div className="bg-[#F7F0E8]/50 rounded-2xl p-6 text-center border border-gray-100">
                    <p className="text-sm text-[#8A8A9A]">No matching accessories found in your wardrobe.</p>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: AI Stylist Panel */}
            <div className="space-y-6 lg:pr-4">
              
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1A1A1A] text-white rounded-full text-[10px] font-bold tracking-widest uppercase">
                  <span>AI Stylist</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-['Playfair_Display'] font-medium text-[#1A1A1A] leading-tight">
                  {suggestion.title}
                </h2>
                <p className="text-base text-[#5A5A6A] leading-relaxed font-light">
                  {suggestion.description}
                </p>
              </div>

              {/* Why This Works */}
              {suggestion.whyItWorks && suggestion.whyItWorks.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#81A6C6]">Why This Works</h4>
                  <div className="space-y-3">
                    {suggestion.whyItWorks.slice(0, 3).map((reason, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                        <CheckCircle2 size={18} className="text-[#81A6C6] shrink-0" />
                        <p className="text-sm text-[#3D3D4E] font-medium whitespace-nowrap overflow-hidden">
                          {shortenReason(reason)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended to Enhance */}
              {recommendedAccessories.length > 0 && (
                <div className="space-y-4 pt-6">
                   <div className="flex items-center gap-2">
                    
                    <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-600">Recommended To Enhance</h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {recommendedAccessories.map((acc, idx) => {
                      const displayImg = suggestion?.images?.accessories && suggestion.images.accessories[acc];
                      return (
                      <div key={idx} className="flex flex-col gap-2 group">
                        <div className="w-full aspect-square rounded-2xl bg-amber-50/50 overflow-hidden flex items-center justify-center border border-amber-200 relative shadow-sm">
                           {displayImg ? (
                             <img src={displayImg} alt={acc} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                           ) : (
                             <div className="flex flex-col items-center justify-center text-amber-500/60 p-2 text-center h-full w-full">
                                <span className="text-2xl mb-1">{getCategoryEmoji(acc)}</span>
                             </div>
                           )}
                           <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 shadow-sm border border-amber-100">
                             <Plus size={12} className="text-amber-500" />
                             <span className="text-[9px] font-bold tracking-wider text-amber-600 uppercase">Suggested</span>
                           </div>
                        </div>
                        <p className="text-xs font-semibold text-amber-900 leading-tight text-center truncate px-1">{acc}</p>
                      </div>
                    )})}
                  </div>
                </div>
              )}

              {/* Match Analytics */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                 <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#81A6C6]">Match Analytics</h4>
                 <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center gap-1">
                      <TrendingUp size={16} className="text-[#81A6C6] mb-1" />
                      <span className="text-2xl font-['Playfair_Display'] font-bold text-[#1A1A1A]">94%</span>
                      <span className="text-[9px] uppercase tracking-widest text-[#8A8A9A] font-bold">Style</span>
                    </div>
                    <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center gap-1">
                      <Palette size={16} className="text-[#81A6C6] mb-1" />
                      <span className="text-2xl font-['Playfair_Display'] font-bold text-[#1A1A1A]">92%</span>
                      <span className="text-[9px] uppercase tracking-widest text-[#8A8A9A] font-bold">Color</span>
                    </div>
                    <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center gap-1">
                      <MapPin size={16} className="text-[#81A6C6] mb-1" />
                      <span className="text-2xl font-['Playfair_Display'] font-bold text-[#1A1A1A]">98%</span>
                      <span className="text-[9px] uppercase tracking-widest text-[#8A8A9A] font-bold">Occasion</span>
                    </div>
                 </div>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Action Bar */}
        <div className="shrink-0 bg-white border-t border-gray-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <button 
                onClick={() => handleFeedback('save')}
                disabled={isProcessing}
                className={`flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-medium transition-colors ${isSaved ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-gray-50 border-gray-200 text-[#1A1A1A] hover:bg-gray-100'}`}
             >
               <Bookmark size={14} className={isSaved ? "fill-white" : ""} /> {isSaved ? 'Saved' : 'Save Outfit'}
             </button>
             <button 
                onClick={() => handleFeedback('like')}
                disabled={isProcessing}
                className={`flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-medium transition-colors ${isLiked ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100' : 'bg-gray-50 border-gray-200 text-[#1A1A1A] hover:bg-gray-100'}`}
             >
               <Heart size={14} className={isLiked ? "fill-red-500 text-red-500" : ""} /> Favorite
             </button>
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#1A1A1A] text-white rounded-full text-xs font-semibold tracking-wide hover:bg-[#333333] transition-colors shadow-lg active:scale-95">
             <Share2 size={14} /> Share Look
          </button>
        </div>

      </div>
    </div>
  );
};

export default FullLookModal;
