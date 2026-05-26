export const EVENT_COMPATIBILITY = {
    date_night: {
        preferred: ["heels", "skirts", "fitted tops", "elegant silhouettes"],
        avoid: ["plain tshirt", "sportswear", "hoodies", "casual sneakers"]
    },
    office: {
        preferred: ["blazers", "trousers", "loafers"],
        avoid: ["crop tops", "partywear"]
    },
    casual: {
        preferred: ["sneakers", "jeans", "tshirts"]
    }
};

export function matchesKeyword(item, keyword) {
    if (!item) return false;
    const nameLower = (item.name || "").toLowerCase();
    const typeLower = (item.type || "").toLowerCase();
    const catLower = (item.category || "").toLowerCase();
    const tags = (item.styleTags || []).map(t => t.toLowerCase());

    switch (keyword) {
        case "plain tshirt":
            return (nameLower.includes("plain") || nameLower.includes("basic") || nameLower.includes("solid")) && 
                   (nameLower.includes("tshirt") || nameLower.includes("t-shirt") || nameLower.includes("tee"));
        case "sportswear":
            return tags.includes("sportswear") || tags.includes("sporty") || tags.includes("activewear") || nameLower.includes("sportswear");
        case "hoodies":
            return nameLower.includes("hoodie") || typeLower === "hoodie" || nameLower.includes("sweatshirt");
        case "casual sneakers":
        case "casual sneaker":
            return (nameLower.includes("sneaker") || tags.includes("sneaker")) && 
                   (nameLower.includes("casual") || nameLower.includes("classic") || !tags.includes("streetwear"));
        case "heels":
            return nameLower.includes("heel") || nameLower.includes("pumps") || nameLower.includes("stiletto") || tags.includes("heels");
        case "skirts":
            return nameLower.includes("skirt") || (catLower === "bottom" && nameLower.includes("skirt"));
        case "fitted tops":
            return catLower === "top" && (nameLower.includes("fitted") || (item.fit && item.fit.toLowerCase() === "fitted") || nameLower.includes("crop"));
        case "elegant silhouettes":
            return tags.includes("elegant") || tags.includes("classy") || nameLower.includes("elegant") || nameLower.includes("classy");
        case "blazers":
            return nameLower.includes("blazer") || typeLower === "blazer";
        case "trousers":
            return nameLower.includes("trouser") || nameLower.includes("trousers") || nameLower.includes("pants") || nameLower.includes("chinos");
        case "loafers":
            return nameLower.includes("loafer") || nameLower.includes("loafers") || nameLower.includes("oxford");
        case "crop tops":
            return catLower === "top" && nameLower.includes("crop");
        case "partywear":
            return tags.includes("partywear") || tags.includes("party") || nameLower.includes("party");
        case "sneakers":
            return nameLower.includes("sneaker") || tags.includes("sneaker");
        case "jeans":
            return nameLower.includes("jeans") || nameLower.includes("denim");
        case "tshirts":
            return nameLower.includes("tshirt") || nameLower.includes("t-shirt") || nameLower.includes("tee");
        default:
            return false;
    }
}

export function getItemVibe(item) {
    if (!item) return "casual";
    const nameLower = (item.name || "").toLowerCase();
    const typeLower = (item.type || "").toLowerCase();
    const catLower = (item.category || "").toLowerCase();
    const tags = (item.styleTags || []).map(t => t.toLowerCase());

    const isClassy = 
        nameLower.includes("blazer") ||
        typeLower === "blazer" ||
        nameLower.includes("trouser") ||
        nameLower.includes("heels") ||
        nameLower.includes("pumps") ||
        nameLower.includes("stiletto") ||
        nameLower.includes("dress shirt") ||
        nameLower.includes("silk") ||
        nameLower.includes("satin") ||
        nameLower.includes("tailored") ||
        nameLower.includes("pencil skirt") ||
        tags.includes("classy") ||
        tags.includes("elegant") ||
        tags.includes("formal");
    
    if (isClassy) return "classy";

    const isSporty = 
        nameLower.includes("hoodie") ||
        typeLower === "hoodie" ||
        nameLower.includes("sportswear") ||
        nameLower.includes("trackpants") ||
        nameLower.includes("joggers") ||
        nameLower.includes("sweatshirt") ||
        nameLower.includes("active") ||
        tags.includes("sporty") ||
        tags.includes("sportswear") ||
        tags.includes("activewear");
        
    if (isSporty) return "sporty";

    // Default is casual
    return "casual";
}

export function calculateOutfitMood(items) {
    const activeItems = Object.values(items).filter(Boolean);
    if (activeItems.length === 0) return { mood: "Empty", score: 0 };

    const vibes = activeItems.map(item => getItemVibe(item));
    const uniqueVibes = [...new Set(vibes)];

    // Check for "Elegant Date Night" mood
    const hasHeels = activeItems.some(item => matchesKeyword(item, "heels"));
    const hasSkirt = activeItems.some(item => matchesKeyword(item, "skirts"));
    const hasFittedTop = activeItems.some(item => matchesKeyword(item, "fitted tops"));
    const hasDress = items.dress || items.dresses;

    if ((hasHeels && hasSkirt && hasFittedTop) || (hasHeels && hasDress)) {
        return { mood: "Elegant Date Night", score: 40 };
    }

    // Check for "Confused mixed styling"
    const hasPlainTshirt = activeItems.some(item => matchesKeyword(item, "plain tshirt"));
    if (hasPlainTshirt && hasSkirt && hasHeels) {
        return { mood: "Confused mixed styling", score: -30 };
    }

    const hasHoodie = activeItems.some(item => matchesKeyword(item, "hoodies"));
    if (hasHoodie && (hasHeels || hasSkirt)) {
        return { mood: "Confused mixed styling", score: -30 };
    }

    const hasSporty = vibes.includes("sporty");
    const hasClassy = vibes.includes("classy");

    if (hasClassy && hasSporty) {
        return { mood: "Confused mixed styling", score: -25 };
    }

    if (uniqueVibes.length === 1) {
        if (uniqueVibes[0] === "classy") return { mood: "Sophisticated Elegance", score: 25 };
        if (uniqueVibes[0] === "casual") return { mood: "Casual Comfort", score: 20 };
        if (uniqueVibes[0] === "sporty") return { mood: "Sporty Athleisure", score: 15 };
    }

    return { mood: "Balanced Mix", score: 10 };
}
