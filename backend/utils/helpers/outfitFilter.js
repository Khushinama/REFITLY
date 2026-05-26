/**
 * Pre-filters wardrobe items based on event, season and exclusions.
 * Then groups them by category.
 */
export const filterAndGroupItems = (items, options = {}) => {
    const {
        event = "casual",
        season = "all",
        excludeItemIds = []
    } = options;

    const normalizedSeason = season.toLowerCase();
    const requestedEvents = Array.isArray(event) ? event : [event.toLowerCase()];
    
    const filtered = items.filter(item => {
        // 1. Exclude recently worn items
        if (excludeItemIds.includes(item._id.toString())) return false;

        // 2. Season Match (OR "all" season items)
        const itemSeason = item.season?.toLowerCase() || "all";
        const seasonMatch = itemSeason === "all" || normalizedSeason === "all" || itemSeason === normalizedSeason;
        if (!seasonMatch) return false;

        // 3. Event Match (STRICT)
        const itemEvents = Array.isArray(item.event) 
            ? item.event.map(e => String(e).toLowerCase()) 
            : [String(item.event || '').toLowerCase()];
        
        // Strict requirement: item must explicitly include one of the requested events
        const hasDirectEventMatch = itemEvents.some(ie => requestedEvents.includes(ie));
        const hasAllOccasionTag = item.styleTags?.some(t => String(t).toLowerCase() === "all-occasion");
        
        if (!hasDirectEventMatch && !hasAllOccasionTag) return false;

        // DATA VALIDATION: Flag items with > 2 events (reduce weight or mark for refinement)
        // We'll mark them so the scoring logic can penalize them later if needed, 
        // or just consider them less "specialized".
        if (itemEvents.length > 2) {
            item.isGeneric = true; 
        }

        return true;
    });

    // Group by category
    // Existing categories in model: ["top", "bottom", "dress", "layer", "footwear", "accessory"]
    const groups = {
        tops: [],
        bottoms: [],
        dresses: [],
        layers: [],
        footwear: [],
        accessories: []
    };

    filtered.forEach(item => {
        const cat = item.category?.toLowerCase();
        if (cat === "top") groups.tops.push(item);
        else if (cat === "bottom") groups.bottoms.push(item);
        else if (cat === "dress") groups.dresses.push(item);
        else if (cat === "layer") groups.layers.push(item);
        else if (cat === "footwear") groups.footwear.push(item);
        else if (cat === "accessory") groups.accessories.push(item);
    });

    return groups;
};
