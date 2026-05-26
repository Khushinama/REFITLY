import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboard } from "../store/slices/authSlice";
import { fetchWardrobe } from "../store/slices/wardrobeSlice";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { 
  Shirt, 
  Tag, 
  Scan, 
  Sparkles, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Info,
  Zap
} from "lucide-react";

const BODY_TYPE_TIPS = {
  Rectangle: ["Add structure to your outfits", "Use layers to create dimension"],
  Pear: ["Highlight upper body with lighter colors", "Balance proportions with structured tops"],
  Hourglass: ["Emphasize your waistline", "Use fitted clothing to highlight curves"],
  "Inverted Triangle": ["Wear flared or wide-leg bottoms to add volume to the lower body", "Choose darker or minimal tops to reduce shoulder emphasis"]
};

const STYLE_PREFERENCE_TIPS = {
  Minimalist: ["Stick to neutral color palettes", "Keep outfits clean and simple"],
  Vintage: ["Incorporate classic patterns", "Use high-waisted silhouettes"],
  Casual: ["Focus on comfort with relaxed fits", "Mix basic pieces for everyday looks"],
  Streetwear: ["Experiment with oversized silhouettes", "Add bold statement pieces"],
  Formal: ["Choose structured and tailored fits", "Stick to polished and clean looks"]
};

