/**
 * Standardizes category strings to a set of internal keys.
 * @param {string} category 
 * @returns {string}
 */
export const normalizeCategory = (category) => {
  if (!category) return "top";
  
  const cat = category.toLowerCase().trim();
  
  const mapping = {
    "top": "top",
    "tops": "top",
    "shirt": "top",
    "t-shirt": "top",
    "blouse": "top",
    
    "bottom": "bottom",
    "bottoms": "bottom",
    "pants": "bottom",
    "jeans": "bottom",
    "skirt": "bottom",
    "shorts": "bottom",
    
    "dress": "dress",
    "dresses": "dress",
    "gown": "dress",
    
    "outerwear": "layer",
    "jacket": "layer",
    "coat": "layer",
    "blazer": "layer",
    "hoodie": "layer",
    "cardigan": "layer",
    "layer": "layer",
    
    "footwear": "footwear",
    "shoes": "footwear",
    "sneakers": "footwear",
    "boots": "footwear",
    "sandals": "footwear",
    
    "accessory": "accessory",
    "accessories": "accessory",
    "bag": "accessory",
    "belt": "accessory",
    "jewelry": "accessory"
  };

  return mapping[cat] || cat;
};
