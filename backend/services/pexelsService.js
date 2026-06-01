import axios from 'axios';

const getSearchTerms = (query) => {
    const q = query.toLowerCase();
    let normalized = query;
    let category = query;

    if (q.includes('shirt') || q.includes('t-shirt') || q.includes('tshirt')) {
        normalized = q.includes('casual') ? 'casual shirt' : 'shirt';
        category = 'shirt';
    } else if (q.includes('jeans')) {
        normalized = q.includes('blue') ? 'blue jeans' : (q.includes('black') ? 'black jeans' : 'jeans');
        category = 'jeans';
    } else if (q.includes('sneakers') || q.includes('shoes') || q.includes('trainers')) {
        normalized = q.includes('white') ? 'white sneakers' : 'sneakers';
        category = 'sneakers';
    } else if (q.includes('watch')) {
        normalized = 'wrist watch';
        category = 'watch';
    } else if (q.includes('sunglasses') || q.includes('glasses')) {
        normalized = 'sunglasses';
        category = 'sunglasses';
    } else if (q.includes('bag') || q.includes('tote')) {
        normalized = q.includes('tote') ? 'tote bag' : 'bag';
        category = 'bag';
    } else if (q.includes('jacket') || q.includes('coat')) {
        normalized = q.includes('jacket') ? 'jacket' : 'coat';
        category = normalized;
    } else if (q.includes('dress')) {
        normalized = 'dress';
        category = 'dress';
    } else {
        const words = q.split(' ');
        if (words.length > 2) {
            normalized = words.slice(-2).join(' ');
        }
        category = words[words.length - 1];
    }

    // Deduplicate queries
    const terms = [query, normalized, category].filter((item, pos, self) => self.indexOf(item) === pos);
    return terms;
};

const callPexels = async (searchQuery, useIsolated = true) => {
    const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
    if (!PEXELS_API_KEY) return null;
    
    const suffix = useIsolated ? 'isolated product' : 'fashion';
    const enhancedQuery = `${searchQuery} ${suffix}`.trim();

    try {
        const response = await axios.get(`https://api.pexels.com/v1/search`, {
            params: { 
                query: enhancedQuery, 
                per_page: 1,
                orientation: 'portrait' 
            },
            headers: { 
                Authorization: PEXELS_API_KEY 
            }
        });

        if (response.data && response.data.photos && response.data.photos.length > 0) {
            return response.data.photos[0].src.medium;
        }
        
        return null;
    } catch (error) {
        console.error(`Pexels fetch error for query "${enhancedQuery}":`, error.message);
        return null;
    }
};

/**
 * Fetch a fashion-focused image from Pexels API with fallback strategy
 * @param {string} query - The search query
 * @param {string} gender - The gender constraint
 * @returns {Promise<string|null>} - The URL of the image or null if failed
 */
export const fetchPexelsImage = async (query, gender = "") => {
    const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
    if (!PEXELS_API_KEY) {
        console.warn("PEXELS_API_KEY is missing. Skipping image fetch.");
        return null;
    }

    const searchTerms = getSearchTerms(query);
    const prefix = gender && gender !== "Prefer not to say" && gender !== "Other" ? `${gender.toLowerCase()} ` : "";
    
    // Pass 1: Try with "isolated product"
    for (const term of searchTerms) {
        const url = await callPexels(`${prefix}${term}`, true);
        if (url) return url;
    }

    // Pass 2: Try with just "fashion" (broader fallback)
    for (const term of searchTerms) {
        const url = await callPexels(`${prefix}${term}`, false);
        if (url) return url;
    }
    
    return null;
};
