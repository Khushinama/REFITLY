export const NEUTRALS = ["white", "black", "beige", "cream", "grey", "navy", "brown", "khaki"];

export const COLOR_FAMILIES = {
    warm: ["red", "orange", "yellow", "brown", "beige", "gold", "cream"],
    cool: ["blue", "green", "purple", "silver", "navy", "teal", "mint"],
    neutral: ["black", "white", "grey", "charcoal", "khaki"]
};

// Simplified color wheel for analogous/complementary logic
// Format: color -> [analogous1, analogous2, complementary]
export const COLOR_RELATIONS = {
    red: { analogous: ["orange", "pink"], complementary: "green" },
    orange: { analogous: ["red", "yellow"], complementary: "blue" },
    yellow: { analogous: ["orange", "lime"], complementary: "purple" },
    green: { analogous: ["lime", "teal"], complementary: "red" },
    blue: { analogous: ["teal", "navy"], complementary: "orange" },
    purple: { analogous: ["pink", "violet"], complementary: "yellow" },
    navy: { analogous: ["blue", "black"], complementary: "brown" },
    brown: { analogous: ["khaki", "tan"], complementary: "navy" },
    pink: { analogous: ["red", "purple"], complementary: "green" }
};

export const SKIN_TONE_PALETTES = {
    warm: ["gold", "orange", "yellow", "red", "beige", "olive"],
    cool: ["silver", "blue", "purple", "pink", "emerald", "navy"],
    neutral: [...NEUTRALS, "teal", "plum", "soft-pink"]
};

export const BODY_TYPE_RULES = {
    pear: {
        tops: { preferred: ["structured", "puff-sleeve", "boat-neck"], avoid: ["tight"] },
        bottoms: { preferred: ["straight", "bootcut", "a-line"], avoid: ["skinny"] }
    },
    apple: {
        tops: { preferred: ["v-neck", "empire-waist", "structured"], avoid: ["boxy"] },
        bottoms: { preferred: ["straight", "wide-leg"], avoid: ["high-waisted"] }
    },
    hourglass: {
        tops: { preferred: ["wrap-around", "v-neck", "fitted"], avoid: ["oversized"] },
        bottoms: { preferred: ["high-waisted", "pencil", "bootcut"], avoid: ["boxy"] }
    },
    rectangle: {
        tops: { preferred: ["peplum", "ruffled", "padded-shoulder"], avoid: ["vertical-stripes"] },
        bottoms: { preferred: ["cargo", "pocket-detail", "tapered"], avoid: ["straight-up-down"] }
    },
    "inverted-triangle": {
        tops: { preferred: ["v-neck", "halter", "raglan-sleeve"], avoid: ["padded-shoulder"] },
        bottoms: { preferred: ["wide-leg", "palazzo", "a-line"], avoid: ["skinny"] }
    }
};

export const EVENT_MATCH_MAP = {
    formal: ["office", "business", "wedding"],
    office: ["formal", "business"],
    business: ["formal", "office"],
    casual: ["everyday", "weekend", "streetwear"],
    everyday: ["casual", "weekend"],
    weekend: ["casual", "everyday"],
    party: ["cocktail", "night-out", "wedding"],
    cocktail: ["party", "night-out"],
    "night-out": ["party", "cocktail"],
    wedding: ["formal", "party"],
    date: ["party", "cocktail", "night-out"],
    brunch: ["casual", "weekend"],
    vacation: ["casual", "beach"]
};

export const STRICT_MISMATCH = {
    casual: ["wedding", "formal", "business"],
    formal: ["streetwear"],
    beach: ["office", "formal"],
    vacation: ["formal", "office"],
    wedding: ["casual", "streetwear"]
};

export const LAYER_STYLING = {
    blazer: ["formal", "office", "business", "wedding"],
    hoodie: ["casual", "streetwear", "weekend"],
    shrug: ["party", "cocktail", "casual"],
    cardigan: ["casual", "minimal", "office"],
    jacket: ["casual", "winter", "streetwear", "weekend"]
};
