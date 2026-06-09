import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Wardrobe from './models/Wardrobe.js';

dotenv.config({ path: './backend/.env' });

const testUsers = [
  {
    _id: "507f1f77bcf86cd799439011",
    name: "Sara Minimal",
    email: "sara@test.com",
    bodyType: "Pear",
    skinTone: "warm",
    stylePreference: ["minimal", "classy"],
    favoriteColors: ["beige", "white", "navy"],
    gender: "Female",
    isVerified: true,
    password: "TestPassword123"
  },
  {
    _id: "507f1f77bcf86cd799439012",
    name: "Alex Street",
    email: "alex@test.com",
    bodyType: "Rectangle",
    skinTone: "cool",
    stylePreference: ["streetwear", "trendy"],
    favoriteColors: ["black", "grey", "white"],
    gender: "Non-binary",
    isVerified: true,
    password: "TestPassword123"
  },
  {
    _id: "507f1f77bcf86cd799439013",
    name: "Maya Boho",
    email: "maya@test.com",
    bodyType: "Hourglass",
    skinTone: "neutral",
    stylePreference: ["bohemian", "trendy"],
    favoriteColors: ["rust", "olive", "cream"],
    gender: "Female",
    isVerified: true,
    password: "TestPassword123"
  }
];

const rawItems = [
  {
    name: "Classic White Cotton Tee",
    category: "top",
    color: "white",
    colorFamily: "neutral",
    pattern: "solid",
    fit: "regular",
    styleTags: ["minimal", "casual"],
    event: ["casual", "weekend", "brunch"],
    season: "All",
    imageUrl: "https://images.unsplash.com/photo-1581338834647-b0fb40704e21?w=400&q=80"
  },
  {
    name: "Navy Tailored Poplin Shirt",
    category: "top",
    color: "navy",
    colorFamily: "cool",
    pattern: "solid",
    fit: "fitted",
    styleTags: ["classy", "office"],
    event: ["office", "formal"],
    season: "All",
    imageUrl: "https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?w=400&q=80"
  },
  {
    name: "Rust Ribbed Knit Top",
    category: "top",
    color: "rust",
    colorFamily: "warm",
    pattern: "solid",
    fit: "slim",
    styleTags: ["bohemian", "trendy"],
    event: ["brunch", "casual"],
    season: "All",
    imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&q=80"
  },
  {
    name: "Tropical Floral Print Shirt",
    category: "top",
    color: "multi",
    colorFamily: "warm",
    pattern: "floral",
    fit: "loose",
    styleTags: ["bohemian", "vacation"],
    event: ["vacation", "casual"],
    season: "Summer",
    imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80"
  },
  {
    name: "Neon Pink Athletic Crop Top",
    category: "top",
    color: "neon pink",
    colorFamily: "bright",
    pattern: "solid",
    fit: "fitted",
    styleTags: ["trendy", "streetwear"],
    event: ["party", "casual"],
    season: "Summer",
    imageUrl: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&q=80"
  },
  {
    name: "Oversized Graphic Streetwear Tee",
    category: "top",
    color: "black",
    colorFamily: "neutral",
    pattern: "printed",
    fit: "oversized",
    styleTags: ["streetwear", "trendy"],
    event: ["casual", "party"],
    season: "All",
    imageUrl: "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400&q=80"
  },
  {
    name: "Formal White Wing-Tip Tuxedo Shirt",
    category: "top",
    color: "white",
    colorFamily: "neutral",
    pattern: "solid",
    fit: "slim",
    styleTags: ["classy", "formal"],
    event: ["formal", "wedding"],
    season: "All",
    imageUrl: "https://images.unsplash.com/photo-1621072138722-ec0617b0c2d4?w=400&q=80"
  },
  {
    name: "Emerald Green Cashmere Turtleneck",
    category: "top",
    color: "emerald",
    colorFamily: "cool",
    pattern: "solid",
    fit: "fitted",
    styleTags: ["minimal", "classy"],
    event: ["office", "formal", "casual"],
    season: "Winter",
    imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?w=400&q=80"
  },
  {
    name: "High-Waisted Black Wool Trousers",
    category: "bottom",
    color: "black",
    colorFamily: "neutral",
    pattern: "solid",
    fit: "straight",
    styleTags: ["minimal", "office", "classy"],
    event: ["office", "formal", "wedding"],
    season: "All",
    imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&q=80"
  },
  {
    name: "Teal Satin Straight-Leg Pants",
    category: "bottom",
    color: "teal",
    colorFamily: "cool",
    pattern: "solid",
    fit: "straight",
    styleTags: ["trendy", "classy"],
    event: ["party", "office"],
    season: "All",
    imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&q=80"
  },
  {
    name: "Chocolate Brown A-Line Skirt",
    category: "bottom",
    color: "brown",
    colorFamily: "warm",
    pattern: "solid",
    fit: "a-line",
    styleTags: ["bohemian", "classy"],
    event: ["brunch", "casual"],
    season: "All",
    imageUrl: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&q=80"
  },
  {
    name: "Electric Blue Satin Midi Skirt",
    category: "bottom",
    color: "electric blue",
    colorFamily: "bright",
    pattern: "solid",
    fit: "flowy",
    styleTags: ["trendy", "party"],
    event: ["party", "vacation"],
    season: "Summer",
    imageUrl: "https://images.unsplash.com/photo-1624223533663-8cb2825838d8?w=400&q=80"
  },
  {
    name: "Charcoal Wide-Leg Pleated Trousers",
    category: "bottom",
    color: "grey",
    colorFamily: "neutral",
    pattern: "solid",
    fit: "wide-leg",
    styleTags: ["minimal", "trendy", "office"],
    event: ["office", "casual"],
    season: "All",
    imageUrl: "https://images.unsplash.com/photo-1511130523295-811c6def3224?w=400&q=80"
  },
  {
    name: "Indigo Low-Rise Skinny Jeans",
    category: "bottom",
    color: "indigo",
    colorFamily: "neutral",
    pattern: "solid",
    fit: "skinny",
    styleTags: ["casual", "trendy"],
    event: ["casual", "weekend"],
    season: "All",
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80"
  },
  {
    name: "Mustard Yellow Bootcut Denim",
    category: "bottom",
    color: "mustard",
    colorFamily: "warm",
    pattern: "solid",
    fit: "bootcut",
    styleTags: ["bohemian", "trendy"],
    event: ["casual", "brunch"],
    season: "All",
    imageUrl: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400&q=80"
  },
  {
    name: "Classic Little Black Dress",
    category: "dress",
    color: "black",
    colorFamily: "neutral",
    pattern: "solid",
    fit: "fitted",
    styleTags: ["classy", "minimal"],
    event: ["party", "formal", "wedding"],
    season: "All",
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80"
  },
  {
    name: "Cream Linen Tiered Sundress",
    category: "dress",
    color: "cream",
    colorFamily: "neutral",
    pattern: "solid",
    fit: "flowy",
    styleTags: ["bohemian", "casual"],
    event: ["casual", "vacation", "brunch"],
    season: "Summer",
    imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80"
  },
  {
    name: "Rust Bohemian Floral Maxi",
    category: "dress",
    color: "rust",
    colorFamily: "warm",
    pattern: "floral",
    fit: "flowy",
    styleTags: ["bohemian", "trendy"],
    event: ["vacation", "party", "brunch"],
    season: "Summer",
    imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80"
  },
  {
    name: "Emerald Silk Evening Gown",
    category: "dress",
    color: "emerald",
    colorFamily: "cool",
    pattern: "solid",
    fit: "fitted",
    styleTags: ["classy", "formal"],
    event: ["formal", "wedding"],
    season: "All",
    imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&q=80"
  },
  {
    name: "Bright Red Polka-Dot Wrap Dress",
    category: "dress",
    color: "bright red",
    colorFamily: "bright",
    pattern: "polka",
    fit: "flowy",
    styleTags: ["trendy", "casual"],
    event: ["brunch", "casual"],
    season: "All",
    imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80"
  },
  {
    name: "Navy Structured Executive Blazer",
    category: "layer",
    type: "blazer",
    color: "navy",
    colorFamily: "cool",
    pattern: "solid",
    fit: "structured",
    styleTags: ["classy", "office"],
    event: ["office", "formal", "wedding"],
    season: "All",
    imageUrl: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=400&q=80"
  },
  {
    name: "Vintage Stonewash Denim Jacket",
    category: "layer",
    type: "jacket",
    color: "blue",
    colorFamily: "cool",
    pattern: "solid",
    fit: "regular",
    styleTags: ["casual", "streetwear"],
    event: ["casual", "weekend"],
    season: "All",
    imageUrl: "https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=400&q=80"
  },
  {
    name: "Cloud Grey Oversized Hoodie",
    category: "layer",
    type: "hoodie",
    color: "grey",
    colorFamily: "neutral",
    pattern: "solid",
    fit: "oversized",
    styleTags: ["streetwear", "casual"],
    event: ["casual"],
    season: "All",
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80"
  },
  {
    name: "Beige Soft Cozy Cardigan",
    category: "layer",
    type: "cardigan",
    color: "beige",
    colorFamily: "neutral",
    pattern: "solid",
    fit: "flowy",
    styleTags: ["minimal", "casual"],
    event: ["casual", "office", "brunch"],
    season: "All",
    imageUrl: "https://images.unsplash.com/photo-1582236371583-793540ae8b96?w=400&q=80"
  },
  {
    name: "Black Elegant Evening Shrug",
    category: "layer",
    type: "shrug",
    color: "black",
    colorFamily: "neutral",
    pattern: "solid",
    fit: "fitted",
    styleTags: ["party", "formal"],
    event: ["party", "formal"],
    season: "All",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80"
  },
  {
    name: "Burgundy Biker Leather Jacket",
    category: "layer",
    type: "jacket",
    color: "burgundy",
    colorFamily: "warm",
    pattern: "solid",
    fit: "structured",
    styleTags: ["trendy", "streetwear"],
    event: ["party", "casual"],
    season: "Winter",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80"
  },
  {
    name: "Minimalist White Leather Sneakers",
    category: "footwear",
    color: "white",
    colorFamily: "neutral",
    pattern: "solid",
    fit: "regular",
    styleTags: ["minimal", "casual", "streetwear"],
    event: ["casual", "weekend", "brunch"],
    season: "All",
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80"
  },
  {
    name: "Classic Pointed Black Stiletto Heels",
    category: "footwear",
    color: "black",
    colorFamily: "neutral",
    pattern: "solid",
    fit: "slim",
    styleTags: ["classy", "formal", "office"],
    event: ["formal", "wedding", "office", "party"],
    season: "All",
    imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80"
  },
  {
    name: "Tan Suede Chelsea Boots",
    category: "footwear",
    color: "tan",
    colorFamily: "warm",
    pattern: "solid",
    fit: "regular",
    styleTags: ["bohemian", "casual"],
    event: ["casual", "weekend"],
    season: "Winter",
    imageUrl: "https://images.unsplash.com/photo-1542272230-7f393621ccd0?w=400&q=80"
  },
  {
    name: "Nude Leather Essential Pumps",
    category: "footwear",
    color: "nude",
    colorFamily: "neutral",
    pattern: "solid",
    fit: "slim",
    styleTags: ["classy", "office", "minimal"],
    event: ["office", "formal"],
    season: "All",
    imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80"
  },
  {
    name: "Olive Green Minimalist Strappy Flats",
    category: "footwear",
    color: "olive",
    colorFamily: "warm",
    pattern: "solid",
    fit: "low-profile",
    styleTags: ["bohemian", "minimal"],
    event: ["casual", "brunch"],
    season: "Summer",
    imageUrl: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&q=80"
  }
];

const normalizedItems = rawItems.flatMap(item => [
  { ...item, user: "507f1f77bcf86cd799439011", image: item.imageUrl },
  { ...item, user: "507f1f77bcf86cd799439012", image: item.imageUrl },
  { ...item, user: "507f1f77bcf86cd799439013", image: item.imageUrl }
]);

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({ 
      $or: [
        { _id: { $in: testUsers.map(u => u._id) } },
        { email: { $in: testUsers.map(u => u.email) } }
      ] 
    });
    await Wardrobe.deleteMany({ user: { $in: testUsers.map(u => u._id) } });

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    for (let user of testUsers) {
      user.password = await bcrypt.hash(user.password, salt);
    }

    await User.insertMany(testUsers);
    await Wardrobe.insertMany(normalizedItems);

    // console.log('✅ Strategic test data seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
