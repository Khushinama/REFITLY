/**
 * Calculates the diversity score of a candidate outfit against a list of already selected outfits.
 * Returns a score between 0 and 100, where 100 means completely diverse.
 * @param {object} candidate - The candidate outfit
 * @param {Array} selectedList - The list of already selected outfits
 * @returns {number} diversity score (0–100)
 */
export function calculateOutfitDiversity(candidate, selectedList) {
    if (!selectedList || selectedList.length === 0) {
        return 100;
    }

    const candidateTop = candidate.items?.top?._id?.toString();
    const candidateBottom = candidate.items?.bottom?._id?.toString();
    const candidateDress = candidate.items?.dress?._id?.toString();
    const candidateShoes = (candidate.items?.shoes || candidate.items?.footwear)?._id?.toString();
    const candidateLayer = candidate.items?.layer?._id?.toString();
    const candidateMood = candidate.mood?.dominantMood;

    let maxSimilarity = 0;

    for (const selected of selectedList) {
        const selectedTop = selected.items?.top?._id?.toString();
        const selectedBottom = selected.items?.bottom?._id?.toString();
        const selectedDress = selected.items?.dress?._id?.toString();
        const selectedShoes = (selected.items?.shoes || selected.items?.footwear)?._id?.toString();
        const selectedLayer = selected.items?.layer?._id?.toString();
        const selectedMood = selected.mood?.dominantMood;

        let similarity = 0;

        // Dress vs two-piece logic
        if (candidateDress || selectedDress) {
            // Dress matching
            if (candidateDress === selectedDress && candidateDress) {
                similarity += 0.70;
            }
        } else {
            // Top and Bottom matching
            if (candidateTop === selectedTop && candidateTop) {
                similarity += 0.35;
            }
            if (candidateBottom === selectedBottom && candidateBottom) {
                similarity += 0.35;
            }
        }

        // Shoes matching
        if (candidateShoes === selectedShoes && candidateShoes) {
            similarity += 0.15;
        }

        // Layer matching
        if (candidateLayer === selectedLayer && candidateLayer) {
            similarity += 0.15;
        }

        // Mood matching (minor penalty for repeating the exact same mood type)
        if (candidateMood === selectedMood && candidateMood) {
            similarity += 0.05;
        }

        if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
        }
    }

    return Math.max(0, (1 - maxSimilarity) * 100);
}
