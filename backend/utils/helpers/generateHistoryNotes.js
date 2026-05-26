/**
 * Generates dynamic, premium, and fashion-aware styling notes for an outfit memory.
 * Uses template pools, random weighted phrasing, and item analysis to prevent static repetition.
 * 
 * @param {Object} outfit - The outfit details { items, score, colorPalette, reasons }
 * @param {Object} metadata - The event, style, mood, and season parameters
 * @returns {string} 1 premium dynamic styling note
 */
export function generateHistoryNotes(outfit = {}, metadata = {}) {
    const { 
        event = "casual", 
        style = "minimal", 
        mood = "Casual Comfort", 
        season = "all" 
    } = metadata;

    const items = outfit.items || {};
    const top = items.top;
    const bottom = items.bottom;
    const dress = items.dress;
    const shoes = items.shoes || items.footwear;
    const layer = items.layer;

    const nameLower = (item) => (item?.name || "").toLowerCase();
    const tagsList = (item) => (item?.styleTags || []).map(t => t.toLowerCase());

    const hasHeels = shoes && (nameLower(shoes).includes("heel") || tagsList(shoes).includes("heels"));
    const hasSneakers = shoes && (nameLower(shoes).includes("sneaker") || tagsList(shoes).includes("sneakers"));
    const hasLoafers = shoes && (nameLower(shoes).includes("loafer") || nameLower(shoes).includes("oxford"));
    const hasBlazer = (layer && nameLower(layer).includes("blazer")) || (top && nameLower(top).includes("blazer"));
    const hasSkirt = bottom && nameLower(bottom).includes("skirt");
    const hasDress = Boolean(dress);

    const eventLower = String(event).toLowerCase();
    const styleLower = String(style).toLowerCase();
    const moodLower = String(mood).toLowerCase();
    const seasonLower = String(season).toLowerCase();

    // Vocabulary Pools
    const elegantAdjectives = ["sophisticated", "refined", "polished", "elegant", "luxurious", "chic", "expensive-looking", "classic"];
    const casualAdjectives = ["relaxed", "effortless", "versatile", "laid-back", "everyday", "easygoing", "comfortable", "understated"];
    const professionalAdjectives = ["sharp", "polished", "professional", "structured", "smart", "competent", "tailored", "office-ready"];
    const partyAdjectives = ["bold", "fashion-forward", "edgy", "statement-making", "striking", "glamorous", "night-out ready", "contemporary"];

    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // Resolve active adjectives pool based on style and mood
    let adjs = casualAdjectives;
    if (eventLower.includes("date") || eventLower.includes("night") || moodLower.includes("elegance") || styleLower.includes("classy")) {
        adjs = elegantAdjectives;
    } else if (eventLower.includes("office") || eventLower.includes("work") || eventLower.includes("business") || moodLower.includes("business") || moodLower.includes("professional")) {
        adjs = professionalAdjectives;
    } else if (eventLower.includes("party") || styleLower.includes("streetwear") || styleLower.includes("trendy")) {
        adjs = partyAdjectives;
    }

    const adj1 = pickRandom(adjs);
    const adj2 = pickRandom(adjs.filter(a => a !== adj1)); // Avoid selecting the same adjective twice

    const templates = [];

    // 1. Date Night / Elegant
    if (eventLower.includes("date") || eventLower.includes("night") || moodLower.includes("elegance") || styleLower.includes("classy")) {
        templates.push(`Elegant ${adj1} styling creates a ${adj2} evening aesthetic.`);
        templates.push(`Tailored silhouettes and ${adj1} choices elevate the date-night vibe.`);
        templates.push(`A ${adj1} combination designed for a ${adj2} and polished evening.`);
        if (hasHeels) {
            templates.push(`Heels add a ${adj1} finish to the overall evening silhouette.`);
            templates.push(`Elegant heels raise the sophistication, creating a ${adj1} date-night style.`);
        }
        if (hasSkirt || hasDress) {
            templates.push(`Fluid lines and a ${adj1} drape improve the classic feminine allure.`);
        }
    } 
    // 2. Office / Professional
    else if (eventLower.includes("office") || eventLower.includes("work") || eventLower.includes("business") || moodLower.includes("business") || moodLower.includes("professional")) {
        templates.push(`Structured pieces deliver a ${adj1} and workplace-appropriate presence.`);
        templates.push(`A ${adj1} smart-casual balance suited perfectly for professional office settings.`);
        templates.push(`Tailored items and clean proportions project a ${adj1} business presence.`);
        if (hasBlazer) {
            templates.push(`A structured blazer layer completes the ${adj1} office-ready silhouette.`);
        }
        if (hasLoafers) {
            templates.push(`Classic loafers offer a comfortable yet ${adj1} finish to the tailoring.`);
        }
    } 
    // 3. Party / Trendy
    else if (eventLower.includes("party")) {
        templates.push(`Statement choices make this ${adj1} outfit visually bold and party-ready.`);
        templates.push(`Contrasting proportions build a highly ${adj1} and contemporary night-out appeal.`);
        templates.push(`A glamorous layout bringing a ${adj1} spark to the social setting.`);
        if (hasHeels) {
            templates.push(`Heels amplify the ${adj1} party aesthetic, lengthening the visual frame.`);
        }
    } 
    // 4. Casual / Minimal / Default
    else {
        templates.push(`Neutral basics build a ${adj1} and timeless everyday outfit.`);
        templates.push(`Relaxed styling options ensure comfort without sacrificing a ${adj1} look.`);
        templates.push(`An effortless ${adj1} look perfect for versatile daily outings.`);
        templates.push(`Clean fits and ${adj1} cuts maintain an understated daily styling.`);
        if (hasSneakers) {
            templates.push(`Clean sneakers keep the overall outfit versatile, grounded, and ${adj1}.`);
            templates.push(`Sneakers offer a sporty finish, complementing the ${adj1} casual cuts.`);
        }
    }

    // 5. General / Color / Layering templates for added variety
    templates.push(`A ${adj1} look blending cohesive colors and ${adj2} proportions.`);
    templates.push(`Proportional balance highlights a ${adj1} styling direction.`);

    if (seasonLower === "winter" && layer) {
        templates.push(`Layering provides essential winter warmth with a ${adj1} structural finish.`);
    }

    // Dynamic output
    return pickRandom(templates);
}
