import { BODY_TYPE_RULES } from "../helpers/constants.js";

/**
 * Calculates the body type fit score for an outfit.
 * @param {Object} items - { top, bottom, layer, footwear, dress }
 * @param {String} bodyType - User's body type
 * @returns {Object} { score, reason }
 */
export const calculateBodyScore = (items, bodyType) => {
    if (!bodyType) return { score: 50, reasons: [] };

    const normalizedBodyType = bodyType.toLowerCase().replace(/\s+/g, '-');
    const rules = BODY_TYPE_RULES[normalizedBodyType];
    
    if (!rules) return { score: 50, reasons: [] };

    let score = 0;
    const reasons = [];
    let itemsEvaluated = 0;

    const checkFit = (item, typeRules) => {
        if (!item || !typeRules) return 0;
        
        itemsEvaluated++;
        const fit = item.fit?.toLowerCase();
        
        if (!fit) return 10; // Neutral for unknown fit

        if (typeRules.preferred.includes(fit)) {
            return 30;
        }
        if (typeRules.avoid.includes(fit)) {
            return -20;
        }
        return 5; // Slight bonus for not being in 'avoid'
    };

    // Evaluate tops
    if (items.top) {
        const s = checkFit(items.top, rules.tops);
        score += s;
        if (s === 30) reasons.push(`Structured fit of the top flatters your ${bodyType} shape beautifully 💫`);
    }

    // Evaluate bottoms
    if (items.bottom) {
        const s = checkFit(items.bottom, rules.bottoms);
        score += s;
        if (s === 30) reasons.push("A-line silhouette enhances your natural shape");
    }

    // Evaluate dresses (can count as both top/bottom logic or separate)
    if (items.dress) {
        const sTop = checkFit(items.dress, rules.tops);
        const sBottom = checkFit(items.dress, rules.bottoms);
        score += (sTop + sBottom) / 2;
        if (sTop === 30 || sBottom === 30) reasons.push("Dress cut picked to compliment your proportions");
    }

    // Normalize score to 0-100 scale (approximate)
    // If we have 2 items, max score is 60. Let's scale based on items evaluated.
    const maxPossible = itemsEvaluated * 30;
    const finalScore = maxPossible > 0 ? (score / maxPossible) * 100 : 50;

    return {
        score: Math.max(0, Math.min(100, finalScore)),
        reasons: [...new Set(reasons)]
    };
};
