/**
 * Generates intelligent "Why This Outfit?" reasons based on multiple logic layers.
 * @param {Object} outfit - The generated outfit object
 * @param {Object} userProfile - Extracted preferences from user feedback
 * @param {String} event - The requested event label
 * @returns {Array} Top 2-3 most relevant explanation strings
 */
export const generateWhyReasons = (outfit, userProfile, event) => {
    const reasons = [];
    const items = outfit.items || {};
    const colorPalette = (outfit.colorPalette || []).map(c => c.toLowerCase());
    const activeItems = Object.values(items).filter(Boolean);

    // 1. USER PREFERENCES (Step 1)
    if (userProfile) {
        const { preferredColors, preferredStyles, savedOutfitSignatures } = userProfile;
        
        // Check for preferred colors
        const hasFavColor = colorPalette.some(c => preferredColors?.includes(c));
        if (hasFavColor) reasons.push("Includes colors you often like");

        // Check for style match
        const hasFavStyle = activeItems.some(item => 
            item.styleTags?.some(tag => preferredStyles?.includes(tag.toLowerCase()))
        );
        if (hasFavStyle) reasons.push("Matches your preferred style");

        // Check for saved similarity
        if (outfit.id && savedOutfitSignatures?.includes(outfit.id)) {
            reasons.push("Similar to your saved outfits");
        }
    }

    // 2. EVENT MATCH (Step 2)
    if (event && event !== 'all') {
        reasons.push(`Perfect for ${event}`);
    }

    // 3. COLOR LOGIC (Step 3)
    const isNeutral = colorPalette.every(c => 
        ['black', 'white', 'gray', 'grey', 'beige', 'navy', 'brown', '#000000', '#ffffff'].includes(c) ||
        (c.startsWith('#') && isColorNeutral(c))
    );
    if (isNeutral && colorPalette.length > 0) {
        reasons.push("Balanced neutral color palette");
    } else if (colorPalette.length >= 2) {
        reasons.push("Well-matched color combination");
    }

    // 4. STYLE LOGIC (Step 4)
    if (userProfile?.preferredStyles?.length > 0) {
        const topStyle = userProfile.preferredStyles[0];
        const matchesTopStyle = activeItems.some(item => 
            item.styleTags?.some(tag => tag.toLowerCase() === topStyle)
        );
        if (matchesTopStyle) {
            reasons.push(`Fits your ${topStyle} aesthetic`);
        }
    }

    // 5. OUTFIT STRUCTURE (Step 5)
    if (items.layer) {
        reasons.push("Layered for a complete look");
    } else if (items.top && items.bottom) {
        reasons.push("Well-balanced outfit composition");
    }

    // 6. LIMIT OUTPUT (Step 6)
    // De-duplicate and take top 2-3
    const uniqueReasons = [...new Set(reasons)];
    
    // Sort logic: User specific > Event > Structure > Color
    // (They are already pushed in roughly this order)
    return uniqueReasons.slice(0, 3);
};

/**
 * Helper to check if a hex color is roughly neutral
 */
function isColorNeutral(hex) {
    // Simple check: if R, G, B are close to each other
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return false;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return (max - min) < 30; // 30 is a tolerance
}
