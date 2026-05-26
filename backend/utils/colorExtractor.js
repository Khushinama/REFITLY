import Vibrant from 'node-vibrant';

/**
 * Basic color mapping and families
 */
const COLOR_MAP = [
  { name: 'Black', hex: '#000000', family: 'neutral' },
  { name: 'White', hex: '#FFFFFF', family: 'neutral' },
  { name: 'Grey', hex: '#808080', family: 'neutral' },
  { name: 'Navy', hex: '#000080', family: 'cool' },
  { name: 'Blue', hex: '#0000FF', family: 'cool' },
  { name: 'Beige', hex: '#F5F5DC', family: 'warm' },
  { name: 'Red', hex: '#FF0000', family: 'warm' },
  { name: 'Green', hex: '#008000', family: 'cool' },
  { name: 'Yellow', hex: '#FFFF00', family: 'warm' },
  { name: 'Pink', hex: '#FFC0CB', family: 'warm' },
  { name: 'Purple', hex: '#800080', family: 'cool' },
  { name: 'Brown', hex: '#A52A2A', family: 'warm' },
  { name: 'Orange', hex: '#FFA500', family: 'warm' },
  { name: 'Olive', hex: '#808000', family: 'warm' },
  { name: 'Cream', hex: '#FFFDD0', family: 'warm' }
];

/**
 * Calculate Euclidean distance between two colors in HEX
 */
const getDistance = (hex1, hex2) => {
  const r1 = parseInt(hex1.slice(1, 3), 16);
  const g1 = parseInt(hex1.slice(3, 5), 16);
  const b1 = parseInt(hex1.slice(5, 7), 16);

  const r2 = parseInt(hex2.slice(1, 3), 16);
  const g2 = parseInt(hex2.slice(3, 5), 16);
  const b2 = parseInt(hex2.slice(5, 7), 16);

  return Math.sqrt(
    Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2)
  );
};

/**
 * Find the closest basic color name and family from a HEX value
 */
export const getClosestColor = (hex) => {
  let minDistance = Infinity;
  let closest = COLOR_MAP[0];

  COLOR_MAP.forEach((color) => {
    const distance = getDistance(hex, color.hex);
    if (distance < minDistance) {
      minDistance = distance;
      closest = color;
    }
  });

  return closest;
};

/**
 * Extract dominant color metadata from an image (Buffer or URL)
 */
export const extractColorData = async (input) => {
  try {
    if (!input) return { hex: '#FFFFFF', name: 'Unknown', family: 'neutral' };
    
    const palette = await Vibrant.from(input).getPalette();
    const dominantHex = palette.Vibrant ? palette.Vibrant.getHex() : '#FFFFFF';
    const closest = getClosestColor(dominantHex);

    return {
      hex: dominantHex,
      name: closest.name,
      family: closest.family
    };
  } catch (error) {
    console.error('Error extracting color data:', error);
    return {
      hex: '#FFFFFF',
      name: 'Unknown',
      family: 'neutral'
    };
  }
};
