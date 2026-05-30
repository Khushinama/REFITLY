import React, { useState, useEffect } from 'react';
import { X, Share2, Info } from 'lucide-react';
import ActionButtons from './ActionButtons';
import MatchScoreBadge from './MatchScoreBadge';
import ColorPalette from './ColorPalette';
import ReasonsList from './ReasonsList';
import { generateOutfitName, formatScore } from '../../utils/formatters';
import { submitOutfitFeedback, fetchAccessoryImage } from '../../services/api/recommendationApi';

const getCategoryEmoji = (label) => {
  if (!label) return '💎';
  const lower = label.toLowerCase();
  if (lower.includes('top')) return '👕';
  if (lower.includes('bottom')) return '👖';
  if (lower.includes('footwear') || lower.includes('shoes') || lower.includes('sneakers') || lower.includes('heels')) return '👟';
  if (lower.includes('watch')) return '⌚';
  if (lower.includes('bag') || lower.includes('tote') || lower.includes('clutch')) return '👜';
  if (lower.includes('sunglasses') || lower.includes('glasses')) return '🕶';
  if (lower.includes('hat') || lower.includes('cap')) return '🧢';
  if (lower.includes('tie')) return '👔';
  return '💎';
};

const SuggestedAccessoryCard = ({ title, reason }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchImage = async () => {
      try {
        const res = await fetchAccessoryImage(title);
        if (isMounted && res.success && res.imageUrl) {
          setImageUrl(res.imageUrl);
        }
      } catch (err) {
        console.error("Failed to fetch image for", title);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchImage();
    return () => { isMounted = false; };
  }, [title]);

  return (
    <div className="bg-white rounded-[20px] p-3 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow group">
      <div className="aspect-square rounded-xl bg-[#F8F9FA] mb-3 relative flex items-center justify-center overflow-hidden border border-gray-50">
        {loading ? (
           <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
        ) : imageUrl ? (
           <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
           <div className="text-3xl opacity-20">{getCategoryEmoji(title)}</div>
        )}
      </div>
      <span className="text-xs font-bold text-[#1A1A2E] mb-1 leading-tight">{title}</span>
      <span className="text-[10px] text-gray-500 leading-snug">{reason}</span>
    </div>
  );
};

