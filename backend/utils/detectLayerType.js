/**
 * Derives the specific type of a layer item from its name and style tags.
 * @param {string} name 
 * @param {Array|string} styleTags 
 * @returns {string|null}
 */
export const detectLayerType = (name, styleTags) => {
  const normalizedName = (name || "").toLowerCase();
  
  let tags = [];
  if (Array.isArray(styleTags)) {
    tags = styleTags.map(t => t.toLowerCase());
  } else if (typeof styleTags === 'string') {
    tags = styleTags.split(',').map(t => t.trim().toLowerCase());
  }

  const combined = [normalizedName, ...tags];

  if (combined.some(text => text.includes('blazer'))) return 'blazer';
  if (combined.some(text => text.includes('hoodie'))) return 'hoodie';
  if (combined.some(text => text.includes('shrug'))) return 'shrug';
  if (combined.some(text => text.includes('jacket'))) return 'jacket';

  // Fallback if it's generally a layer
  return 'jacket';
};
