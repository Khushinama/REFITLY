/**
 * Merges saved state from backend saved outfits truth into any list of outfits.
 * Creates an ID set of saved outfits to quickly check and merge isSaved = true/false.
 * 
 * @param {Array} outfits - The list of outfits to sync (e.g. recommendations, history)
 * @param {Array} savedOutfits - The user's saved outfits
 * @returns {Array} - The synced list of outfits
 */
export const syncSavedState = (outfits, savedOutfits) => {
  if (!outfits) return [];
  if (!savedOutfits) return outfits;
  
  const savedIds = new Set(savedOutfits.filter(Boolean).map(o => o.id || o.signature));
  
  return outfits.map(outfit => {
    if (!outfit) return outfit;
    return {
      ...outfit,
      isSaved: savedIds.has(outfit.id || outfit.signature)
    };
  });
};
