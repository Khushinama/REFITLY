import React from 'react';
import { X, Share2, Info } from 'lucide-react';
import ActionButtons from './ActionButtons';
import MatchScoreBadge from './MatchScoreBadge';
import ColorPalette from './ColorPalette';
import ReasonsList from './ReasonsList';
import { generateOutfitName, formatScore } from '../../utils/formatters';

const OutfitModal = ({ outfit, event, onClose, onFeedback, isProcessing }) => {
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
      <div className="relative w-full max-w-[900px] bg-white rounded-[24px] overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300 flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left: Image Grid (52%) */}
        <div className="w-full md:w-[52%] bg-gray-50 overflow-y-auto p-6 border-b md:border-b-0 md:border-r border-gray-100 custom-scrollbar">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(outfit.items).map(([key, item]) => (
              item && (
                <div key={key} className="space-y-2">
                  <div className="h-48 md:h-[220px] rounded-xl overflow-hidden bg-white border border-[rgba(180,165,148,0.12)] p-3 hover:shadow-md transition-shadow duration-300 flex items-center justify-center">
                    <img 
                      src={item.image} 
                      alt={item.category} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="px-1 flex items-center justify-between">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{key}</p>
                    <p className="text-[10px] font-semibold text-gray-600">{item.subCategory || item.category}</p>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Right: Info & Actions (48%) */}
        <div className="w-full md:w-[48%] p-5 sm:p-6 flex flex-col bg-white overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-4">
              <MatchScoreBadge score={outfit.score} />
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] mb-2 leading-tight font-playfair">
              {outfitName}
            </h2>
            
            <ColorPalette colors={outfit.colorPalette} />

            <div className="mt-5 space-y-4">
              <div>
                <h4 className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
                  <Info className="w-3.5 h-3.5" /> Why this works
                </h4>
                <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-100/80">
                  <ReasonsList reasons={reasons} limit={5} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100/50">
                  <p className="text-[8px] font-bold text-rose-400 uppercase tracking-widest mb-0.5">Color Match</p>
                  <p className="text-lg font-bold text-rose-600">{formatScore(outfit.matchBreakdown?.color || 0)}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100/50">
                  <p className="text-[8px] font-bold text-amber-400 uppercase tracking-widest mb-0.5">Style Alignment</p>
                  <p className="text-lg font-bold text-amber-600">{formatScore(outfit.matchBreakdown?.style || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-3">
            <ActionButtons 
              outfitId={outfit.id} 
              onFeedback={onFeedback} 
              isProcessing={isProcessing}
              isLiked={outfit.isLiked}
              isSaved={outfit.isSaved}
              variant="inline"
            />
            <button 
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1A1A2E] text-white text-xs font-bold hover:bg-black transition-all shadow-lg shadow-gray-200"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutfitModal;
