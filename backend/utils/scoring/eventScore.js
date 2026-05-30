import { EVENT_MATCH_MAP, STRICT_MISMATCH } from "../helpers/constants.js";

/**
 * Calculates the event suitability score for an outfit.
 * @param {Object} items - { top, bottom, layer, footwear, dress }
 * @param {String} requestedEvent - The target event
 * @returns {Object} { score, reasons }
 */
export const calculateEventScore = (items, requestedEvent) => {
    let score = 0;
    const reasons = [];
    const activeItems = Object.values(items).filter(item => item !== null);
    
    if (activeItems.length === 0) return { score: 0, reasons: [] };

    const requestedEvents = Array.isArray(requestedEvent) ? requestedEvent : [String(requestedEvent || '').toLowerCase()];
    
    let matchingItemsCount = 0;
    
    activeItems.forEach(item => {
        const itemEvents = Array.isArray(item.event) 
            ? item.event.map(e => String(e).toLowerCase()) 
            : [String(item.event || '').toLowerCase()];
            
        let itemMaxScore = 0;
        let isDirectMatch = false;
        
        requestedEvents.forEach(reqE => {
            const event = String(reqE || '').toLowerCase();
            const flexibleMatches = EVENT_MATCH_MAP[event] || [];
            const mismatches = STRICT_MISMATCH[event] || [];

            if (itemEvents.includes(event)) {
                itemMaxScore = Math.max(itemMaxScore, 40); // Increased from 30
                isDirectMatch = true;
            } else if (itemEvents.some(ie => flexibleMatches.includes(ie))) {
                itemMaxScore = Math.max(itemMaxScore, 10); // Reduced from 15 to favor direct matches
            } else if (item.styleTags?.some(tag => tag.toLowerCase() === "all-occasion")) {
                itemMaxScore = Math.max(itemMaxScore, 5);
            } else {
                // HARD PENALTY for mismatch
                itemMaxScore = Math.max(itemMaxScore, -40); 
            }

            // Additional penalty for being too generic
            if (item.isGeneric) {
                itemMaxScore -= 10;
            }
        });

        if (isDirectMatch) matchingItemsCount++;
        score += itemMaxScore;
    });

    // Average score per item
    let avgScore = (score / activeItems.length);
    
    // REQUIREMENT: Ensure at least 2 items match event strongly
    // If not, we apply a significant penalty to the overall outfit score
    if (matchingItemsCount < 2 && activeItems.length >= 2) {
        avgScore -= 20; 
    }

    if (avgScore >= 30) {
        reasons.push(`Perfectly curated for ${requestedEvent} occasions `);
    } else if (avgScore >= 15) {
        reasons.push(`Versatile pieces that work for ${requestedEvent} settings 💼`);
    } else {
        reasons.push(`Context match could be stronger for this event ⚠️`);
    }

    // Normalize to 0-100 scale (shifted because of higher itemMaxScore)
    // 40 is now the "perfect" score per item.
    const normalizedScore = Math.max(0, Math.min(100, (avgScore / 40) * 100));

    return {
        score: normalizedScore,
        reasons
    };
};
