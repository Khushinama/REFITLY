import { extractUserPreferences, calculatePersonalizationScore } from "../utils/scoring/personalizationScore.js";

// Mock User with Likes and Dislikes
const mockUser = {
    likedOutfits: [
        {
            colorPalette: ["#000000", "#FFFFFF"], // Black & White
            items: {
                top: { category: "top", subCategory: "t-shirt", styleTags: ["minimal", "casual"], pattern: "solid" },
                bottom: { category: "bottom", subCategory: "jeans", styleTags: ["casual"] }
            }
        }
    ],
    savedOutfits: [],
    dislikedOutfits: [
        {
            colorPalette: ["#FF00FF"], // Neon Pink
            items: {
                top: { category: "top", subCategory: "tank-top", styleTags: ["streetwear"], pattern: "graphic" }
            }
        }
    ]
};

console.log("--- STEP 1: EXTRACT PREFERENCES ---");
const profile = extractUserPreferences(mockUser);
console.log("User Profile:", JSON.stringify(profile, null, 2));

console.log("\n--- STEP 2: TEST SCORING (POSITIVE MATCH) ---");
const positiveOutfit = {
    top: { category: "top", subCategory: "t-shirt", styleTags: ["minimal"], pattern: "solid" },
    bottom: { category: "bottom", subCategory: "trousers", styleTags: ["classy"] }
};
const positiveColors = ["#000000", "#666666"];

const positiveResult = calculatePersonalizationScore(positiveOutfit, positiveColors, profile);
console.log("Positive Outfit Result:", positiveResult);

console.log("\n--- STEP 3: TEST SCORING (NEGATIVE MATCH) ---");
const negativeOutfit = {
    top: { category: "top", subCategory: "tank-top", styleTags: ["streetwear"], pattern: "graphic" }
};
const negativeColors = ["#FF00FF", "#000000"];

const negativeResult = calculatePersonalizationScore(negativeOutfit, negativeColors, profile);
console.log("Negative Outfit Result:", negativeResult);

console.log("\n--- STEP 4: TEST SCORING (NEUTRAL) ---");
const neutralOutfit = {
    top: { category: "top", subCategory: "shirt", styleTags: ["formal"], pattern: "striped" }
};
const neutralColors = ["#0000FF"];

const neutralResult = calculatePersonalizationScore(neutralOutfit, neutralColors, profile);
console.log("Neutral Outfit Result:", neutralResult);
