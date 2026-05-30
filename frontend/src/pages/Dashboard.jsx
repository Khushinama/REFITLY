import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboard } from "../store/slices/authSlice";
import { fetchWardrobe } from "../store/slices/wardrobeSlice";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import FullLookModal from "../components/FullLookModal";
import recommendationApi from "../services/api/recommendationApi";
import { 
  Shirt, 
  Tag, 
  Scan, 
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



const Dashboard = () => {
  const dispatch = useDispatch();
  const { dashboardData, user, loading: authLoading } = useSelector((state) => state.auth);
  const { items: wardrobeItems, loading: wardrobeLoading } = useSelector((state) => state.wardrobe);
  const loading = authLoading || wardrobeLoading;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [todaySuggestion, setTodaySuggestion] = useState(null);
  const [suggestionLoading, setSuggestionLoading] = useState(true);
  const [suggestionError, setSuggestionError] = useState(false);

  const loadRecommendation = async () => {
    setSuggestionLoading(true);
    setSuggestionError(false);
    try {
      const response = await recommendationApi.fetchTodayRecommendation();
      if (response.success && response.data) {
        setTodaySuggestion(response.data);
      } else {
        setTodaySuggestion(null);
      }
    } catch (error) {
      console.error("Failed to fetch recommendation", error);
      setSuggestionError(true);
    } finally {
      setSuggestionLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(fetchWardrobe());
    loadRecommendation();
  }, [dispatch]);

  const bodyType = useMemo(() => {
    return dashboardData?.user?.bodyType || user?.bodyType || localStorage.getItem("bodyType") || "Not Set";
  }, [dashboardData, user]);

  const userPreferences = useMemo(() => {
    return dashboardData?.user?.preferences || user?.preferences || [];
  }, [dashboardData, user]);


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

  // Dynamic Style Score logic
  const dynamicStyleScore = useMemo(() => {
    if (!wardrobeItems || wardrobeItems.length === 0) return 0;
    
    // If no preferences set, calculate a base variety score
    if (!userPreferences || userPreferences.length === 0) {
      const categories = new Set(wardrobeItems.map(i => i.category));
      let score = 50;
      if (categories.has('top')) score += 10;
      if (categories.has('bottom')) score += 10;
      if (categories.has('footwear')) score += 10;
      if (categories.has('accessory')) score += 10;
      if (categories.has('layer')) score += 10;
      return Math.min(score, 98);
    }

    // Convert preferences to lowercase strings and strip "ist" (Minimalist -> minimal) for broader matching
    const preferred = userPreferences.map(p => p.toLowerCase().replace('ist', ''));
    
    let matchCount = 0;
    wardrobeItems.forEach(item => {
      const tags = (item.styleTags || []).map(t => t.toLowerCase());
      const vibes = Array.isArray(item.vibe) 
        ? item.vibe.map(v => String(v).toLowerCase()) 
        : (item.vibe ? [String(item.vibe).toLowerCase()] : []);
        
      const allKeywords = [...tags, ...vibes, (item.name || '').toLowerCase(), (item.category || '').toLowerCase()];
      
      const hasMatch = preferred.some(pref => 
        allKeywords.some(kw => kw.includes(pref) || pref.includes(kw))
      );
      
      if (hasMatch) {
        matchCount++;
      }
    });

    // Score calculation: 50% base + up to 50% based on match ratio
    const matchRatio = matchCount / wardrobeItems.length;
    let score = Math.round(50 + (matchRatio * 50));
    
    return Math.min(score, 98);
  }, [wardrobeItems, userPreferences]);

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
      <FullLookModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        suggestion={todaySuggestion} 
        wardrobeItems={wardrobeItems} 
      />

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
              value={`${dynamicStyleScore}%`} 
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
                    
                    <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#81A6C6]">Today's Style Suggestion</span>
                  </div>
                </div>

                {suggestionLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-[#81A6C6]/20 rounded w-3/4"></div>
                    <div className="h-4 bg-[#81A6C6]/20 rounded w-full"></div>
                    <div className="h-4 bg-[#81A6C6]/20 rounded w-5/6"></div>
                    <div className="h-20 bg-[#81A6C6]/20 rounded w-full mt-4"></div>
                  </div>
                ) : suggestionError ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                    <p className="text-sm text-[#8A8A9A]">Unable to generate today's recommendation.</p>
                    <button 
                      onClick={loadRecommendation}
                      className="px-4 py-2 bg-white text-[#81A6C6] rounded-full text-xs font-medium border border-[#81A6C6]/20 hover:bg-[#81A6C6]/10 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : !todaySuggestion ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-[#8A8A9A]">No recommendation available.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6 items-start">
                    <div className="flex-1 space-y-4 w-full">
                      <h3 className="text-xl md:text-2xl font-['Playfair_Display'] font-medium">{todaySuggestion.title}</h3>
                      <p className="text-xs md:text-sm text-[#8A8A9A] leading-relaxed italic">"{todaySuggestion.description}"</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold tracking-wider text-[#81A6C6] uppercase">Top</p>
                          <p className="text-xs md:text-sm text-[#3D3D4E]">{todaySuggestion.top}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold tracking-wider text-[#81A6C6] uppercase">Bottom</p>
                          <p className="text-xs md:text-sm text-[#3D3D4E]">{todaySuggestion.bottom}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold tracking-wider text-[#81A6C6] uppercase">Footwear</p>
                          <p className="text-xs md:text-sm text-[#3D3D4E]">{todaySuggestion.footwear}</p>
                        </div>
                        {todaySuggestion.accessories && todaySuggestion.accessories.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold tracking-wider text-[#81A6C6] uppercase">Accessories</p>
                            <ul className="text-xs md:text-sm text-[#3D3D4E] space-y-1">
                              {todaySuggestion.accessories.map((acc, i) => (
                                <li key={i} className="flex items-center gap-1.5">
                                  <span className="text-[#81A6C6] text-[10px]">✓</span> {acc}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 mt-4">
                        <div className="flex items-center gap-1.5 text-[10px] text-[#81A6C6] font-medium italic">
                          <Info size={12} />
                          Generated for your body type and style preferences
                        </div>
                        <button 
                          onClick={() => setIsModalOpen(true)}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 bg-[#81A6C6] text-white rounded-full font-medium text-xs hover:bg-[#6B90B0] transition-colors active:scale-95"
                        >
                          View Full Look
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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