import { normalizeCategory } from "./normalizeCategory.js";
import { detectLayerType } from "./detectLayerType.js";
import { getItemVibe } from "./helpers/eventCompatibility.js";

/**
 * Normalizes a wardrobe item object for internal consistency.
 * @param {object} item 
 * @returns {object}
 */
export const normalizeWardrobeItem = (item) => {
  const normalized = { ...item };

  // Normalize category
  if (normalized.category) {
    normalized.category = normalizeCategory(normalized.category);
  }

  // Normalize event to array
  if (normalized.event) {
    if (Array.isArray(normalized.event)) {
      normalized.event = normalized.event;
    } else if (typeof normalized.event === 'string') {
      // Handle comma separated string or single string
      normalized.event = normalized.event.split(',').map(e => e.trim()).filter(e => e !== "");
    } else {
      normalized.event = [normalized.event];
    }
  } else {
    normalized.event = [];
  }

  // Ensure colorFamily exists (if possible, though usually set by detection)
  if (!normalized.colorFamily) {
    normalized.colorFamily = "neutral";
  }

  // Ensure styleTags is array
  if (normalized.styleTags) {
    if (!Array.isArray(normalized.styleTags)) {
      if (typeof normalized.styleTags === 'string') {
        normalized.styleTags = normalized.styleTags.split(',').map(t => t.trim()).filter(t => t !== "");
      } else {
        normalized.styleTags = [normalized.styleTags];
      }
    }
  } else {
    normalized.styleTags = [];
  }

  // Handle Layer Type Detection
  if (normalized.category === 'layer') {
    if (!normalized.type) {
      normalized.type = detectLayerType(normalized.name, normalized.styleTags);
    }
  } else {
    normalized.type = null;
  }

  // Ensure vibe is present (use saved vibe, otherwise calculate dynamically)
  if (!normalized.vibe) {
    normalized.vibe = getItemVibe(normalized);
  }

  return normalized;
};
