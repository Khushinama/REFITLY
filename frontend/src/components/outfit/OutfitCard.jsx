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

      {/* Match Score Badge */}
      <div className="absolute top-4 left-4 z-20 transition-transform group-hover:scale-110">
        <MatchScoreBadge score={outfit.score} />
      </div>

      {/* Action Buttons (Hidden in readOnly mode) */}
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

      {/* Image Section */}
      <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-2xl bg-[#FBF9F6]">
        <ImageStack items={outfit.items} variant="grid" />
      </div>

      {/* Content */}
      <div className="px-1 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className={`font-playfair text-lg font-bold text-[#1A1A2E] leading-tight transition-colors line-clamp-1 ${
            readOnly ? '' : 'group-hover:text-[#81A6C6]'
          }`}>
            {outfitName}
          </h3>

          <div className="flex-shrink-0 pt-1">
            <ColorPalette colors={outfit.colorPalette} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-[rgba(129,166,198,0.08)] text-[9px] font-bold text-[#81A6C6] uppercase tracking-wider">
              {event}
            </span>

            {outfit.items?.top?.styleTags?.slice(0, 1).map((tag, i) => (
              <span 
                key={i} 
                className="px-2.5 py-1 rounded-lg bg-gray-50 text-[9px] font-bold text-[#8A8A9A] uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Wear Today Button (Hidden in readOnly mode) */}
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