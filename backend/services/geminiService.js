import { GoogleGenerativeAI } from "@google/generative-ai";
import { STYLE_RULES } from "../constants/styleRules.js";

const getGenerativeModel = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // or gemini-pro / gemini-1.5-flash
};

const cleanJsonResponse = (text) => {
    // Remove markdown code blocks if any
    let cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return cleaned;
};

const getFallbackRecommendation = () => {
    return {
        title: "Classic Casual Look",
        description: "A versatile outfit suitable for everyday wear.",
        top: "White T-Shirt",
        bottom: "Blue Jeans",
        footwear: "White Sneakers",
        accessories: ["Watch"],
        whyItWorks: [
            "Balanced proportions",
            "Timeless styling"
        ]
    };
};

export const generateOutfitRecommendation = async (bodyType, stylePreferences) => {
    try {
        const model = getGenerativeModel();
        
        let styleRulesContext = "";
        const styles = stylePreferences && stylePreferences.length > 0 ? stylePreferences : ["casual"];
        
        styles.forEach(style => {
            const rules = STYLE_RULES[style.toLowerCase()];
            if (rules) {
                styleRulesContext += `
Rules for ${style} style:
- Allowed Tops: ${rules.tops.join(", ")}
- Allowed Bottoms: ${rules.bottoms.join(", ")}
- Allowed Footwear: ${rules.footwear.join(", ")}
- Allowed Accessories: ${rules.accessories.join(", ")}
- Expected Aesthetics: ${rules.aesthetics.join(", ")}
- Expected Colors: ${rules.colors.join(", ")}
`;
            }
        });

        if (!styleRulesContext) {
            styleRulesContext = "Use standard fashion rules for the selected style.";
        }

        const prompt = `You are a professional fashion stylist.
Your task is to generate a personalized outfit recommendation based on the user's body type and style preferences.
You must understand body shape styling principles, fashion aesthetics, and outfit composition.

User Profile:
- Body Type: ${bodyType || "Not specified"}
- Style Preferences: ${styles.join(", ")}

STYLE RULES ENGINE (CRITICAL):
You MUST build the outfit ONLY from the categories and aesthetics defined below for the selected style(s):
${styleRulesContext}

STRICT GENERATION RULES:
1. You MUST generate outfit items ONLY from the allowed categories of the selected style defined above.
2. If Style = Streetwear, DO NOT generate Formal Shirts, Tailored Trousers, Pencil Skirts, Structured Handbags, Oxford Shoes.
3. If Style = Formal, DO NOT generate Cargo Pants, Graphic Tees, Chunky Sneakers, Caps.
4. If Style = Minimalist, DO NOT generate Graphic Tees, Heavy Chains, Street Hoodies.
5. Any recommendation outside the selected style rules should be considered invalid. Gemini must NOT freely invent categories.

BODY TYPE REFINEMENT:
1. Style Preference is the PRIMARY recommendation factor.
2. Body Type is the SECONDARY factor (a REFINEMENT LAYER). 
3. After style categories are selected, use body type ONLY to refine: Fit, Silhouette, Shape, and Layering. The style must remain identical (e.g. a Formal outfit must stay Formal regardless of body type).

DIVERSITY REQUIREMENT:
1. Users with different styles must receive clearly different outfits.
2. The following MUST change significantly between styles: Tops, Bottoms, Footwear, Accessories, Colors, Overall aesthetic. Visual differences should be obvious at first glance.

SELF-CHECK BEFORE RETURNING:
Before finalizing the recommendation, verify: "Would a fashion-conscious user immediately recognize the selected style?"
If the answer is NO, you must redo the selection to ensure the style aesthetic is dominant and obvious.

Generate a unique outfit that strongly reflects the selected style preference while remaining suitable for the user's body type. Do not generate generic outfits.

Please return ONLY a valid JSON object representing the outfit recommendation. Do not include markdown formatting, code blocks, or explanations. 

The JSON must exactly match this structure:
{
  "title": "String - A catchy title for the look",
  "description": "String - A brief description of the outfit",
  "top": "String - The top clothing item",
  "bottom": "String - The bottom clothing item",
  "footwear": "String - The footwear",
  "accessories": ["Array of Strings - e.g., Watch, Belt, Sunglasses"],
  "whyItWorks": ["Array of Strings - Explaining why this fits the user's body type and style"]
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        try {
            const cleanedText = cleanJsonResponse(text);
            const parsedJson = JSON.parse(cleanedText);
            
            // Validate required fields
            const requiredFields = ["title", "description", "top", "bottom", "footwear", "accessories", "whyItWorks"];
            for (const field of requiredFields) {
                if (parsedJson[field] === undefined) {
                    console.warn(`Gemini response missing field: ${field}`);
                    return getFallbackRecommendation();
                }
            }
            
            return parsedJson;
        } catch (parseError) {
            console.error("Failed to parse Gemini response as JSON:", text);
            return getFallbackRecommendation();
        }
    } catch (error) {
        console.error("Gemini AI API Error:", error.message);
        return getFallbackRecommendation();
    }
};
