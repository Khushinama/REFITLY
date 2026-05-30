export const compatibleColors = {
  black: ["white", "grey", "beige", "silver", "gold", "red", "black"],
  white: ["black", "blue", "silver", "gold", "beige", "brown", "navy", "white"],
  beige: ["black", "brown", "white", "gold", "navy", "green", "beige"],
  brown: ["beige", "white", "gold", "green", "navy", "black", "brown"],
  navy: ["white", "beige", "silver", "brown", "grey", "navy"],
  grey: ["black", "white", "silver", "navy", "blue", "grey"],
  blue: ["white", "silver", "grey", "black", "navy", "blue"],
  red: ["black", "white", "gold", "silver", "navy", "red"],
  green: ["brown", "beige", "gold", "white", "black", "green"],
  silver: ["black", "white", "navy", "blue", "grey", "silver"],
  gold: ["black", "white", "brown", "beige", "red", "green", "gold"]
};

const defaultEnhancements = {
  casual: [
    { title: "Minimal Watch", reason: "Adds subtle elegance.", type: "Watch" },
    { title: "Cap", reason: "Brings a relaxed street vibe.", type: "Headwear" },
    { title: "Sneakers", reason: "Perfect for comfortable style.", type: "Footwear" },
    { title: "Sunglasses", reason: "Elevates the casual look.", type: "Eyewear" }
  ],
  formal: [
    { title: "Leather Watch", reason: "Adds sophisticated detail.", type: "Watch" },
    { title: "Handbag", reason: "Complements the palette and balances the outfit.", type: "Bag" },
    { title: "Heels", reason: "Elongates the silhouette.", type: "Footwear" },
    { title: "Tie", reason: "Completes the formal appearance.", type: "Neckwear" }
  ],
  party: [
    { title: "Statement Jewelry", reason: "Adds sparkle and visual interest.", type: "Jewelry" },
    { title: "Chain", reason: "Creates a bold focal point.", type: "Jewelry" },
    { title: "Clutch", reason: "Perfect for carrying essentials with style.", type: "Bag" }
  ],
  streetwear: [
    { title: "Chain", reason: "Adds a subtle edge.", type: "Jewelry" },
    { title: "Sunglasses", reason: "Completes the urban aesthetic.", type: "Eyewear" },
    { title: "Cap", reason: "Enhances the relaxed silhouette.", type: "Headwear" }
  ],
  office: [
    { title: "Classic Watch", reason: "A timeless professional accessory.", type: "Watch" },
    { title: "Tote Bag", reason: "Practical and stylish for work.", type: "Bag" },
    { title: "Minimal Earrings", reason: "Adds elegance without distraction.", type: "Jewelry" }
  ],
  vacation: [
    { title: "Sunglasses", reason: "Essential for a resort vibe.", type: "Eyewear" },
    { title: "Straw Hat", reason: "Provides a relaxed aesthetic.", type: "Headwear" },
    { title: "Tote Bag", reason: "Perfect for carrying daily items.", type: "Bag" }
  ]
};

/**
 * Matches user's accessories with an outfit based on occasion, style, and color.
 * 
 * @param {Object} outfitItems - The serialized outfit items (top, bottom, dress, layer, shoes)
 * @param {Array} userAccessories - The user's accessory wardrobe items
 * @param {Object} options - { event, style, season }
 * @returns {Object} { matchedAccessories, enhancementSuggestions }
 */
