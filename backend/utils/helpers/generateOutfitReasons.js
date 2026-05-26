/**
 * Generates highly contextual, dynamic, and fashion-aware reasons explaining why an outfit works.
 * Avoids repetition and provides a premium AI stylist feel.
 * 
 * @param {Object} input - { outfit, selectedEvent, selectedStyle, selectedSeason }
 * @returns {Array<string>} 2 to 3 tailored reasons
 */
export const generateOutfitReasons = (input = {}) => {
    const { outfit, selectedEvent = 'casual', selectedStyle = [], selectedSeason = 'all' } = input;
    const reasons = [];

    if (!outfit || !outfit.items) return ["Great everyday look"];

    const items = outfit.items;
    const top = items.top;
    const bottom = items.bottom;
    const dress = items.dress;
    const shoes = items.shoes || items.footwear;
    const layer = items.layer;

    const eventLower = String(selectedEvent || '').toLowerCase();
    const styleList = Array.isArray(selectedStyle) 
        ? selectedStyle.map(s => s.toLowerCase()) 
        : (selectedStyle ? [selectedStyle.toLowerCase()] : []);
    
    const seasonLower = String(selectedSeason || 'all').toLowerCase();

    // Color extraction
    const activeItems = Object.values(items).filter(Boolean);
    const colors = activeItems.map(item => item.color?.toLowerCase()).filter(Boolean);
    const distinctColors = [...new Set(colors)];
    const isMonochrome = distinctColors.length === 1 && activeItems.length > 1;

    // Helper to randomize array selection
    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const isDateNight = eventLower.includes("date") || eventLower.includes("night") || eventLower.includes("party");
    const isClassy = styleList.includes("classy");
    const isCasual = eventLower.includes("casual") || eventLower.includes("weekend") || eventLower.includes("brunch");
    const isMinimal = styleList.includes("minimal");

    // Vibe-aware stylist descriptions from the computed mood object (8-12 words)
    if (outfit.mood && outfit.mood.dominantMood) {
        const moodName = outfit.mood.dominantMood;
        if (moodName === "Sophisticated Elegance") {
            reasons.push("Sophisticated elegance blends cohesive styling and elegant silhouettes.");
        } else if (moodName === "Professional Business") {
            reasons.push("Structured business elements deliver a polished, professional presence.");
        } else if (moodName === "Smart Casual") {
            reasons.push("Blends structured items and relaxed cuts for smart-casual balance.");
        } else if (moodName === "Urban Streetwear") {
            reasons.push("Contemporary streetwear styling creates a relaxed urban aesthetic.");
        } else if (moodName === "Sporty Athleisure") {
            reasons.push("Athletic comfort and style blend for an effortless sporty feel.");
        } else if (moodName === "Casual Comfort") {
            reasons.push("Clean, cohesive casual layout prioritizes daily comfort.");
        }
    }

    // ----------------------------------------------------
    // SPECIFIC HIGHLIGHT COMBINATIONS (8-12 words)
    // ----------------------------------------------------
    if (isDateNight && isClassy) {
        // Date Night + Classy SPECIFIC REASONS
        const hasHeels = shoes && (shoes.name?.toLowerCase().includes("heel") || shoes.name?.toLowerCase().includes("pump") || shoes.name?.toLowerCase().includes("stiletto"));
        const hasStructure = (layer && (layer.type?.toLowerCase() === "blazer" || layer.name?.toLowerCase().includes("blazer"))) || 
                             (top && (top.name?.toLowerCase().includes("fitted") || top.name?.toLowerCase().includes("crop") || top.fit?.toLowerCase() === "fitted"));

        if (isMonochrome || colors.includes("black") || colors.includes("white") || colors.includes("beige") || colors.includes("cream")) {
            reasons.push("Elegant monochrome contrast elevates the outfit's visual balance.");
        } else {
            reasons.push("Refined color pairing elevates the evening visual aesthetic.");
        }

        if (hasHeels) {
            reasons.push("Elegant heels enhance the refined evening aesthetic.");
        }

        if (hasStructure) {
            reasons.push("Structured silhouette creates a polished date-night look.");
        }
    } else if (isCasual && isMinimal) {
        // Casual + Minimal SPECIFIC REASONS
        const hasSneakers = shoes && shoes.name?.toLowerCase().includes("sneaker");
        const hasNeutral = colors.every(c => ["white", "black", "beige", "cream", "grey", "navy", "brown", "khaki"].includes(c));

        if (hasNeutral) {
            reasons.push("Neutral basics create a timeless casual aesthetic.");
        } else {
            reasons.push("Simple palette choices create a timeless casual look.");
        }

        if (hasSneakers) {
            reasons.push("Minimalist sneakers keep the outfit highly versatile.");
        }

        reasons.push("Minimal palette improves overall outfit color balance.");
    }

    // ----------------------------------------------------
    // FALLBACK EVENT-BASED REASONS (8-12 words)
    // ----------------------------------------------------
    if (reasons.length < 2) {
        if (isDateNight) {
            const dateReasons = [
                "Elegant evening-ready combination perfect for a special night out.",
                "Elevated look strikes a perfect balance for dinner or drinks.",
                "Effortlessly chic design creates a polished evening style."
            ];
            reasons.push(pickRandom(dateReasons));
        } else if (eventLower.includes("office") || eventLower.includes("business") || eventLower.includes("formal")) {
            const officeReasons = [
                "Structured silhouette delivers a polished, professional office presence.",
                "Refined styling with comfortable cuts, ideal for business settings.",
                "Professional smart-casual look tailored to keep you sharp."
            ];
            reasons.push(pickRandom(officeReasons));
        } else {
            const casualReasons = [
                "Relaxed and comfortable pairing, ideal for versatile weekend outings.",
                "Casual comfort meets an effortless, everyday street-style vibe.",
                "Versatile silhouette keeps you stylishly relaxed for casual hangouts."
            ];
            reasons.push(pickRandom(casualReasons));
        }
    }

    // ----------------------------------------------------
    // FALLBACK STYLE-BASED REASONS (8-12 words)
    // ----------------------------------------------------
    if (reasons.length < 3) {
        if (styleList.includes("minimal") && !reasons.includes("Minimal palette improves overall outfit color balance.")) {
            const minimalReasons = [
                "Clean silhouettes and neutral bases highlight a timeless minimalist style.",
                "Sophisticated, uncluttered look lets simple clothing cuts shine.",
                "Neutral tones and solid pieces align with quiet-luxury vibes."
            ];
            reasons.push(pickRandom(minimalReasons));
        }
        
        if (styleList.includes("trendy")) {
            const trendyReasons = [
                "Bold proportions and statement items offer a fashion-forward choice.",
                "Bold, modern pairing designed to stay ahead of trends.",
                "Fashion-forward elements make the entire outfit stand out."
            ];
            reasons.push(pickRandom(trendyReasons));
        }

        if (styleList.includes("classy") && !reasons.includes("Structured silhouette creates a polished date-night look.")) {
            const classyReasons = [
                "Tailored items and classic proportions elevate the refined aesthetic.",
                "Polished, sophisticated charm through elegant draping and structured lines.",
                "Timelessly chic arrangement looks expensive and beautifully put-together."
            ];
            reasons.push(pickRandom(classyReasons));
        }

        if (styleList.includes("streetwear")) {
            const streetwearReasons = [
                "Edgy, urban vibe with relaxed fits and streetwear accents.",
                "Urban-inspired combination is both comfortable and street-smart.",
                "Oversized silhouettes and relaxed detailing offer an edgy look."
            ];
            reasons.push(pickRandom(streetwearReasons));
        }
    }

    // ----------------------------------------------------
    // FALLBACK COLOR-BASED REASONS (8-12 words)
    // ----------------------------------------------------
    if (reasons.length < 3) {
        if (colors.includes("black") && colors.includes("white") && !reasons.includes("Elegant monochrome contrast elevates the outfit's visual balance.")) {
            reasons.push("Strong monochrome contrast creates a striking, balanced visual flow.");
        } else if (colors.includes("beige") && colors.includes("white")) {
            reasons.push("Beige and white neutral tones enhance clean minimalist styling.");
        } else if (colors.includes("cream") && (colors.includes("beige") || colors.includes("brown") || colors.includes("khaki"))) {
            reasons.push("Harmonious warm neutrals build a sophisticated tone-on-tone outfit.");
        } else if (colors.every(c => ["black", "grey", "gray", "white", "navy"].includes(c))) {
            reasons.push("Cool, neutral-dominated palette ensures a universally sleek look.");
        } else if (colors.some(c => ["brown", "khaki", "olive", "rust", "camel"].includes(c))) {
            reasons.push("Rich earth tones create a cozy, inviting seasonal aesthetic.");
        } else if (isMonochrome) {
            reasons.push("Monochromatic coloring yields a clean, elongated visual silhouette.");
        }
    }

    // ----------------------------------------------------
    // FALLBACK FOOTWEAR-BASED REASONS (8-12 words)
    // ----------------------------------------------------
    if (reasons.length < 3 && shoes) {
        const shoesName = shoes.name?.toLowerCase() || "";
        if ((shoesName.includes("heel") || shoesName.includes("pump") || shoesName.includes("stiletto")) && !reasons.includes("Elegant heels enhance the refined evening aesthetic.")) {
            reasons.push("Choice of heels instantly adds sophistication and elongates frames.");
        } else if (shoesName.includes("sneaker") && !reasons.includes("Minimalist sneakers keep the outfit highly versatile.")) {
            reasons.push("Minimalist sneakers keep the outfit versatile and comfortable.");
        } else if (shoesName.includes("loafer") || shoesName.includes("oxford") || shoesName.includes("flat")) {
            reasons.push("Loafers enhance the smart-casual aesthetic with tailored finishes.");
        } else if (shoesName.includes("boot")) {
            reasons.push("Chelsea boots add texture and cool seasonal structure.");
        }
    }

    // ----------------------------------------------------
    // FALLBACK SEASON-BASED REASONS (8-12 words)
    // ----------------------------------------------------
    if (reasons.length < 3) {
        if (seasonLower === "summer") {
            reasons.push("Lightweight, breathable pieces ensure cool comfort in the heat.");
        } else if (seasonLower === "winter" && layer) {
            reasons.push("Layered styling adds warmth and essential structural depth.");
        } else if (layer) {
            reasons.push("Structured outer layers add dimension for changing temperatures.");
        }
    }

    const uniqueReasons = [...new Set(reasons)];

    if (uniqueReasons.length === 0) {
        return ["A well-balanced outfit composed of matching fashion elements.", "Neutral styling makes this combination highly wearable."];
    }

    return uniqueReasons.slice(0, 3);
};
