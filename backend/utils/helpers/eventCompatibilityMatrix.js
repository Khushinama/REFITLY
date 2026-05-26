export const EVENT_COMPATIBILITY_MATRIX = {
    date_night: {
        preferredVibes: ["classy", "elegant"],
        restrictedVibes: ["sporty"],
        preferredKeywords: ["heels", "skirts", "fitted tops", "elegant silhouettes"],
        restrictedKeywords: ["plain tshirt", "sportswear", "hoodies", "casual sneakers"]
    },
    office: {
        preferredVibes: ["classy", "professional"],
        restrictedVibes: ["sporty", "casual"],
        preferredKeywords: ["blazers", "trousers", "loafers"],
        restrictedKeywords: ["crop tops", "partywear", "hoodies"]
    },
    casual: {
        preferredVibes: ["casual", "sporty"],
        restrictedVibes: [],
        preferredKeywords: ["sneakers", "jeans", "tshirts"],
        restrictedKeywords: []
    }
};

/**
 * Checks if a given array of event tags matches Date Night.
 * Date Night is matched if:
 * - Any event contains "date" or "night"
 * - Or the events list contains both "party" and "casual"
 */
export function checkIsDateNight(events) {
    if (!events || !Array.isArray(events)) return false;
    const evs = events.map(e => String(e).toLowerCase());
    return evs.some(e => e.includes("date") || e.includes("night")) || 
           (evs.includes("party") && evs.includes("casual"));
}

/**
 * Checks if a given array of event tags matches Office.
 */
export function checkIsOffice(events) {
    if (!events || !Array.isArray(events)) return false;
    const evs = events.map(e => String(e).toLowerCase());
    return evs.some(e => e.includes("office") || e.includes("business") || e.includes("work")) || 
           (evs.includes("formal") && evs.includes("office"));
}
