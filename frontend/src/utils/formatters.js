/**
 * Generates a human-friendly name for an outfit
 * @param {Object} outfit 
 * @param {string} event 
 */
export const generateOutfitName = (outfit, event) => {
  const eventMap = {
    casual: 'Casual Day',
    formal: 'Formal Affair',
    party: 'Party Vibe',
    wedding: 'Elegant Wedding',
    date: 'Date Night',
    office: 'Office Sharp',
    vacation: 'Vacation Mode',
    brunch: 'Brunch Glow',
  };

  const colors = outfit.colorPalette || [];
  const dominantColor = colors[0] || 'Neutral';
  
  // Just a simple mapper for demo purposes, could be more complex
  const label = eventMap[event] || 'New Look';
  
  return `${label}`;
};

/**
 * Formats a score for display
 * @param {number} score 
 */
export const formatScore = (score) => {
  return `${Math.round(score)}%`;
};
