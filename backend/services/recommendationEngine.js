import User from "../models/User.js";
import Wardrobe from "../models/Wardrobe.js";
import { calculateBodyScore } from "../utils/scoring/bodyScore.js";
import { filterAndGroupItems } from "../utils/helpers/outfitFilter.js";
import { generateCombinations } from "../utils/helpers/outfitCombiner.js";
import { calculateOutfitScore } from "../utils/scoring/recommendationScoring.js";
import { generateOutfitReasons } from "../utils/helpers/generateOutfitReasons.js";
import OutfitHistory from "../models/OutfitHistory.js";
import crypto from "crypto";
import { normalizeWardrobeItem } from "../utils/normalizeWardrobeItem.js";
import { validateOutfitCompatibility } from "../utils/scoring/validateOutfitCompatibility.js";
import { calculateOutfitMood } from "../utils/helpers/calculateOutfitMood.js";
import { calculateOutfitDiversity } from "../utils/scoring/calculateOutfitDiversity.js";

/**
 * Main function to generate personalized outfit recommendations.
 */
export async function generateOutfits(userId, options = {}) {
    const {
        event = [],
        style = [],
        season = "all",
        page = 1,
        limit = 6,
        excludeItemIds = [],
        includeLayer = "auto"
    } = options;

    try {
        // STEP 1 — Fetch & Validate
        const user = await User.findById(userId).populate('likedOutfits savedOutfits dislikedOutfits');
        if (!user) throw new Error("USER_NOT_FOUND");

        // Fetch recently worn outfit signatures for penalty calculations
        const recentlyWornHistory = await OutfitHistory.find({ user: userId }).populate('outfitId');
        const recentlyWornSignatures = recentlyWornHistory
            .filter(historyEntry => historyEntry.outfitId)
            .map(historyEntry => historyEntry.outfitId.signature);

        // STEP 2 — Normalize Data
        const rawWardrobeItems = await Wardrobe.find({ user: userId });
        if (rawWardrobeItems.length < 3) {
            return {
                error: "INSUFFICIENT_WARDROBE",
                message: "Please add at least 3 items to your wardrobe to get personalized recommendations."
            };
        }

        // Normalize raw items using normalizeWardrobeItem to guarantee the vibe property exists
        const wardrobeItems = rawWardrobeItems.map(item => normalizeWardrobeItem(item.toObject ? item.toObject() : item));

        // STEP 3 — Pre-filter Items (Diversity/Availability filter)
        const groups = filterAndGroupItems(wardrobeItems, {
            event,
            season,
            excludeItemIds
        });

        // STEP 4 — Resilience Check
        const hasBottoms = groups.bottoms.length > 0;
        const hasDresses = groups.dresses.length > 0;
        const hasFootwear = groups.footwear.length > 0;
        
        if (!hasFootwear) {
            groups.footwear.push({
                _id: "barefoot-placeholder",
                name: "Barefoot",
                category: "footwear",
                color: "neutral",
                image: "https://via.placeholder.com/150?text=Barefoot",
                vibe: "casual"
            });
        }

        // STEP 5 — Generate Combinations
        const combinations = generateCombinations(groups, {
            includeLayer,
            event,
            season,
            maxCombinations: 100
        });

        // STEP 6 — Filter combinations through validation engine
        const validCombinations = [];
        
        for (const outfit of combinations) {
            const items = {
                top: outfit.top || null,
                bottom: outfit.bottom || null,
                dress: outfit.dress || null,
                layer: outfit.layer || null,
                shoes: outfit.footwear || null
            };

            const serializeItem = (item) => {
                if (!item) return null;
                return {
                    ...item,
                    image: item.image || item.imageUrl || item.url
                };
            };

            const serializedItems = {
                top: serializeItem(items.top),
                bottom: serializeItem(items.bottom),
                dress: serializeItem(items.dress),
                layer: serializeItem(items.layer),
                shoes: serializeItem(items.shoes)
            };

            // Run compatibility validation before scoring
            const validation = validateOutfitCompatibility(serializedItems, { event, style, season });
            if (!validation.valid) {
                continue; // Discard invalid combination
            }

            // Calculate overall outfit mood
            const mood = calculateOutfitMood(serializedItems);

            validCombinations.push({
                rawOutfit: outfit,
                serializedItems,
                mood
            });
        }

        // STEP 7 — Score valid combinations
        const scoredOutfits = validCombinations.map(({ rawOutfit, serializedItems, mood }) => {
            // Calculate base score
            const scoreResult = calculateOutfitScore(serializedItems, {
                event,
                style,
                season,
                user,
                recentlyWornSignatures
            });

            // Calculate body score for legacy compatibility (attached to matchBreakdown.body)
            const bodyResults = calculateBodyScore({
                top: rawOutfit.top || null,
                bottom: rawOutfit.bottom || null,
                dress: rawOutfit.dress || null,
                layer: rawOutfit.layer || null,
                footwear: rawOutfit.footwear || null
            }, user.bodyType);

            // Construct color palette
            const colorPalette = Object.values(rawOutfit)
                .filter(i => i && i.colorHex)
                .map(i => i.colorHex)
                .concat(Object.values(rawOutfit).filter(i => i && i.color).map(i => i.color));

            const outfitId = crypto.createHash('md5').update(
                Object.values(rawOutfit)
                    .filter(Boolean)
                    .map(i => i._id.toString())
                    .sort()
                    .join('-')
            ).digest('hex');

            const outfitResult = {
                id: outfitId,
                items: serializedItems,
                score: scoreResult.score,
                mood, // Attach mood object
                matchBreakdown: {
                    color: scoreResult.matchBreakdown.color,
                    style: scoreResult.matchBreakdown.style,
                    event: scoreResult.matchBreakdown.event,
                    body: Math.round(bodyResults.score)
                },
                colorPalette: [...new Set(colorPalette)].slice(0, 5)
            };

            // Attach dynamic, fashion-aware reasons
            outfitResult.whyReasons = generateOutfitReasons({
                outfit: outfitResult,
                selectedEvent: event,
                selectedStyle: style,
                selectedSeason: season
            });

            return outfitResult;
        });

        // STEP 8 — Greedy Diversity Selection (MMR)
        const uniqueOutfits = [];
        const remainingOutfits = [...scoredOutfits];
        const lambda = 0.5; // Balances styling score and diversity

        const seenBaseCombos = new Set();
        const topUsageCount = {};
        const shoeUsageCount = {};

        // Calculate max shoe usage dynamically based on available shoe inventory
        const totalShoesCount = groups.footwear.filter(s => s._id !== "barefoot-placeholder").length;
        const maxShoeCount = totalShoesCount <= 2 ? 24 : Math.max(3, Math.ceil(24 * 0.3));

        while (uniqueOutfits.length < 24 && remainingOutfits.length > 0) {
            let bestIndex = -1;
            let bestMMR = -Infinity;

            for (let i = 0; i < remainingOutfits.length; i++) {
                const candidate = remainingOutfits[i];

                const topId = candidate.items.top?._id?.toString();
                const bottomId = candidate.items.bottom?._id?.toString();
                const dressId = candidate.items.dress?._id?.toString();
                const shoeId = candidate.items.shoes?._id?.toString();

                // Base combination check (identical top + bottom or dress)
                let baseComboKey = "";
                if (dressId) {
                    baseComboKey = `dress-${dressId}`;
                } else if (topId && bottomId) {
                    baseComboKey = `top-${topId}-bottom-${bottomId}`;
                }

                if (baseComboKey && seenBaseCombos.has(baseComboKey)) {
                    continue;
                }

                // Variety check: Cap top/dress usage to 2 outfits max
                const topOrDressId = topId || dressId;
                if (topOrDressId) {
                    const count = topUsageCount[topOrDressId] || 0;
                    if (count >= 2) continue;
                }

                // Variety check: Cap shoe usage
                if (shoeId) {
                    const count = shoeUsageCount[shoeId] || 0;
                    if (count >= maxShoeCount) continue;
                }

                // Calculate diversity score against already selected outfits
                const diversityScore = calculateOutfitDiversity(candidate, uniqueOutfits);

                // MMR formula
                const mmrScore = (1 - lambda) * candidate.score + lambda * diversityScore;

                if (mmrScore > bestMMR) {
                    bestMMR = mmrScore;
                    bestIndex = i;
                }
            }

            if (bestIndex === -1) {
                break;
            }

            // Select the best candidate
            const selected = remainingOutfits[bestIndex];
            remainingOutfits.splice(bestIndex, 1);

            // Record selected item counts and base combos
            const topId = selected.items.top?._id?.toString();
            const bottomId = selected.items.bottom?._id?.toString();
            const dressId = selected.items.dress?._id?.toString();
            const shoeId = selected.items.shoes?._id?.toString();

            let baseComboKey = "";
            if (dressId) {
                baseComboKey = `dress-${dressId}`;
            } else if (topId && bottomId) {
                baseComboKey = `top-${topId}-bottom-${bottomId}`;
            }
            if (baseComboKey) {
                seenBaseCombos.add(baseComboKey);
            }

            const topOrDressId = topId || dressId;
            if (topOrDressId) {
                topUsageCount[topOrDressId] = (topUsageCount[topOrDressId] || 0) + 1;
            }
            if (shoeId) {
                shoeUsageCount[shoeId] = (shoeUsageCount[shoeId] || 0) + 1;
            }

            uniqueOutfits.push(selected);
        }

        // Pagination
        const total = uniqueOutfits.length;
        const startIndex = (page - 1) * limit;
        const paginatedOutfits = uniqueOutfits.slice(startIndex, startIndex + limit);

        return {
            success: true,
            data: {
                outfits: paginatedOutfits,
                pagination: {
                    page,
                    limit,
                    total,
                    hasMore: (startIndex + limit) < total
                },
                meta: {
                    event,
                    season,
                    wardrobeSize: wardrobeItems.length,
                    combinationsEvaluated: combinations.length
                }
            }
        };

    } catch (error) {
        console.error("Recommendation Engine Error:", error);
        throw error;
    }
}
