/**
 * Groups wardrobe items by their category.
 * @param {Array} items 
 * @returns {Object}
 */
export const groupItemsByCategory = (items) => {
  return items.reduce((acc, item) => {
    const cat = item.category || 'other';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(item);
    return acc;
  }, {});
};

/**
 * Filters wardrobe items by a specific event.
 * @param {Array} items 
 * @param {string} event 
 * @returns {Array}
 */
export const filterByEvent = (items, event) => {
  if (!event || event === 'All') return items;
  return items.filter(item => {
    if (Array.isArray(item.event)) {
      return item.event.includes(event);
    }
    return item.event === event;
  });
};

/**
 * Returns the styling vibe for a specific layer type.
 * @param {string} type 
 * @returns {string}
 */
export const getLayerStylingType = (type) => {
  const vibes = {
    'blazer': 'formal',
    'hoodie': 'casual',
    'jacket': 'neutral',
    'shrug': 'light'
  };
  return vibes[type] || 'neutral';
};
