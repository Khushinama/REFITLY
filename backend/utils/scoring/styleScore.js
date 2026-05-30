/**
 * Calculates the style alignment score for an outfit.
 * @param {Object} items - { top, bottom, layer, footwear, dress }
 * @param {Object} user - User object with stylePreference
 * @param {String} requestedEvent - The target event
 * @param {Array} requestedStyles - Array of style strings from query
 * @returns {Object} { score, reasons }
 */
export const calculateStyleScore = (items, user, requestedEvent, requestedStyles = []) => {
    let score = 0;
    const reasons = [];
    const activeItems = Object.values(items).filter(item => item !== null);
    
    if (activeItems.length === 0) return { score: 0, reasons: [] };

    const userPrefs = user.stylePreference?.map(p => p.toLowerCase()) || [];
    const activePrefs = requestedStyles.length > 0 ? requestedStyles.map(s => s.toLowerCase()) : userPrefs;
    const requestedEvents = Array.isArray(requestedEvent) ? requestedEvent : [String(requestedEvent || '').toLowerCase()];

    // 1. Tag matching (+20 per item)
    let matchingTagsCount = 0;
    activeItems.forEach(item => {
        const itemTags = item.styleTags?.map(t => String(t).toLowerCase()) || [];
        const matches = itemTags.filter(tag => activePrefs.includes(tag));
        if (matches.length > 0) {
            score += 20;
            matchingTagsCount++;
        }
    });

    // 2. Layering bonus (+15)
    if (items.layer && (activePrefs.includes("trendy") || activePrefs.includes("streetwear"))) {
        score += 15;
        reasons.push("Layering adds depth and matches your trendy aesthetic 🧥");
    }

    // 3. Minimal bonus (+15)
    const distinctColors = [...new Set(activeItems.map(i => i.color?.toLowerCase()))];
    const isSolid = activeItems.every(i => i.pattern?.toLowerCase() === "solid" || !i.pattern);
    if (distinctColors.length <= 2 && isSolid && activePrefs.includes("minimal")) {
        score += 15;
        reasons.push("Clean minimal vibe — just your style ");
    }

    // 4. Classy/Formal bonus (+10)
    const hasClassy = activeItems.some(i => i.styleTags?.some(t => String(t).toLowerCase() === "classy"));
    if (hasClassy && requestedEvents.some(e => e === "formal" || e === "wedding")) {
        score += 10;
        reasons.push("Maintains a sophisticated look for formal settings 💎");
    }

    // 5. Total Mismatch Penalty (-10)
    const totalTags = activeItems.flatMap(i => i.styleTags || []).map(t => t.toLowerCase());
    const hasAnyMatch = totalTags.some(tag => activePrefs.includes(tag));
    if (!hasAnyMatch && activePrefs.length > 0) {
        score -= 10;
    }

    // Normalize score
    // Max could be 100+ but we cap it. 
    // If we have 3 items matching tags, score is already 60.
    const normalizedScore = Math.min(100, Math.max(0, score));
    
    if (matchingTagsCount >= 2) {
        reasons.push(`Matches your ${activePrefs[0] || 'unique'} aesthetic perfectly`);
    }

    return {
        score: normalizedScore,
        reasons
    };
};
