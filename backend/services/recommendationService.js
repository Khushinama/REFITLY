import User from "../models/User.js";
import Wardrobe from "../models/Wardrobe.js";
import DailyRecommendation from "../models/DailyRecommendation.js";
import { generateOutfitRecommendation } from "./geminiService.js";
import { fetchPexelsImage } from "./pexelsService.js";

const fetchAndAttachImages = async (recommendation) => {
    const pexelsPromises = [];
    
    const fetchAndAssign = async (key, query) => {
        const url = await fetchPexelsImage(query);
        return { key, url };
    };

    if (recommendation.top) pexelsPromises.push(fetchAndAssign('top', recommendation.top));
    if (recommendation.bottom) pexelsPromises.push(fetchAndAssign('bottom', recommendation.bottom));
    if (recommendation.footwear) pexelsPromises.push(fetchAndAssign('footwear', recommendation.footwear));
    
    const accPromises = (recommendation.accessories || []).map(acc => 
        fetchPexelsImage(acc).then(url => ({ key: `acc_${acc}`, url, name: acc }))
    );

    const results = await Promise.all([...pexelsPromises, ...accPromises]);
    
    const images = {
        top: null,
        bottom: null,
        footwear: null,
        accessories: {}
    };

    results.forEach(res => {
        if (res.key === 'top') images.top = res.url;
        else if (res.key === 'bottom') images.bottom = res.url;
        else if (res.key === 'footwear') images.footwear = res.url;
        else if (res.key.startsWith('acc_')) {
            images.accessories[res.name] = res.url;
        }
    });

    recommendation.images = images;
    return recommendation;
};

export const getTodayRecommendationData = async (userId) => {
    if (!userId) {
        throw new Error("User ID is required");
    }

    // 1. Fetch user profile
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User profile not found");
    }

    // 2. Check DailyRecommendation collection for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    let existingRec = await DailyRecommendation.findOne({
        userId,
        generatedForDate: startOfDay,
    });

    if (existingRec) {
        const isBodyTypeMatch = existingRec.bodyType === user.bodyType;
        // Compare arrays safely by JSON stringifying them
        const isStyleMatch = JSON.stringify(existingRec.stylePreferences) === JSON.stringify(user.preferences || []);

        if (isBodyTypeMatch && isStyleMatch) {
            // Check if images are missing (from old cache)
            const hasImages = existingRec.recommendation.images;
            const hasTop = hasImages && existingRec.recommendation.images.top;
            const needsAccessories = existingRec.recommendation.accessories && existingRec.recommendation.accessories.length > 0;
            const hasAccessoriesImages = hasImages && existingRec.recommendation.images.accessories && Object.keys(existingRec.recommendation.images.accessories).length > 0;

            if (!hasImages || !hasTop || (needsAccessories && !hasAccessoriesImages)) {
                existingRec.recommendation = await fetchAndAttachImages(existingRec.recommendation);
                
                // Use updateOne to save the modified mixed object
                await DailyRecommendation.updateOne(
                    { _id: existingRec._id },
                    { $set: { recommendation: existingRec.recommendation } }
                );
            }
            return {
                source: "cache",
                data: existingRec.recommendation,
            };
        } else {
            // Invalidate cache if mismatch
            await DailyRecommendation.deleteOne({ _id: existingRec._id });
        }
    }

    // 3. Generate AI recommendation if not found or invalidated
    let recommendation = await generateOutfitRecommendation(
        user.bodyType,
        user.preferences || []
    );

    // Fetch images from Pexels in parallel
    recommendation = await fetchAndAttachImages(recommendation);

    // 4. Save to cache with personalization snapshot
    await DailyRecommendation.create({
        userId,
        recommendation,
        generatedForDate: startOfDay,
        bodyType: user.bodyType,
        stylePreferences: user.preferences || [],
    });

    // 5. Return structured recommendation data
    return {
        source: "generated",
        data: recommendation,
    };
};
