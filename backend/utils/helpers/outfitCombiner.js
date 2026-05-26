import { LAYER_STYLING } from "./constants.js";

/**
 * Shuffles an array using Fisher-Yates algorithm.
 */
const shuffle = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

/**
 * Generates valid outfit combinations from grouped items.
 */
export const generateCombinations = (groups, options = {}) => {
    const {
        includeLayer = "auto",
        event = "casual",
        season = "all",
        maxCombinations = 100
    } = options;

    const { tops, bottoms, dresses, layers, footwear } = groups;
    
    // Shuffle inputs for variety
    const sTops = shuffle(tops);
    const sBottoms = shuffle(bottoms);
    const sDresses = shuffle(dresses);
    const sLayers = shuffle(layers);
    const sFootwear = shuffle(footwear);

    const outfits = [];

    // Determine if layer should be included for "auto"
    const requestedEvents = Array.isArray(event) ? event : [event.toLowerCase()];
    const shouldAutoIncludeLayer = 
        season.toLowerCase() === "winter" || 
        requestedEvents.some(e => ["formal", "office", "business", "wedding"].includes(e));
    
    const mustIncludeLayer = includeLayer === "always" || (includeLayer === "auto" && shouldAutoIncludeLayer);
    const mustExcludeLayer = includeLayer === "never";

    // 1. Combination Set A: Dress + Shoes (+ Layer)
    sDresses.forEach(dress => {
        sFootwear.forEach(shoes => {
            if (mustExcludeLayer) {
                outfits.push({ dress, footwear: shoes, layer: null });
            } else if (mustIncludeLayer) {
                sLayers.forEach(layer => {
                    if (isValidLayerMatch(layer, event)) {
                        outfits.push({ dress, footwear: shoes, layer });
                    }
                });
            } else {
                // "auto" might allow both with and without layer? 
                // Let's stick to the decision or allow optionality.
                outfits.push({ dress, footwear: shoes, layer: null });
                sLayers.forEach(layer => {
                    if (isValidLayerMatch(layer, event)) {
                        outfits.push({ dress, footwear: shoes, layer });
                    }
                });
            }
        });
    });

    // 2. Combination Set B: Top + Bottom + Shoes (+ Layer)
    sTops.forEach(top => {
        sBottoms.forEach(bottom => {
            sFootwear.forEach(shoes => {
                if (mustExcludeLayer) {
                    outfits.push({ top, bottom, footwear: shoes, layer: null });
                } else if (mustIncludeLayer) {
                    sLayers.forEach(layer => {
                        if (isValidLayerMatch(layer, event) && !isBadCombination(top, layer)) {
                            outfits.push({ top, bottom, footwear: shoes, layer });
                        }
                    });
                } else {
                    outfits.push({ top, bottom, footwear: shoes, layer: null });
                    sLayers.forEach(layer => {
                        if (isValidLayerMatch(layer, event) && !isBadCombination(top, layer)) {
                            outfits.push({ top, bottom, footwear: shoes, layer });
                        }
                    });
                }
            });
        });
    });

    // Shuffle final list and limit
    return shuffle(outfits).slice(0, maxCombinations);
};

const isValidLayerMatch = (layer, requestedEvent) => {
    const type = layer.type?.toLowerCase();
    if (!type) return true;

    const allowedEvents = LAYER_STYLING[type] || [];
    if (allowedEvents.length === 0) return true;

    const requestedEvents = Array.isArray(requestedEvent) ? requestedEvent : [requestedEvent.toLowerCase()];
    return requestedEvents.some(re => allowedEvents.includes(re));
};

const isBadCombination = (top, layer) => {
    const topName = top.name?.toLowerCase() || "";
    const layerType = layer.type?.toLowerCase() || "";

    // hoodie + formal blazer → skip
    if (topName.includes("hoodie") && layerType === "blazer") return true;
    
    return false;
};
