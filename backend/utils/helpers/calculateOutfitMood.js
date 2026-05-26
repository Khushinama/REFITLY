import { matchesKeyword } from "./eventCompatibility.js";

/**
 * Evaluates the overall cohesion and vibe consistency of an outfit.
 * @param {object} items - The outfit items { top, bottom, dress, layer, shoes }
 * @returns {object} { dominantMood, consistencyScore, moodType }
 */
export function calculateOutfitMood(items) {
    const activeItems = Object.values(items).filter(Boolean);
    if (activeItems.length === 0) {
        return {
            dominantMood: "Empty Outfit",
            consistencyScore: 0,
            moodType: "mixed"
        };
    }

    const vibes = activeItems.map(item => item.vibe || "casual");
    const uniqueVibes = [...new Set(vibes)];

    // Check specific items / tags for refined mood detection
    const hasHeels = activeItems.some(item => matchesKeyword(item, "heels"));
    const hasSkirt = activeItems.some(item => matchesKeyword(item, "skirts"));
    const hasFittedTop = activeItems.some(item => matchesKeyword(item, "fitted tops"));
    const hasDress = Boolean(items.dress);
    
    const hasBlazer = activeItems.some(item => 
        (item.name || "").toLowerCase().includes("blazer") || 
        (item.type || "").toLowerCase() === "blazer"
    );
    const hasTrousers = activeItems.some(item => 
        (item.name || "").toLowerCase().includes("trouser") || 
        (item.name || "").toLowerCase().includes("pants")
    );
    const hasLoafers = activeItems.some(item => matchesKeyword(item, "loafers"));
    const hasSneakers = activeItems.some(item => matchesKeyword(item, "sneakers"));
    const hasHoodie = activeItems.some(item => matchesKeyword(item, "hoodies"));
    const hasSportswear = activeItems.some(item => matchesKeyword(item, "sportswear"));
    const hasJeans = activeItems.some(item => matchesKeyword(item, "jeans"));
    const hasPlainTshirt = activeItems.some(item => matchesKeyword(item, "plain tshirt"));

    // Check for streetwear style tags
    const hasStreetwearTag = activeItems.some(item => 
        (item.styleTags || []).map(t => t.toLowerCase()).includes("streetwear")
    );

    let consistencyScore = 100;
    let dominantMood = "Balanced Mix";
    let moodType = "mixed";

    // Vibe conflicting rules
    const hasSporty = vibes.includes("sporty");
    const hasClassy = vibes.includes("classy");
    const hasCasual = vibes.includes("casual");

    // Conflicting vibes penalty
    if (hasClassy && hasSporty) {
        consistencyScore -= 60; // Huge penalty for classy + sporty (e.g. blazer + trackpants, or heels + hoodie)
    }

    // Specific confused configurations
    if (hasPlainTshirt && hasSkirt && hasHeels) {
        consistencyScore -= 40; // Plain tee with classy skirt and heels
    }
    if (hasHoodie && (hasHeels || hasSkirt)) {
        consistencyScore -= 50; // Hoodie with heels or skirt
    }
    if (hasSneakers && hasDress && !hasStreetwearTag) {
        consistencyScore -= 40; // Formal/classy dress with casual/sporty sneakers without streetwear vibe
    }

    // Determine Dominant Mood and Mood Type
    if (consistencyScore < 50) {
        dominantMood = "Confused Mixed Styling";
        moodType = "mixed";
    } else if ((hasHeels && hasSkirt && hasFittedTop) || (hasHeels && hasDress)) {
        dominantMood = "Sophisticated Elegance";
        moodType = "elegant";
        consistencyScore = Math.max(consistencyScore, 90);
    } else if (hasBlazer && hasTrousers && hasLoafers) {
        dominantMood = "Professional Business";
        moodType = "professional";
        consistencyScore = Math.max(consistencyScore, 95);
    } else if (hasBlazer && (hasJeans || hasCasual) && !hasSporty) {
        dominantMood = "Smart Casual";
        moodType = "professional";
        consistencyScore = Math.max(consistencyScore, 85);
    } else if (hasStreetwearTag && (hasSneakers || hasHoodie)) {
        dominantMood = "Urban Streetwear";
        moodType = "relaxed";
        consistencyScore = Math.max(consistencyScore, 85);
    } else if (uniqueVibes.length === 1) {
        if (uniqueVibes[0] === "classy") {
            dominantMood = "Sophisticated Elegance";
            moodType = "elegant";
        } else if (uniqueVibes[0] === "sporty") {
            dominantMood = "Sporty Athleisure";
            moodType = "relaxed";
        } else {
            dominantMood = "Casual Comfort";
            moodType = "relaxed";
        }
    } else if (hasClassy && hasCasual) {
        dominantMood = "Smart Casual";
        moodType = "professional";
    } else if (hasSporty && hasCasual) {
        dominantMood = "Sporty Casual";
        moodType = "relaxed";
    }

    // Clamp score
    consistencyScore = Math.max(10, Math.min(100, consistencyScore));

    return {
        dominantMood,
        consistencyScore,
        moodType
    };
}
