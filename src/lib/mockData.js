/**
 * @typedef {Object} Memory
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} date
 * @property {string[]} tags
 * @property {string} imageUrl
 * @property {string} [location]
 * @property {boolean} [isMilestone]
 * @property {string} [albumId]
 */

/**
 * @typedef {Object} Album
 * @property {string} id
 * @property {string} name
 * @property {string} coverUrl
 * @property {number} memoryCount
 * @property {string} description
 */

export const mockMemories = [
  {
    id: "1",
    title: "First Day at the Beach",
    description: "The sun was setting and the waves crashed gently against the shore. We built sandcastles and collected seashells until the stars came out.",
    date: "2024-07-15",
    tags: ["vacation", "beach", "family"],
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    location: "Malibu, California",
    isMilestone: false,
  },
  {
    id: "2",
    title: "Mountain Sunrise Hike",
    description: "Woke up at 4am for this breathtaking sunrise at the summit. Every step was worth it.",
    date: "2024-06-20",
    tags: ["hiking", "nature", "adventure"],
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop",
    location: "Rocky Mountains, Colorado",
  },
  {
    id: "3",
    title: "Graduation Day",
    description: "Four years of hard work culminated in this beautiful moment. So proud and grateful for everyone who supported me.",
    date: "2024-05-10",
    tags: ["milestone", "education", "celebration"],
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=600&h=400&fit=crop",
    location: "University Hall",
    isMilestone: true,
  },
  {
    id: "4",
    title: "Cozy Rainy Afternoon",
    description: "Sometimes the best memories are the quiet ones. Hot cocoa, a good book, and rain tapping on the window.",
    date: "2024-04-02",
    tags: ["cozy", "home", "peaceful"],
    imageUrl: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=600&h=400&fit=crop",
  },
  {
    id: "5",
    title: "Our Wedding Day",
    description: "The most magical day of our lives. Surrounded by love, laughter, and everyone we hold dear.",
    date: "2024-03-15",
    tags: ["wedding", "love", "milestone", "family"],
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop",
    location: "Rose Garden Estate",
    isMilestone: true,
  },
  {
    id: "6",
    title: "Street Food Adventure in Bangkok",
    description: "The flavors, the colors, the energy — Bangkok's street food scene is an experience like no other.",
    date: "2024-02-08",
    tags: ["travel", "food", "adventure"],
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
    location: "Bangkok, Thailand",
  },
  {
    id: "7",
    title: "Baby's First Steps",
    description: "She wobbled, she steadied, and then she walked! The whole room erupted in cheers.",
    date: "2024-01-20",
    tags: ["family", "milestone", "baby"],
    imageUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=400&fit=crop",
    isMilestone: true,
  },
  {
    id: "8",
    title: "Autumn in Kyoto",
    description: "The temples draped in red and gold leaves. Every corner was a painting come to life.",
    date: "2023-11-05",
    tags: ["travel", "nature", "japan"],
    imageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&h=400&fit=crop",
    location: "Kyoto, Japan",
  },
];

export const mockAlbums = [
  {
    id: "a1",
    name: "Summer Adventures",
    coverUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    memoryCount: 12,
    description: "All the sunny days and warm memories from summer 2024.",
  },
  {
    id: "a2",
    name: "Family Milestones",
    coverUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop",
    memoryCount: 8,
    description: "The moments that changed everything.",
  },
  {
    id: "a3",
    name: "World Travels",
    coverUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&h=400&fit=crop",
    memoryCount: 24,
    description: "Adventures from around the globe.",
  },
  {
    id: "a4",
    name: "Cozy Moments",
    coverUrl: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=600&h=400&fit=crop",
    memoryCount: 6,
    description: "The little quiet joys that warm the heart.",
  },
];