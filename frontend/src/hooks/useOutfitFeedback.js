import { useState, useCallback } from 'react';
import { submitOutfitFeedback } from '../services/api/recommendationApi';

/**
 * Custom hook to handle outfit feedback actions (like, save, dislike)
 * @param {Function} setOutfits - Function to update the main outfits list
 */
export const useOutfitFeedback = (setOutfits) => {
  const [processingId, setProcessingId] = useState(null);

  const handleFeedback = useCallback(async (outfitId, type) => {
    setProcessingId(`${outfitId}-${type}`);
    
    try {
      // Optimistic UI for 'dislike' (remove it immediately)
      if (type === 'dislike') {
        setOutfits(prev => prev.filter(o => o.id !== outfitId));
      }

      await submitOutfitFeedback(outfitId, type);

      // Handle other types (like/save) if needed (e.g., updating a 'liked' status in the UI)
      if (type === 'like' || type === 'save') {
        setOutfits(prev => prev.map(o => {
          if (o.id === outfitId) {
            return {
              ...o,
              [type === 'like' ? 'isLiked' : 'isSaved']: !o[type === 'like' ? 'isLiked' : 'isSaved']
            };
          }
          return o;
        }));
      }

    } catch (err) {
      console.error('Feedback failed:', err);
      // Revert optimistic UI on error could be implemented here
    } finally {
      setProcessingId(null);
    }
  }, [setOutfits]);

  return {
    handleFeedback,
    isProcessing: (outfitId, type) => processingId === `${outfitId}-${type}`
  };
};
