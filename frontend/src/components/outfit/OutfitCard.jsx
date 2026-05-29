import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { wearOutfit } from '../../store/slices/historySlice';
import ImageStack from './ImageStack';
import ActionButtons from './ActionButtons';
import MatchScoreBadge from './MatchScoreBadge';
import ColorPalette from './ColorPalette';
import { generateOutfitName } from '../../utils/formatters';

const OutfitCard = React.memo(({ 
  outfit, 
  event, 
  onFeedback, 
  isProcessing, 
  onClick,
  innerRef,
  readOnly = false
}) => {
  const dispatch = useDispatch();
  const historyOutfits = useSelector((state) => state.history?.historyOutfits || []);

  const [isLocalWorn, setIsLocalWorn] = useState(false);
  const [isWornProcessing, setIsWornProcessing] = useState(false);
  const [errorText, setErrorText] = useState('');

  const outfitName = generateOutfitName(outfit, event);

  // Check if this outfit was already worn today
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const isWornTodayInStore = historyOutfits.some(item => {
    const matchOutfit = item.outfit?.id === outfit.id || item.outfitId?.signature === outfit.id;
    if (!matchOutfit) return false;

    const wornDate = new Date(item.wornDate);
    return wornDate.getUTCFullYear() === todayUTC.getUTCFullYear() &&
           wornDate.getUTCMonth() === todayUTC.getUTCMonth() &&
           wornDate.getUTCDate() === todayUTC.getUTCDate();
  });

  const isWornToday = isWornTodayInStore || isLocalWorn;

  const handleWearToday = async (e) => {
    e.stopPropagation();
    if (isWornToday || isWornProcessing) return;

    setIsWornProcessing(true);
    setErrorText('');

    try {
      const resultAction = await dispatch(wearOutfit({
        outfitId: outfit.id,
        outfit: outfit,
        event: event || 'casual',
        style: outfit.items?.top?.styleTags?.[0] || outfit.items?.dress?.styleTags?.[0] || "minimal",
        season: outfit.items?.top?.season || outfit.items?.dress?.season || "All",
        mood: outfit.mood?.dominantMood || "Balanced",
        reasons: outfit.whyReasons || outfit.reasons || []
      }));

      if (wearOutfit.fulfilled.match(resultAction)) {
        setIsLocalWorn(true);
      } else {
        setErrorText(resultAction.payload || 'Failed to mark as worn');
      }
    } catch {
      setErrorText('Failed to mark as worn');
    } finally {
      setIsWornProcessing(false);
    }
  };

  return (
    <article 
      ref={innerRef}
      className={`group relative bg-white rounded-3xl p-3 mb-6 border border-[rgba(180,165,148,0.12)] shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-500 overflow-hidden flex flex-col h-full ${
        readOnly ? '' : 'hover:shadow-2xl hover:border-[#81A6C6]/30 cursor-pointer'
      }`}
      onClick={readOnly ? undefined : () => onClick && onClick(outfit)}
    >

      {/* Image Section */}
      <div className="relative aspect-square mb-3 overflow-hidden rounded-2xl bg-white">
        
        {/* Match Score Badge (Floating over image) */}
        <div className="absolute top-3 left-3 z-20 transition-transform group-hover:scale-105">
          <MatchScoreBadge score={outfit.score} />
        </div>

        {/* Action Buttons (Floating over image) */}
        {!readOnly && (
          <div 
            className="absolute top-3 right-3 z-20 flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <ActionButtons 
              outfitId={outfit.id} 
              onFeedback={onFeedback} 
              isProcessing={isProcessing}
              isLiked={outfit.isLiked}
              isSaved={outfit.isSaved}
              variant="floating"
              showDelete={false}
            />
          </div>
        )}

        <ImageStack items={outfit.items} variant="grid" />
      </div>

      {/* Content */}
      <div className="px-1 flex flex-col flex-grow">
        <div className="flex items-center gap-3 mb-3">
          <h3 className={`font-playfair text-xl font-bold text-[#1A1A2E] leading-tight transition-colors line-clamp-1 ${
            readOnly ? '' : 'group-hover:text-[#81A6C6]'
          }`}>
            {outfitName}
          </h3>

          <div className="flex items-center gap-1.5 ml-auto">
            <ColorPalette colors={outfit.colorPalette} />
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-2">
          <span className="px-3 py-1 rounded-full bg-[#F0F4F8] text-[9px] font-bold text-[#81A6C6] uppercase tracking-wider">
            {event || 'Casual'}
          </span>
          {outfit.items?.top?.styleTags?.slice(0, 1).map((tag, i) => (
            <span 
              key={i} 
              className="px-3 py-1 rounded-full bg-[#F0F4F8] text-[9px] font-bold text-[#81A6C6] uppercase tracking-wider"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Styling Teaser Section (Clickable) */}
        {!readOnly && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick(outfit);
            }}
            className="mt-2 pt-3 border-t border-[rgba(180,165,148,0.15)] flex flex-col text-left group/teaser transition-all w-full"
          >
            <h4 className="text-xs font-bold text-[#1A1A2E] flex items-center gap-2 mb-1.5 group-hover/teaser:text-[#81A6C6] transition-colors">
              <span className="text-[#F5A623]">✨</span> Click to view & enhance outfit <span className="ml-auto opacity-0 group-hover/teaser:opacity-100 transition-opacity">→</span>
            </h4>
            <p className="text-[10px] text-[#8A8A9A] leading-relaxed pl-5">
              View matching accessories from your wardrobe and get AI suggestions to complete your look.
            </p>
          </button>
        )}

        {/* Wear Today Button */}
        {!readOnly && (
          <div className="mt-4 w-full">
            <button
              onClick={handleWearToday}
              disabled={isWornProcessing || isWornToday}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 ${
                isWornToday
                  ? 'bg-[rgba(129,166,198,0.12)] text-[#81A6C6] border border-transparent cursor-not-allowed'
                  : 'border border-[#81A6C6]/30 text-[#81A6C6] hover:bg-[#81A6C6]/5 hover:border-[#81A6C6] active:scale-95'
              }`}
            >
              {isWornProcessing ? (
                'Processing...'
              ) : isWornToday ? (
                <>
                  <span className="text-sm">✔</span> Worn Today
                </>
              ) : (
                'Wear Today'
              )}
            </button>
            {errorText && (
              <span className="text-[10px] text-rose-500 font-medium mt-1 text-center block animate-fade-in">
                {errorText}
              </span>
            )}
          </div>
        )}
      </div>

    </article>
  );
});

export default OutfitCard;