/**
 * Extracts user preferences based on their liked and disliked outfits.
 * @param {Object} user - The user object containing likedOutfits, dislikedOutfits, savedOutfits
 * @returns {Object} userProfile - Extracted preferences
 */
export const extractUserPreferences = (user) => {
    const prefs = {
        preferredColors: {},
        preferredStyles: {},
        preferredCategories: {}, // "top:shirt", "bottom:jeans"
        preferredPatterns: {},
        dislikedColors: {},
        dislikedStyles: {},
        dislikedCategories: {},
        dislikedPatterns: {}
    };

    const processOutfits = (outfits, type) => {
        if (!outfits || !Array.isArray(outfits)) return;
        
        const colors = type === 'positive' ? prefs.preferredColors : prefs.dislikedColors;
        const styles = type === 'positive' ? prefs.preferredStyles : prefs.dislikedStyles;
        const categories = type === 'positive' ? prefs.preferredCategories : prefs.dislikedCategories;
        const patterns = type === 'positive' ? prefs.preferredPatterns : prefs.dislikedPatterns;

        outfits.forEach(outfit => {
            // Colors
            if (outfit.colorPalette && Array.isArray(outfit.colorPalette)) {
                outfit.colorPalette.forEach(color => {
                    const c = color.toLowerCase();
                    colors[c] = (colors[c] || 0) + 1;
                });
            }
            
            // Item specific data
            const items = outfit.items || {};
            Object.entries(items).forEach(([key, item]) => {
                if (!item) return;

                // Categories (e.g., "top:t-shirt")
                if (item.category && item.subCategory) {
                    const catKey = `${item.category}:${item.subCategory}`.toLowerCase();
                    categories[catKey] = (categories[catKey] || 0) + 1;
                }

                // Patterns
                if (item.pattern) {
                    const p = item.pattern.toLowerCase();
                    patterns[p] = (patterns[p] || 0) + 1;
                }

                // Styles
                if (item.styleTags && Array.isArray(item.styleTags)) {
                    item.styleTags.forEach(tag => {
                        const t = tag.toLowerCase();
                        styles[t] = (styles[t] || 0) + 1;
                    });
                }
            });
        });
    };

    processOutfits(user.likedOutfits, 'positive');
    processOutfits(user.savedOutfits, 'positive');
    processOutfits(user.dislikedOutfits, 'negative');

    const getTopN = (map, n = 10) => {
        return Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .slice(0, n)
            .map(entry => entry[0]);
    };

    return {
        preferredColors: getTopN(prefs.preferredColors),
        preferredStyles: getTopN(prefs.preferredStyles),
        preferredCategories: getTopN(prefs.preferredCategories),
        preferredPatterns: getTopN(prefs.preferredPatterns),
        dislikedColors: getTopN(prefs.dislikedColors),
        dislikedStyles: getTopN(prefs.dislikedStyles),
        dislikedCategories: getTopN(prefs.dislikedCategories),
        dislikedPatterns: getTopN(prefs.dislikedPatterns)
    };
};

/**
 * Calculates the personalization score for a specific outfit.
 * @param {Object} items - { top, bottom, layer, footwear, dress }
 * @param {Array} colorPalette - Colors of the current outfit
 * @param {Object} userProfile - Profile extracted from extractUserPreferences
 * @returns {Object} { score, reasons }
 */
export const calculatePersonalizationScore = (items, colorPalette, userProfile) => {
    let score = 0;
    const reasons = [];
    
    if (!userProfile) return { score: 0, reasons: [] };

    const {
        preferredColors = [],
        preferredStyles = [],
        preferredCategories = [],
        preferredPatterns = [],
        dislikedColors = [],
        dislikedStyles = [],
        dislikedCategories = [],
        dislikedPatterns = []
    } = userProfile;

    const activeItems = Object.entries(items).filter(([_, item]) => Boolean(item));
    if (activeItems.length === 0) return { score: 0, reasons: [] };

    // 1. COLOR MATCH (+10 / -20)
    let colorMatchCount = 0;
    let colorDislikeCount = 0;
    (colorPalette || []).forEach(color => {
        const c = color.toLowerCase();
        if (preferredColors.includes(c)) colorMatchCount++;
        if (dislikedColors.includes(c)) colorDislikeCount++;
    });

    if (colorMatchCount > 0) {
        score += 10;
        reasons.push("Features colors you often enjoy 🎨");
    }
    if (colorDislikeCount > 0) {
        score -= 20;
    }

    // 2. STYLE MATCH (+15 / -25)
    let styleMatchCount = 0;
    let styleDislikeCount = 0;
    activeItems.forEach(([_, item]) => {
        const tags = item.styleTags?.map(t => String(t).toLowerCase()) || [];
        if (tags.some(t => preferredStyles.includes(t))) styleMatchCount++;
        if (tags.some(t => dislikedStyles.includes(t))) styleDislikeCount++;
    });

    if (styleMatchCount > 0) {
        score += 15;
        reasons.push("Matches your recently liked aesthetics ");
    }
    if (styleDislikeCount > 0) {
        score -= 25;
    }

    // 3. CATEGORY MATCH (+8)
    let categoryMatchCount = 0;
    let categoryDislikeCount = 0;
    activeItems.forEach(([_, item]) => {
        const catKey = `${item.category}:${item.subCategory}`.toLowerCase();
        if (preferredCategories.includes(catKey)) categoryMatchCount++;
        if (dislikedCategories.includes(catKey)) categoryDislikeCount++;
    });

    if (categoryMatchCount > 0) {
        score += 8;
        reasons.push("Includes items similar to your favorites 👗");
    }

    // 4. PATTERN MATCH
    let patternMatchCount = 0;
    let patternDislikeCount = 0;
    activeItems.forEach(([_, item]) => {
        if (!item.pattern) return;
        const p = item.pattern.toLowerCase();
        if (preferredPatterns.includes(p)) patternMatchCount++;
        if (dislikedPatterns.includes(p)) patternDislikeCount++;
    });

    if (patternMatchCount > 0) {
        score += 5; // Subtle boost for patterns
    }

    // 5. DISLIKE PENALTY (-30)
    // If the outfit resembles a combination they disliked (e.g., color + style both match dislike)
    if ((colorDislikeCount > 0 && styleDislikeCount > 0) || (styleDislikeCount > 1)) {
        score -= 30;
    }

    return {
        score,
        reasons
    };
};