// Structured Style Mapping Configuration
const STYLE_MAPPING = {
  Minimalist: {
    title: "Minimalist Essentials",
    description: "Clean lines and neutral tones for a refined everyday look.",
    items: ["White Shirt", "Straight Denim", "Loafers"],
    bodyTips: {
      Rectangle: "Opt for structured fabrics to add subtle definition to your frame.",
      Pear: "Balance your silhouette with sharp shoulders and streamlined bottoms.",
      Hourglass: "Highlight your waist with well-fitted basics that follow your natural curve.",
      "Inverted Triangle": "Use neutral tones on top and straight-cut trousers to balance your shoulders."
    }
  },
  Vintage: {
    title: "Vintage Classic Look",
    description: "Timeless pieces with a nostalgic charm and relaxed silhouettes.",
    items: ["Retro Knit", "High-Waist Trousers", "Leather Boots"],
    bodyTips: {
      Rectangle: "Use high-waisted vintage cuts to create more dynamic visual proportions.",
      Pear: "Nostalgic A-line styles perfectly complement your natural curves.",
      Hourglass: "Classic wrap dresses or high-waist skirts accentuate your classic figure.",
      "Inverted Triangle": "Wide-leg vintage trousers help balance broader shoulder silhouettes."
    }
  },
  Casual: {
    title: "Effortless Casual Fit",
    description: "Comfortable and stylish combinations for everyday wear.",
    items: ["Basic Tee", "Comfort Chinos", "Clean Sneakers"],
    bodyTips: {
      Rectangle: "Layer a casual jacket over your tee to build more structure.",
      Pear: "Light-colored tops with darker chinos draw attention upwards.",
      Hourglass: "Simple tucked-in tees celebrate your balanced proportions effortlessly.",
      "Inverted Triangle": "V-neck casual tops help soften the line of your shoulders."
    }
  },
  Streetwear: {
    title: "Streetwear Vibes",
    description: "Trendy oversized fits with bold styling elements.",
    items: ["Graphic Hoodie", "Cargo Pants", "High-Top Sneakers"],
    bodyTips: {
      Rectangle: "Boxy streetwear hoodies add desirable volume to your silhouette.",
      Pear: "Statement sneakers and accessories pull focus toward your overall look.",
      Hourglass: "Try cropped streetwear hoodies to maintain your waist definition.",
      "Inverted Triangle": "Oversized graphic hoodies naturally suit your broader frame."
    }
  },
  Formal: {
    title: "Sharp Formal Look",
    description: "Structured outfits that create a polished and confident appearance.",
    items: ["Tailored Blazer", "Dress Shirt", "Oxford Shoes"],
    bodyTips: {
      Rectangle: "A structured blazer with slight padding adds power and definition.",
      Pear: "Padded shoulders in formal wear create a perfectly balanced look.",
      Hourglass: "Tailored blazers that nip at the waist are your definitive formal piece.",
      "Inverted Triangle": "Single-breasted blazers with minimal lapels keep your formal look sharp."
    }
  }
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { dashboardData, user, loading: authLoading } = useSelector((state) => state.auth);
  const { items: wardrobeItems, loading: wardrobeLoading } = useSelector((state) => state.wardrobe);
  const loading = authLoading || wardrobeLoading;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(fetchWardrobe());
  }, [dispatch]);

  const bodyType = useMemo(() => {
    return dashboardData?.user?.bodyType || user?.bodyType || localStorage.getItem("bodyType") || "Not Set";
  }, [dashboardData, user]);

  const userPreferences = useMemo(() => {
    return dashboardData?.user?.preferences || user?.preferences || [];
  }, [dashboardData, user]);

  // Dynamic Suggestion Logic
  const suggestion = useMemo(() => {
    const primaryStyle = userPreferences[0];
    
    if (!primaryStyle || !STYLE_MAPPING[primaryStyle]) {
      return {
        isFallback: true,
        title: "Define Your Style",
        description: "Start by adding your style preferences in your profile to get personalized suggestions.",
        items: []
      };
    }

    const styleData = STYLE_MAPPING[primaryStyle];
    const bodySpecificTip = styleData.bodyTips[bodyType] || "";

    return {
      isFallback: false,
      title: styleData.title,
      description: bodySpecificTip ? `${styleData.description} ${bodySpecificTip}` : styleData.description,
      items: styleData.items,
      badge: primaryStyle
    };
  }, [userPreferences, bodyType]);

  // Personalized Style Tips Logic
  const styleTips = useMemo(() => {
    const primaryStyle = userPreferences[0];
    const bodyTips = BODY_TYPE_TIPS[bodyType];
    const styleTipsList = STYLE_PREFERENCE_TIPS[primaryStyle];

    if (bodyTips && styleTipsList) {
      return [bodyTips[0], styleTipsList[0]];
    } else if (bodyTips) {
      return [bodyTips[0], bodyTips[1]];
    } else if (styleTipsList) {
      return [styleTipsList[0], styleTipsList[1]];
    }
    return [
      "Build a balanced outfit using basics",
      "Choose outfits that match your comfort and confidence"
    ];
  }, [bodyType, userPreferences]);

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F7F0E8] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#81A6C6] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#1A1A1A] font-medium">Elevating your style...</p>
        </div>
      </div>
    );
  }

  const totalItems = wardrobeItems.length;
  const categoriesCount = new Set(wardrobeItems.map(item => item.category)).size;
  const recentItems = [...wardrobeItems].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F0E8] font-['Inter'] text-[#1A1A1A]">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&display=swap');
          body { font-family: 'Inter', sans-serif; }
          h1, h2, h3, .font-playfair { font-family: 'Playfair Display', serif; }

          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

          .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
          .animate-slide-up { animation: slideUp 0.6s ease-out forwards; }

          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-300 { animation-delay: 0.3s; }
        `}
      </style>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar 
          title="Dashboard" 
          showAddButton={false} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8">
          {/* Welcome Section */}
          <section className="animate-slide-up opacity-0">
            <h1 className="text-3xl font-semibold text-[#1A1A1A] mb-1">
              Welcome back, {dashboardData?.user?.name || user?.name || "Style Enthusiast"} 👋
            </h1>
            <p className="text-[#8A8A9A] text-sm">Here's your style overview for today.</p>
          </section>

          {/* Stats Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-10">
            <StatCard 
              label="Total Items" 
              value={totalItems} 
              icon={<Shirt className="w-5 h-5 text-[#81A6C6]" />} 
              delay="delay-100"
            />
            <StatCard 
              label="Categories" 
              value={categoriesCount} 
              icon={<Tag className="w-5 h-5 text-[#81A6C6]" />} 
              delay="delay-200"
            />
            <StatCard 
              label="Style Score" 
              value="85%" 
              icon={<TrendingUp className="w-5 h-5 text-[#81A6C6]" />} 
              delay="delay-300"
            />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column: Body Type & Suggestion */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {/* Body Type Highlight */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-[#AACDDC]/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10 flex flex-col sm:flex-row items-start justify-between gap-6">
                  <div className="space-y-3 md:space-y-4">
                    <div className="inline-flex items-center px-3 py-1 bg-[#81A6C6]/10 text-[#81A6C6] rounded-full text-[9px] md:text-[10px] font-bold tracking-widest uppercase">
                      Analysis Result
                    </div>
                    <h2 className="text-xl md:text-2xl font-['Playfair_Display'] font-semibold">Your Body Type: {bodyType}</h2>

                    {/* Style Tips Section */}
                    <div className="pt-3 md:pt-4 mt-2 md:mt-3 border-t border-[#81A6C6]/10 space-y-3">
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-[#81A6C6] fill-[#81A6C6]/20" />
                        <h4 className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#1A1A1A]">Your Style Tips</h4>
                      </div>
                      <ul className="space-y-2.5">
                        {styleTips.map((tip, idx) => (
                          <li 
                            key={idx} 
                            className="flex items-start gap-2 text-[13px] md:text-sm text-[#8A8A9A] leading-relaxed animate-fade-in" 
                            style={{ animationDelay: `${0.4 + (idx * 0.15)}s` }}
                          >
                            <div className="w-1 h-1 bg-[#81A6C6] rounded-full mt-2 shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                      <p className="text-[9px] text-[#81A6C6] font-medium italic opacity-60">Based on your body type & style</p>
                    </div>
                  </div>
                  <div className="p-3 md:p-4 bg-[#F7F0E8] rounded-2xl">
                    <Scan className="w-6 h-6 md:w-8 md:h-8 text-[#81A6C6]" />
                  </div>
                </div>
              </div>

              {/* Dynamic Suggestion Card */}
              <div className="bg-[#81A6C6]/10 border border-[#81A6C6]/5 rounded-2xl p-6 md:p-8 transition-all duration-500 hover:translate-y-[-4px]">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="flex items-center gap-2 text-[#81A6C6]">
                    <Sparkles className="w-4 md:w-5 h-4 md:h-5" />
                    <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#81A6C6]">Today's Style Suggestion</span>
                  </div>
                  {!suggestion.isFallback && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/80 rounded-full text-[10px] font-bold text-[#81A6C6] border border-[#81A6C6]/10">
                      <div className="w-1.5 h-1.5 bg-[#81A6C6] rounded-full"></div>
                      {suggestion.badge}
                    </div>
                  )}
                </div>

                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
                  <div className="flex-1 space-y-3 md:space-y-4">
                    <h3 className="text-xl md:text-2xl font-['Playfair_Display'] font-medium">{suggestion.title}</h3>
                    <p className="text-xs md:text-sm text-[#8A8A9A] leading-relaxed italic">"{suggestion.description}"</p>
                    
                    {!suggestion.isFallback && (
                      <div className="flex flex-wrap gap-2 pt-1 md:pt-2">
                        {suggestion.items.map(item => (
                          <span key={item} className="px-2 md:px-3 py-1 bg-white/60 backdrop-blur-sm border border-[#81A6C6]/20 rounded-full text-[10px] md:text-xs text-[#3D3D4E]">
                            {item}
                          </span>
                        ))}
                      </div>
                    )}

                    {!suggestion.isFallback && (
                      <div className="flex items-center gap-1.5 text-[10px] text-[#81A6C6] pt-1 font-medium italic opacity-70">
                        <Info size={12} />
                        Based on your style preferences and body type
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => suggestion.isFallback ? (window.location.href = '/profile') : null}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#81A6C6] text-white rounded-full font-medium text-xs md:text-sm hover:bg-[#6B90B0] transition-all hover:shadow-lg active:scale-95"
                  >
                    {suggestion.isFallback ? "Set Preferences" : "View Full Look"}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Recent Activity/Items */}
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-lg font-['Playfair_Display'] font-semibold">Recently Added</h3>
                <button 
                  onClick={() => window.location.href = '/wardrobe'}
                  className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-[#81A6C6] hover:text-[#6B90B0] transition-colors"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3 md:space-y-4">
                {recentItems.length > 0 ? (
                  recentItems.map((item) => (
                    <div 
                      key={item._id} 
                      className="bg-white p-3 md:p-4 rounded-xl shadow-sm flex items-center gap-3 md:gap-4 group hover:shadow-md transition-all duration-300"
                    >
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-[#F7F0E8] rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Shirt className="w-5 h-5 md:w-6 md:h-6 text-[#AACDDC]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs md:text-sm text-[#1A1A1A] group-hover:text-[#81A6C6] transition-colors truncate">{item.name}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[9px] md:text-[10px] text-[#8A8A9A] uppercase tracking-wider truncate">{item.category}</span>
                          <span className="w-0.5 h-0.5 bg-[#8A8A9A] rounded-full"></span>
                          <span className="text-[9px] md:text-[10px] text-[#8A8A9A] uppercase tracking-wider truncate">{item.color}</span>
                        </div>
                      </div>
                      <div className="text-[9px] md:text-[10px] text-[#8A8A9A] whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white/50 border border-dashed border-[#81A6C6]/30 rounded-xl p-6 md:p-8 text-center">
                    <Clock className="w-6 h-6 md:w-8 md:h-8 text-[#81A6C6]/40 mx-auto mb-2 md:mb-3" />
                    <p className="text-[10px] md:text-sm text-[#8A8A9A]">Your wardrobe is waiting for its first piece.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, delay }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-sm hover:shadow-md hover:translate-y-[-4px] transition-all duration-500 animate-slide-up opacity-0 ${delay}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="p-2.5 bg-[#81A6C6]/10 rounded-xl">{icon}</div>
      <div className="h-1.5 w-1.5 bg-[#81A6C6] rounded-full"></div>
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-bold tracking-[0.15em] text-[#8A8A9A] uppercase">{label}</p>
      <h3 className="text-2xl font-bold font-['Playfair_Display'] text-[#1A1A1A]">{value}</h3>
    </div>
  </div>
);

export default Dashboard;