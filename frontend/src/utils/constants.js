export const EVENTS = [
  { id: 'casual', label: 'Casual', emoji: '☕' },
  { id: 'formal', label: 'Formal', emoji: '💼' },
  { id: 'party', label: 'Party', emoji: '🎉' },
  { id: 'wedding', label: 'Wedding', emoji: '💍' },
  { id: 'date', label: 'Date Night', emoji: '🌹' },
  { id: 'office', label: 'Office', emoji: '🏢' },
  { id: 'vacation', label: 'Vacation', emoji: '🏖️' },
  { id: 'brunch', label: 'Brunch', emoji: '🥐' },
];

export const STYLES = [
  { id: 'minimal', label: 'Minimal', emoji: '✨' },
  { id: 'classy', label: 'Classy', emoji: '👑' },
  { id: 'streetwear', label: 'Streetwear', emoji: '🛹' },
  { id: 'bohemian', label: 'Bohemian', emoji: '🌻' },
  { id: 'trendy', label: 'Trendy', emoji: '🔥' },
];

export const SEASONS = [
  { id: 'all', label: 'All', emoji: '🌍' },
  { id: 'summer', label: 'Summer', emoji: '☀️' },
  { id: 'winter', label: 'Winter', emoji: '❄️' },
  { id: 'monsoon', label: 'Monsoon', emoji: '🌧️' },
  { id: 'spring', label: 'Spring', emoji: '🌸' },
];

export const DEFAULT_FILTERS = {
  event: 'casual',
  style: [],
  season: 'all',
  excludeRecent: true,
};