const OutfitModal = ({ outfit, event, onClose, onFeedback, isProcessing, isHistoryView = false }) => {
  if (!outfit) return null;

  const outfitName = generateOutfitName(outfit, event);
  
  const reasons =
    outfit.reasons ||
    outfit.whyReasons ||
    outfit.outfit?.reasons ||
    [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-[1100px] bg-white rounded-[24px] overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[95vh]">
        
        {/* Header (Fixed) */}
        <div className="p-6 border-b border-gray-100 bg-white z-10 sticky top-0">
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1.5 rounded-full bg-[#E8F3EE] text-xs font-bold text-[#2A7B5C] uppercase tracking-wider flex items-center gap-1.5">
              <span></span> {formatScore(outfit.score)} Match
            </span>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] leading-tight font-playfair">
              {outfitName}
            </h2>
            <div className="flex items-center gap-1.5">
              <ColorPalette colors={outfit.colorPalette} />
            </div>
          </div>
        </div>

        {/* Scrollable Content: TWO COLUMN LAYOUT */}
        <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 custom-scrollbar bg-gray-50/30">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
            
            {/* ================= LEFT COLUMN ================= */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              
              {/* SECTION 1: Outfit Preview */}
              <div>
                <h4 className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                  <span className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center text-xs">👕</span> OUTFIT PREVIEW
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {['top', 'bottom', 'shoes'].map((key) => {
                    const item = outfit.items[key] || outfit.items['dress'] || null;
                    if (!item) return null;
                    const title = key === 'shoes' ? 'FOOTWEAR' : key.toUpperCase();
                    return (
                      <div key={key} className="space-y-2">
                        <div className="h-[180px] rounded-2xl overflow-hidden bg-[#F8F9FA] p-2 flex items-center justify-center border border-gray-100">
                          <img 
                            src={item.image} 
                            alt={item.category} 
                            className="w-full h-full object-contain drop-shadow-sm"
                          />
                        </div>
                        <div className="px-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
                          <p className="text-sm font-semibold text-[#1A1A2E] mt-0.5">{item.subCategory || item.category || 'Clothing'}</p>
                        </div>
                      </div>
                    )
                  })}
                  
                  {/* History View: Wardrobe Accessories injected into the same grid */}
                  {isHistoryView && outfit.accessories && outfit.accessories.map((acc, idx) => (
                    <div key={`acc-${idx}`} className="space-y-2">
                      <div className="h-[180px] rounded-2xl overflow-hidden bg-[#F4F9F6] p-2 flex items-center justify-center border border-[#E8F3EE] relative">
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md shadow-sm border border-[#E8F3EE]">
                          <span className="text-[9px] font-bold text-[#2A7B5C] uppercase">Match</span>
                        </div>
                        <img 
                          src={acc.image || acc.imageUrl} 
                          alt={acc.name} 
                          className="w-full h-full object-contain drop-shadow-sm mix-blend-multiply" 
                        />
                      </div>
                      <div className="px-1">
                        <p className="text-[10px] font-bold text-[#2A7B5C] uppercase tracking-widest flex items-center gap-1">
                          <span></span> YOUR WARDROBE
                        </p>
                        <p className="text-sm font-semibold text-[#1A1A2E] mt-0.5 truncate">{acc.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 2: From Your Wardrobe (Recommendation View Only) */}
              {!isHistoryView && outfit.accessories && outfit.accessories.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-[#2A7B5C] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span></span> FROM YOUR WARDROBE
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {outfit.accessories.map((acc, idx) => (
                      <div key={idx} className="flex flex-col">
                        <div className="aspect-square rounded-2xl overflow-hidden bg-[#F8F9FA] border border-gray-100 mb-3 p-2.5 flex items-center justify-center">
                          <img src={acc.image || acc.imageUrl} alt={acc.name} className="w-full h-full object-contain drop-shadow-sm" />
                        </div>
                        <span className="text-sm font-semibold text-[#1A1A2E] leading-tight mb-1.5 truncate">{acc.name}</span>
                        <span className="inline-flex w-fit px-2 py-1 rounded-md border border-[#E8F3EE] bg-[#F4F9F6] text-[9px] font-bold text-[#2A7B5C] uppercase tracking-wider">
                          Perfect Match
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ================= RIGHT COLUMN ================= */}
            <div className="lg:col-span-3 flex flex-col gap-10">
              
              {/* SECTION 1: Suggested To Enhance OR AI Insight (Case 3) */}
              <div>
                {outfit.enhancementSuggestions && outfit.enhancementSuggestions.length > 0 ? (
                  <>
                    <h4 className="flex items-center gap-2 text-[10px] font-bold text-[#5542F6] uppercase tracking-widest mb-4">
                      <span className="text-[#81A6C6] text-sm"></span> RECOMMENDED TO ENHANCE
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {outfit.enhancementSuggestions.map((suggestion, idx) => {
                        const title = typeof suggestion === 'object' ? suggestion.title : suggestion;
                        const reason = typeof suggestion === 'object' ? suggestion.reason : "Elevates the outfit and creates a more polished appearance.";
                        return <SuggestedAccessoryCard key={idx} title={title} reason={reason} />;
                      })}
                    </div>
                  </>
                ) : (
                  <div className="bg-[#F4F9F6] rounded-3xl p-6 border border-[#E8F3EE]">
                    <h4 className="flex items-center gap-2 text-[10px] font-bold text-[#2A7B5C] uppercase tracking-widest mb-2">
                      <span className="text-sm"></span> AI STYLIST INSIGHT
                    </h4>
                    <p className="text-sm text-[#1A1A2E] leading-relaxed font-medium">
                      Excellent! Your wardrobe already contains all the recommended accessories for this outfit. You are fully equipped to wear this look perfectly.
                    </p>
                  </div>
                )}
              </div>

              {/* SECTION 2: AI Stylist Insight */}
              {outfit.enhancementSuggestions && outfit.enhancementSuggestions.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                    <span className="text-gray-400 font-serif font-bold text-sm leading-none">ⓘ</span> AI STYLIST INSIGHT
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-2xl bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    This neutral combination creates a balanced, elegant look. Adding subtle accessories will elevate the outfit while maintaining a refined appearance.
                  </p>
                </div>
              )}

              {/* SECTION 3: Why This Works */}
              <div>
                <h4 className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  <span className="text-gray-400 font-serif font-bold text-sm leading-none">ⓘ</span> WHY THIS WORKS
                </h4>
                <div className="flex flex-col gap-3">
                  {reasons.slice(0, 4).map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
                      <span className="w-5 h-5 shrink-0 rounded-full bg-[#E8F3EE] text-[#2A7B5C] flex items-center justify-center text-[10px] font-bold mt-0.5">✓</span>
                      <span className="text-sm font-medium text-[#1A1A2E] leading-relaxed">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: Match Analytics */}
              <div>
                <h4 className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  📊 MATCH ANALYTICS
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-[#FFF5F5] flex items-center justify-between">
                    <p className="text-[10px] font-bold text-[#FF6B6B] uppercase tracking-widest">Color Match</p>
                    <p className="text-xl font-extrabold text-[#FF6B6B]">{formatScore(outfit.matchBreakdown?.color || 0)}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#FFF9F0] flex items-center justify-between">
                    <p className="text-[10px] font-bold text-[#F5A623] uppercase tracking-widest">Style Align</p>
                    <p className="text-xl font-extrabold text-[#F5A623]">{formatScore(outfit.matchBreakdown?.style || 0)}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#F4F9F6] flex items-center justify-between">
                    <p className="text-[10px] font-bold text-[#2A7B5C] uppercase tracking-widest">Occasion</p>
                    <p className="text-xl font-extrabold text-[#2A7B5C]">{formatScore(outfit.matchBreakdown?.event || 0)}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Actions (Fixed) */}
        <div className="p-5 border-t border-gray-100 bg-white flex items-center justify-between gap-4 z-10 w-full">
          <ActionButtons 
            outfitId={outfit.id} 
            onFeedback={onFeedback} 
            isProcessing={isProcessing}
            isLiked={outfit.isLiked}
            isSaved={outfit.isSaved}
            variant="inline"
            showText={true}
          />
          <button 
            className="flex-grow max-w-[300px] ml-auto py-3.5 px-6 rounded-2xl bg-[#1A1A2E] text-white text-sm font-bold tracking-widest uppercase hover:bg-black transition-all flex items-center justify-center gap-2"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied to clipboard!');
            }}
          >
            <Share2 className="w-4 h-4" /> SHARE OUTFIT
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutfitModal;
