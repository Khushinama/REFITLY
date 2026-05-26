import { NEUTRALS, COLOR_RELATIONS, SKIN_TONE_PALETTES } from "../helpers/constants.js";
import { EVENT_COMPATIBILITY, matchesKeyword, getItemVibe } from "../helpers/eventCompatibility.js";
import { calculateOutfitMood } from "../helpers/calculateOutfitMood.js";

/**
 * Advanced outfit scoring utility.
 * Evaluates outfit combinations against event, style, season, color, and footwear rules.
 * Normalizes scores into a realistic 0-100% scale.
 */
export const calculateOutfitScore = (items, options = {}) => {
    const {
        event = "casual",
        style = [],
        season = "all",
        user = {},
        recentlyWornSignatures = []
    } = options;

    const requestedEvents = Array.isArray(event) 
        ? event.map(e => e.toLowerCase()) 
        : [String(event || '').toLowerCase()];
    
    const requestedStyles = Array.isArray(style) 
        ? style.map(s => s.toLowerCase()) 
        : (style ? [style.toLowerCase()] : []);

    const requestedSeason = String(season || 'all').toLowerCase();

    // Extract active items
    const activeItems = Object.entries(items)
        .filter(([_, item]) => Boolean(item))
        .map(([key, item]) => ({ key, ...item }));

    if (activeItems.length === 0) return { score: 0, matchBreakdown: { color: 0, style: 0, event: 0, season: 0, footwear: 0 } };

    // Determine helper flags
    const isDateNight = requestedEvents.some(e => e.includes("date") || e.includes("night")) || 
                        (requestedEvents.includes("party") && requestedEvents.includes("casual"));
    const isOffice = requestedEvents.some(e => e.includes("office") || e.includes("business") || e.includes("work")) || 
                     (requestedEvents.includes("formal") && requestedEvents.includes("office"));
    const isClassyStyle = requestedStyles.includes("classy");

    // ----------------------------------------------------
    // 1. EVENT MATCHING & PENALTIES (Max 40 points base, plus bonuses/penalties)
    // ----------------------------------------------------
    let eventScore = 0;
    let eventDirectMatchCount = 0;
    let eventMismatchCount = 0;

    activeItems.forEach(item => {
        const itemEvents = Array.isArray(item.event) 
            ? item.event.map(e => String(e).toLowerCase()) 
            : [String(item.event || '').toLowerCase()];

        const isDirect = itemEvents.some(ie => requestedEvents.includes(ie));
        
        if (isDirect) {
            eventDirectMatchCount++;
            eventScore += 8; // Direct match points per item
        } else {
            // Check for strict mismatch
            const hasCommonTags = itemEvents.some(ie => {
                if (requestedEvents.includes("casual") && ["formal", "wedding", "office"].includes(ie)) return false;
                if (requestedEvents.includes("formal") && ["casual", "streetwear", "sportswear"].includes(ie)) return false;
                return true;
            });
            if (!hasCommonTags) {
                eventMismatchCount++;
            }
        }
    });

    // Base event matching calculations
    let baseEventScore = (eventDirectMatchCount / activeItems.length) * 40;
    eventScore = baseEventScore + eventScore;
    
    // Penalize if mismatches exist
    if (eventMismatchCount > 0) {
        eventScore -= (eventMismatchCount * 15);
    }

    // Apply Event Compatibility Rules & Hard Penalties (Issue 2, Section 1 & 2)
    let eventHardPenalty = 0;
    let eventStrongBonus = 0;

    if (isDateNight) {
        // Preferred: heels, skirts, fitted tops, elegant silhouettes
        // Avoid: plain tshirt, sportswear, hoodies, casual sneakers
        let preferredCount = 0;
        let avoidCount = 0;

        activeItems.forEach(item => {
            if (matchesKeyword(item, "heels") || matchesKeyword(item, "skirts") || matchesKeyword(item, "fitted tops") || matchesKeyword(item, "elegant silhouettes")) {
                preferredCount++;
            }
            if (matchesKeyword(item, "plain tshirt") || matchesKeyword(item, "sportswear") || matchesKeyword(item, "hoodies") || matchesKeyword(item, "casual sneakers")) {
                avoidCount++;
            }
        });

        // 🚨 Hard Penalty System: Date Night + Avoid items -> score -= 50
        if (avoidCount > 0) {
            eventHardPenalty -= 50;
        }

        // Strong Match: contains at least 2 preferred items and 0 avoid items -> score += 40
        if (preferredCount >= 2 && avoidCount === 0) {
            eventStrongBonus += 40;
        }
    } else if (isOffice) {
        // Preferred: blazers, trousers, loafers
        // Avoid: crop tops, partywear
        let preferredCount = 0;
        let avoidCount = 0;

        activeItems.forEach(item => {
            if (matchesKeyword(item, "blazers") || matchesKeyword(item, "trousers") || matchesKeyword(item, "loafers")) {
                preferredCount++;
            }
            if (matchesKeyword(item, "crop tops") || matchesKeyword(item, "partywear")) {
                avoidCount++;
            }
        });

        if (avoidCount > 0) {
            eventHardPenalty -= 30; // Custom penalty for office mismatch
        }

        if (preferredCount >= 2 && avoidCount === 0) {
            eventStrongBonus += 40;
        }
    } else {
        // Casual / Other
        let preferredCount = 0;
        activeItems.forEach(item => {
            if (matchesKeyword(item, "sneakers") || matchesKeyword(item, "jeans") || matchesKeyword(item, "tshirts")) {
                preferredCount++;
            }
        });

        if (preferredCount >= 2) {
            eventStrongBonus += 40;
        }
    }

    // Clamp Event Score to base range [-20, 40]
    eventScore = Math.max(-20, Math.min(40, eventScore));

    // ----------------------------------------------------
    // 2. STYLE MATCHING (Max 30 points base)
    // ----------------------------------------------------
    let styleScore = 0;
    let styleMatchCount = 0;
    let styleMismatchCount = 0;

    activeItems.forEach(item => {
        const itemTags = (item.styleTags || []).map(t => t.toLowerCase());

        const matches = itemTags.filter(tag => requestedStyles.includes(tag));
        if (matches.length > 0) {
            styleMatchCount++;
            styleScore += 10;
        }

        // Specific style rules
        requestedStyles.forEach(reqS => {
            const nameLower = item.name?.toLowerCase() || "";
            const colorLower = item.color?.toLowerCase() || "";
            const patternLower = item.pattern?.toLowerCase() || "";

            // Minimal Style Match
            if (reqS === "minimal") {
                const isNeutral = NEUTRALS.includes(colorLower);
                const isSolid = patternLower === "solid" || !patternLower;
                if (isNeutral && isSolid) {
                    styleScore += 4;
                } else if (patternLower === "printed" || patternLower === "floral") {
                    styleMismatchCount++;
                }
            }

            // Trendy Style Match
            if (reqS === "trendy") {
                if (itemTags.includes("streetwear") || itemTags.includes("bohemian") || nameLower.includes("crop") || nameLower.includes("neon")) {
                    styleScore += 4;
                }
            }
        });
    });

    let baseStyleScore = (styleMatchCount / activeItems.length) * 30;
    styleScore = baseStyleScore + styleScore;

    if (styleMismatchCount > 0) {
        styleScore -= (styleMismatchCount * 10);
    }
    styleScore = Math.max(-15, Math.min(30, styleScore));

    // 🚨 Strict Style Matching: Classy (Issue 2, Section 3)
    let strictStylePenalty = 0;
    if (isClassyStyle) {
        let classyCount = 0;
        let wrongStyleCount = 0;

        activeItems.forEach(item => {
            const nameLower = (item.name || "").toLowerCase();
            const tags = (item.styleTags || []).map(t => t.toLowerCase());
            const typeLower = (item.type || "").toLowerCase();

            const hasClassyIndicator = 
                tags.includes("classy") || 
                tags.includes("elegant") || 
                tags.includes("formal") ||
                tags.includes("polished") ||
                nameLower.includes("elegant") ||
                nameLower.includes("polished") ||
                nameLower.includes("heels") ||
                nameLower.includes("blazer") ||
                typeLower === "blazer" ||
                nameLower.includes("trouser") ||
                nameLower.includes("suit") ||
                nameLower.includes("tailored");

            if (hasClassyIndicator) {
                classyCount++;
            }

            const hasWrongIndicator = 
                tags.includes("streetwear") || 
                tags.includes("sportswear") || 
                tags.includes("sporty") ||
                nameLower.includes("hoodie") ||
                nameLower.includes("tshirt") ||
                nameLower.includes("t-shirt") ||
                nameLower.includes("tee") ||
                nameLower.includes("sneaker") ||
                nameLower.includes("cargo") ||
                tags.includes("trendy") ||
                tags.includes("minimal");

            if (hasWrongIndicator && !hasClassyIndicator) {
                wrongStyleCount++;
            }
        });

        // Wrong style: score -= 40
        if (wrongStyleCount > 0 && classyCount < 2) {
            strictStylePenalty -= 40;
        }
    }

    // ----------------------------------------------------
    // 3. ITEM VIBE PENALTY (Issue 2, Section 4)
    // ----------------------------------------------------
    let itemVibePenalty = 0;
    if (isDateNight && isClassyStyle) {
        const hasCasualVibe = activeItems.some(item => getItemVibe(item) === "casual");
        if (hasCasualVibe) {
            itemVibePenalty -= 35;
        }
    }

    // ----------------------------------------------------
    // 4. OUTFIT MOOD CONSISTENCY (Issue 2, Section 5)
    // ----------------------------------------------------
    const moodResult = calculateOutfitMood(items);
    let moodScore = 0;
    if (moodResult.consistencyScore >= 90) moodScore = 30;
    else if (moodResult.consistencyScore >= 80) moodScore = 20;
    else if (moodResult.consistencyScore >= 60) moodScore = 10;
    else if (moodResult.consistencyScore >= 50) moodScore = 0;
    else moodScore = -40; // Heavy penalty for confused styling

    // ----------------------------------------------------
    // 5. SEASON MATCHING (Max 15 points)
    // ----------------------------------------------------
    let seasonScore = 0;
    let seasonMatches = 0;
    let seasonMismatches = 0;

    activeItems.forEach(item => {
        const itemSeason = String(item.season || 'all').toLowerCase();
        if (itemSeason === "all" || requestedSeason === "all" || itemSeason === requestedSeason) {
            seasonMatches++;
        } else {
            seasonMismatches++;
        }
    });

    if (seasonMatches === activeItems.length) {
        seasonScore = 15;
    } else {
        seasonScore = 15 - (seasonMismatches * 15);
    }
    seasonScore = Math.max(-15, Math.min(15, seasonScore));

    // ----------------------------------------------------
    // 6. COLOR HARMONY (Max 10 points)
    // ----------------------------------------------------
    let colorScore = 0;
    const colors = activeItems.map(item => item.color?.toLowerCase()).filter(Boolean);
    const distinctColors = [...new Set(colors)];

    if (distinctColors.length > 0) {
        const isMono = distinctColors.length === 1 && activeItems.length > 1;
        const hasBlackAndWhite = colors.includes("black") && colors.includes("white");
        const hasBeigeAndCream = colors.includes("beige") && colors.includes("cream");
        const allNeutrals = colors.every(c => NEUTRALS.includes(c));

        if (isMono || hasBlackAndWhite || hasBeigeAndCream) {
            colorScore = 10;
        } else if (allNeutrals) {
            colorScore = 8;
        } else if (distinctColors.length >= 2) {
            const baseColor = distinctColors[0];
            const relations = COLOR_RELATIONS[baseColor];
            if (relations) {
                if (relations.analogous.some(a => distinctColors.includes(a))) {
                    colorScore = 8;
                } else if (distinctColors.includes(relations.complementary)) {
                    colorScore = 6;
                } else {
                    colorScore = 4;
                }
            } else {
                colorScore = 4;
            }
        } else {
            colorScore = 5;
        }

        const brights = activeItems.filter(i => i.colorFamily === "bright" || i.color?.includes("neon"));
        if (brights.length >= 2) {
            colorScore -= 10;
        }
        if (colors.includes("red") && colors.includes("pink")) {
            colorScore -= 8;
        }
    }
    colorScore = Math.max(-10, Math.min(10, colorScore));

    // ----------------------------------------------------
    // 7. FOOTWEAR PRIORITY & COMPATIBILITY (Max 15 points)
    // ----------------------------------------------------
    let footwearScore = 5; // Neutral default
    const shoes = items.footwear || items.shoes;
    const top = items.top;
    const bottom = items.bottom;
    const dress = items.dress;
    const layer = items.layer;

    if (shoes) {
        const shoesName = shoes.name?.toLowerCase() || "";
        const shoesTags = (shoes.styleTags || []).map(t => t.toLowerCase());

        // 🚨 Footwear Priority: Date Night heels vs sneakers (Issue 2, Section 6)
        if (isDateNight) {
            const hasHeels = matchesKeyword(shoes, "heels");
            const hasSneakers = matchesKeyword(shoes, "sneakers");
            const isCasualDate = requestedEvents.includes("casual");
            const isStreetwearStyle = requestedStyles.includes("streetwear") || requestedStyles.includes("trendy");

            if (hasHeels) {
                footwearScore = 15; // Heels rank MUCH higher
            } else if (hasSneakers) {
                if (isCasualDate || isStreetwearStyle) {
                    footwearScore = 8; // Acceptable for casual/streetwear date vibe
                } else {
                    footwearScore = -15; // Sneakers rank low
                }
            } else {
                footwearScore = 5;
            }
        } else {
            // General compatibility rules
            const hasSkirt = bottom && (bottom.name?.toLowerCase().includes("skirt") || bottom.fit?.toLowerCase().includes("skirt"));
            const hasHeels = shoesName.includes("heel") || shoesName.includes("pumps") || shoesName.includes("stiletto") || shoesTags.includes("heels");
            const hasJeans = bottom && (bottom.name?.toLowerCase().includes("jeans") || bottom.name?.toLowerCase().includes("denim"));
            const hasSneakers = shoesName.includes("sneaker") || shoesTags.includes("sneaker");
            const hasLoafers = shoesName.includes("loafer") || shoesName.includes("oxford") || shoesTags.includes("classy");
            const hasBlazer = (layer && layer.type?.toLowerCase() === "blazer") || (top && top.name?.toLowerCase().includes("blazer"));
            const hasCargo = bottom && (bottom.name?.toLowerCase().includes("cargo") || bottom.fit?.toLowerCase().includes("cargo"));

            if (hasHeels && (hasSkirt || dress)) {
                footwearScore = 10;
            } else if (hasSneakers && hasJeans) {
                footwearScore = 10;
            } else if (hasLoafers && hasBlazer) {
                footwearScore = 10;
            } else if (hasHeels && hasCargo) {
                footwearScore = -10;
            } else if (hasLoafers && hasSkirt && requestedEvents.includes("party")) {
                footwearScore = -5;
            } else if (hasHeels && top && (top.name?.toLowerCase().includes("crop") && top.styleTags?.includes("sportswear"))) {
                footwearScore = -10;
            } else {
                footwearScore = 6;
            }
        }
    }
    footwearScore = Math.max(-15, Math.min(15, footwearScore));

    // ----------------------------------------------------
    // 8. LAYERING BONUS (Max 10 points)
    // ----------------------------------------------------
    let layeringBonus = 0;
    if (requestedSeason === "winter" && layer) {
        const layerType = layer.type?.toLowerCase() || layer.category?.toLowerCase() || "";
        if (["blazer", "jacket", "cardigan", "coat", "hoodie"].includes(layerType)) {
            layeringBonus = 10;
        }
    }

    // ----------------------------------------------------
    // 9. TOTAL SCORE CALCULATION
    // ----------------------------------------------------
    let rawScore = eventScore + styleScore + seasonScore + colorScore + footwearScore + layeringBonus 
                     + eventHardPenalty + eventStrongBonus + strictStylePenalty + itemVibePenalty + moodScore;

    // Apply recently worn penalty (-40 points)
    const outfitSignature = Object.values(items)
        .filter(Boolean)
        .map(i => i._id?.toString())
        .sort()
        .join('-');

    if (recentlyWornSignatures.includes(outfitSignature)) {
        rawScore -= 40;
    }

    // ----------------------------------------------------
    // 10. CALIBRATION TO BELIEVABLE RANGES (Issue 2, Section 8)
    // ----------------------------------------------------
    // Excellent: 85–95
    // Good: 70–84
    // Average: 50–69
    // Weak: below 50
    let finalScore = 50; // Baseline
    
    if (rawScore >= 80) {
        // Excellent: Map rawScore [80, 120] to finalScore [85, 95]
        const ratio = (rawScore - 80) / (120 - 80);
        finalScore = Math.round(85 + Math.min(ratio, 1.0) * 10);
    } else if (rawScore >= 45) {
        // Good: Map rawScore [45, 79] to finalScore [70, 84]
        const ratio = (rawScore - 45) / (79 - 45);
        finalScore = Math.round(70 + ratio * 14);
    } else if (rawScore >= 10) {
        // Average: Map rawScore [10, 44] to finalScore [50, 69]
        const ratio = (rawScore - 10) / (44 - 10);
        finalScore = Math.round(50 + ratio * 19);
    } else {
        // Weak: Map rawScore [-100, 9] to finalScore [15, 49]
        const ratio = (rawScore - (-100)) / (9 - (-100));
        finalScore = Math.round(15 + Math.min(ratio, 1.0) * 34);
    }

    // Ensure realistic bounds
    finalScore = Math.max(10, Math.min(95, finalScore));

    return {
        score: finalScore,
        matchBreakdown: {
            color: Math.round(Math.max(0, Math.min(100, ((colorScore + 10) / 20) * 100))),
            style: Math.round(Math.max(0, Math.min(100, ((styleScore + 15) / 45) * 100))),
            event: Math.round(Math.max(0, Math.min(100, ((eventScore + 20) / 60) * 100))),
            season: Math.round(Math.max(0, Math.min(100, ((seasonScore + 15) / 30) * 100))),
            footwear: Math.round(Math.max(0, Math.min(100, ((footwearScore + 15) / 30) * 100)))
        }
    };
};
