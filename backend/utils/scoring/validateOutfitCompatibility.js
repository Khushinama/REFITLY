import { matchesKeyword } from "../helpers/eventCompatibility.js";
import { checkIsDateNight, checkIsOffice } from "../helpers/eventCompatibilityMatrix.js";
import { calculateOutfitMood } from "../helpers/calculateOutfitMood.js";

/**
 * Validates whether an outfit combination satisfies all hard rules and styling constraints.
 * @param {object} items - The outfit items { top, bottom, dress, layer, shoes }
 * @param {object} options - The search/recommendation options { event, style, season }
 * @returns {object} { valid: boolean, reason: string }
 */
export function validateOutfitCompatibility(items, options = {}) {
    const {
        event = [],
        style = [],
        season = "all"
    } = options;

    const requestedEvents = Array.isArray(event) 
        ? event.map(e => e.toLowerCase()) 
        : [String(event || '').toLowerCase()];
    
    const requestedStyles = Array.isArray(style) 
        ? style.map(s => s.toLowerCase()) 
        : (style ? [style.toLowerCase()] : []);

    const requestedSeason = String(season || 'all').toLowerCase();

    const activeItems = Object.values(items).filter(Boolean);
    if (activeItems.length === 0) {
        return { valid: false, reason: "Outfit is empty." };
    }

    // Determine helper flags
    const isDateNight = checkIsDateNight(requestedEvents);
    const isOffice = checkIsOffice(requestedEvents);
    const isClassyStyle = requestedStyles.includes("classy");

    // 1. Mood & Vibe Consistency Check
    const mood = calculateOutfitMood(items);
    if (mood.consistencyScore < 50) {
        return { valid: false, reason: `Low vibe consistency score (${mood.consistencyScore}/100) for mood: ${mood.dominantMood}` };
    }

    // 2. Event-Specific Hard Restrictions
    if (isDateNight) {
        // Date Night: Avoid tshirts, sportswear, hoodies, casual sneakers
        const hasAvoidItem = activeItems.some(item => 
            matchesKeyword(item, "tshirts") || 
            matchesKeyword(item, "sportswear") || 
            matchesKeyword(item, "hoodies") || 
            matchesKeyword(item, "casual sneakers")
        );
        if (hasAvoidItem) {
            return { valid: false, reason: "Date night outfits cannot contain t-shirts, hoodies, sportswear, or casual sneakers." };
        }

        // Classy Date Night: Mandate Heels or elegant footwear
        const shoes = items.shoes || items.footwear;
        if (isClassyStyle && shoes) {
            const hasHeels = matchesKeyword(shoes, "heels");
            const hasLoafers = matchesKeyword(shoes, "loafers");
            if (!hasHeels && !hasLoafers) {
                return { valid: false, reason: "Classy Date Night outfits require elegant heels or loafers." };
            }
        }
    }

    if (isOffice) {
        // Office: Avoid crop tops, partywear, hoodies, sportswear, t-shirts, or jeans
        const hasAvoidItem = activeItems.some(item => 
            matchesKeyword(item, "crop tops") || 
            matchesKeyword(item, "partywear") || 
            matchesKeyword(item, "hoodies") || 
            matchesKeyword(item, "sportswear") ||
            matchesKeyword(item, "tshirts") ||
            matchesKeyword(item, "jeans")
        );
        if (hasAvoidItem) {
            return { valid: false, reason: "Office outfits cannot contain crop tops, partywear, hoodies, sportswear, t-shirts, or jeans." };
        }

        // Office: No casual sneakers
        const shoes = items.shoes || items.footwear;
        if (shoes && (matchesKeyword(shoes, "sneakers") || matchesKeyword(shoes, "casual sneakers"))) {
            return { valid: false, reason: "Sneakers are not appropriate for a professional office outfit." };
        }
    }

    // 3. Style Vibe Alignment
    if (isClassyStyle) {
        // Classy Style: Reject sporty, casual t-shirts, jeans, and sneakers
        const hasNonClassy = activeItems.some(item => 
            item.vibe === "sporty" || 
            matchesKeyword(item, "tshirts") || 
            matchesKeyword(item, "jeans") || 
            matchesKeyword(item, "sneakers")
        );
        if (hasNonClassy) {
            return { valid: false, reason: "Classy style recommendations cannot include t-shirts, jeans, sneakers, or sporty items." };
        }
    }

    // 4. Footwear/Layering Pairing Compatibility
    const shoes = items.shoes || items.footwear;
    const bottom = items.bottom;
    const layer = items.layer;

    if (shoes) {
        const bottomName = (bottom?.name || "").toLowerCase();
        const bottomTags = (bottom?.styleTags || []).map(t => t.toLowerCase());
        const hasCargo = bottomName.includes("cargo") || bottomTags.includes("cargo");
        const hasTrackpants = bottomName.includes("trackpants") || bottomName.includes("joggers") || bottomTags.includes("sporty") || bottomTags.includes("sportswear");

        const layerName = (layer?.name || "").toLowerCase();
        const layerType = (layer?.type || "").toLowerCase();
        const hasHoodie = layerType === "hoodie" || layerName.includes("hoodie");

        if (matchesKeyword(shoes, "heels")) {
            if (hasCargo) return { valid: false, reason: "High heels cannot be paired with cargo pants." };
            if (hasTrackpants) return { valid: false, reason: "High heels cannot be paired with trackpants or joggers." };
            if (hasHoodie) return { valid: false, reason: "High heels cannot be paired with a sporty hoodie." };
        }

        if (matchesKeyword(shoes, "loafers")) {
            if (hasTrackpants) return { valid: false, reason: "Loafers cannot be paired with trackpants or joggers." };
            if (hasHoodie) return { valid: false, reason: "Loafers cannot be paired with a sporty hoodie." };
        }
    }

    // 5. Winter Layering Compliance
    if (requestedSeason === "winter") {
        if (!layer) {
            return { valid: false, reason: "Winter outfits must include a layering piece (jacket, coat, blazer, or cardigan)." };
        }
    }

    return { valid: true };
}
