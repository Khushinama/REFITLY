import { NEUTRALS, COLOR_RELATIONS, SKIN_TONE_PALETTES } from "../helpers/constants.js";

/**
 * Calculates the color harmony score for an outfit.
 * @param {Object} items - { top, bottom, layer, footwear, dress }
 * @param {Object} user - User object with skinTone and favoriteColors
 * @returns {Object} { score, reason }
 */
export const calculateColorScore = (items, user) => {
    let score = 0;
    const reasons = [];
    
    const activeItems = Object.values(items).filter(item => item !== null);
    const colors = activeItems.map(item => item.color?.toLowerCase());
    const families = activeItems.map(item => item.colorFamily?.toLowerCase());
    const patterns = activeItems.map(item => item.pattern?.toLowerCase());
    
    const distinctColors = [...new Set(colors)];
    const distinctFamilies = [...new Set(families)];
    
    // 1. Neutral Base Rule (+30)
    const hasNeutral = colors.some(color => NEUTRALS.includes(color));
    if (hasNeutral) {
        score += 30;
        reasons.push("Neutral tones create a balanced foundation ");
    }
    
    // 2. Monochromatic (+25)
    if (distinctFamilies.length === 1 && activeItems.length > 1) {
        score += 25;
        reasons.push(`Monochromatic ${distinctFamilies[0]} tones are slimming and trendy 🤎`);
    }
    
    // 3. Analogous (+20)
    let isAnalogous = false;
    if (distinctColors.length >= 2) {
        // Check if all colors are analogous to at least one other color in the set
        // For simplicity, check if the first color is analogous to any other
        const baseColor = distinctColors[0];
        const relations = COLOR_RELATIONS[baseColor];
        if (relations && relations.analogous.some(a => distinctColors.includes(a))) {
            isAnalogous = true;
            score += 20;
            reasons.push("Analogous color harmony creates a soft aesthetic 🎨");
        }
    }
    
    // 4. Complementary (+15)
    if (!isAnalogous && distinctColors.length >= 2) {
        const baseColor = distinctColors[0];
        const relations = COLOR_RELATIONS[baseColor];
        if (relations && distinctColors.includes(relations.complementary)) {
            score += 15;
            reasons.push("Complementary colors add eye-catching contrast 🌈");
        }
    }
    
    // 5. Favorite Colors (+15)
    const hasFavorite = user.favoriteColors?.some(fav => colors.includes(fav.toLowerCase()));
    if (hasFavorite) {
        score += 15;
        reasons.push("Includes your favorite colors 💖");
    }
    
    // 6. Skin Tone Palettes (+10)
    const palette = SKIN_TONE_PALETTES[user.skinTone?.toLowerCase()] || [];
    const matchesSkinTone = colors.some(color => palette.includes(color));
    if (matchesSkinTone) {
        score += 10;
        reasons.push("Colors picked to complement your skin tone ");
    }
    
    // Penalties
    // -20 if more than 3 distinct colors
    if (distinctColors.length > 3) {
        score -= 20;
    }
    
    // -15 if pattern+pattern (printed/floral)
    const bushyPatterns = patterns.filter(p => p === "printed" || p === "floral" || p === "striped" || p === "checked");
    if (bushyPatterns.length >= 2) {
        score -= 15;
    }
    
    // -10 if clashing (simplistic rule: red+pink if not explicitly analogous)
    if (colors.includes("red") && colors.includes("pink")) {
        score -= 10;
    }
    
    return {
        score: Math.max(0, Math.min(100, score)),
        reasons
    };
};