export function matchAccessories(outfitItems, userAccessories, options = {}) {
  const { event = ["casual"], style = [] } = options;
  
  // Extract outfit colors
  const outfitColors = new Set();
  Object.values(outfitItems).forEach(item => {
    if (item && item.color) {
      outfitColors.add(item.color.toLowerCase());
    }
  });
  
  const scoredAccessories = userAccessories.map(acc => {
    let score = 0;
    let matchReasons = [];

    const accColor = (acc.color || "").toLowerCase();
    const accEvents = Array.isArray(acc.event) ? acc.event.map(e => e.toLowerCase()) : (acc.event ? [acc.event.toLowerCase()] : []);
    const accStyles = Array.isArray(acc.styleTags) ? acc.styleTags.map(s => s.toLowerCase()) : [];
    const accVibes = Array.isArray(acc.vibe) ? acc.vibe.map(v => v.toLowerCase()) : (acc.vibe ? [acc.vibe.toLowerCase()] : []);

    // 1. Occasion Match (High Score)
    const occasionMatched = event.some(e => accEvents.includes(e));
    if (occasionMatched) {
      score += 40;
      matchReasons.push("Matches the occasion");
    }

    // 2. Style/Vibe Match (High Score)
    const styleMatched = style.some(s => accStyles.includes(s) || accVibes.includes(s));
    if (styleMatched) {
      score += 30;
      matchReasons.push("Complements the style");
    }

    // 3. Color Compatibility (Medium Score)
    let colorMatched = false;
    for (const outfitColor of outfitColors) {
      const compatibleList = compatibleColors[outfitColor] || [];
      if (compatibleList.includes(accColor) || outfitColor === accColor) {
        colorMatched = true;
        break;
      }
    }

    if (colorMatched) {
      score += 20;
      matchReasons.push("Color coordinates well");
    }

    return {
      ...acc,
      matchScore: score,
      matchReasons
    };
  });

  // Filter out low scores and sort by score
  const matchedAccessories = scoredAccessories
    .filter(acc => acc.matchScore >= 40) // Must have at least a decent match
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3); // Get top 3 accessories max

  let enhancementSuggestions = [];

  const primaryEvent = event[0] || "casual";
  const suggestions = defaultEnhancements[primaryEvent] || defaultEnhancements.casual;

  const matchedTypes = matchedAccessories.map(a => (a.subCategory || a.category || "").toLowerCase());

  // Filter out suggestions that match the types of accessories we already have
  enhancementSuggestions = suggestions.filter(s => {
    return !matchedTypes.some(t => t.includes(s.type.toLowerCase()) || s.type.toLowerCase().includes(t));
  });

  // Pick up to 3 enhancements to ensure a complete stylist experience
  enhancementSuggestions = enhancementSuggestions.slice(0, 3);
  
  if (enhancementSuggestions.length === 0 && suggestions.length > 0) {
    enhancementSuggestions = suggestions.slice(0, 2);
  }

  // Inject a compatible color into the suggested title to enhance search results and visual cohesion
  if (outfitColors.size > 0 && enhancementSuggestions.length > 0) {
    const mainOutfitColor = Array.from(outfitColors)[0];
    const compColors = compatibleColors[mainOutfitColor] || ["black", "white"];
    
    enhancementSuggestions = enhancementSuggestions.map(s => {
      let targetColor = "Black"; // default fallback
      const t = s.type.toLowerCase();
      
      if (t === "jewelry" || t === "watch" || t === "eyewear") {
         const metals = compColors.filter(c => c === "silver" || c === "gold" || c === "black");
         targetColor = metals.length > 0 ? metals[0] : "Silver";
      } else if (t === "footwear" || t === "bag") {
         const neutrals = compColors.filter(c => c === "black" || c === "brown" || c === "white" || c === "beige" || c === "navy");
         targetColor = neutrals.length > 0 ? neutrals[0] : "Black";
      } else {
         const basics = compColors.filter(c => c === "black" || c === "white" || c === "navy" || c === "grey");
         targetColor = basics.length > 0 ? basics[0] : "Black";
      }
      
      const capitalizedColor = targetColor.charAt(0).toUpperCase() + targetColor.slice(1);
      return {
        ...s,
        title: `${capitalizedColor} ${s.title}`
      };
    });
  }

  return {
    matchedAccessories,
    enhancementSuggestions
  };
}
