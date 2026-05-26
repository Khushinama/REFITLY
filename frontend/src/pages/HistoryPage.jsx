import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCalendarHistory } from '../store/slices/historySlice';
import { fetchSavedOutfits, submitOutfitFeedback } from '../services/api/recommendationApi';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import OutfitModal from '../components/outfit/OutfitModal';
import ImageStack from '../components/outfit/ImageStack';
import { syncSavedState } from '../utils/syncSavedState';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar, 
  X, 
  Info, 
  Sparkles, 
  Heart, 
  TrendingUp, 
  Activity, 
  Palette,
  ExternalLink
} from 'lucide-react';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const HistoryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1-indexed (1-12)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Selection states
  const [selectedDate, setSelectedDate] = useState(null); // format: YYYY-MM-DD
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState('casual');
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [isFeedbackProcessing, setIsFeedbackProcessing] = useState(false);

  const { calendarHistory, calendarLoading, error } = useSelector((state) => state.history || {});

  // Fetch month data on change
  useEffect(() => {
    dispatch(fetchCalendarHistory({ month: currentMonth, year: currentYear }));
  }, [dispatch, currentMonth, currentYear]);

  // Load saved outfits silently to support modal like/save sync
  const loadSavedOutfitsSilently = useCallback(async () => {
    try {
      const res = await fetchSavedOutfits();
      if (res.success) {
        setSavedOutfits(res.data.outfits || []);
      }
    } catch (err) {
      console.error("Error loading saved outfits:", err);
    }
  }, []);

  useEffect(() => {
    loadSavedOutfitsSilently();
  }, [loadSavedOutfitsSilently]);

  // Set default selected date on load or month change
  useEffect(() => {
    const keys = Object.keys(calendarHistory);
    if (keys.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      if (keys.includes(todayStr)) {
        setSelectedDate(todayStr);
      } else {
        setSelectedDate(keys[0]);
      }
    } else {
      setSelectedDate(null);
    }
  }, [calendarHistory]);

  // Handle date selection with transition
  const handleDateSelect = (dateStr) => {
    if (dateStr === selectedDate) return;
    setIsTransitioning(true);
    setSelectedDate(dateStr);
    setTimeout(() => setIsTransitioning(false), 200);
  };

  // Sync saved state on selected outfit
  const syncedSelectedOutfit = useMemo(() => {
    if (!selectedOutfit) return null;
    const synced = syncSavedState([selectedOutfit], savedOutfits)[0];
    return synced || selectedOutfit;
  }, [selectedOutfit, savedOutfits]);

  // Handle modal feedback (like/save)
  const handleModalFeedback = async (outfitId, feedbackType) => {
    setIsFeedbackProcessing(true);
    try {
      const targetOutfit = selectedOutfit;
      if (targetOutfit && targetOutfit.id === outfitId) {
        let nextOutfit = { ...targetOutfit };
        if (feedbackType === 'like') {
          nextOutfit.isLiked = !nextOutfit.isLiked;
        } else if (feedbackType === 'save') {
          nextOutfit.isSaved = !nextOutfit.isSaved;
        } else if (feedbackType === 'dislike') {
          nextOutfit.isLiked = false;
          nextOutfit.isSaved = false;
        }
        setSelectedOutfit(nextOutfit);

        // Update local saved outfits cache
        if (feedbackType === 'save') {
          if (nextOutfit.isSaved) {
            setSavedOutfits(prev => [...prev, nextOutfit]);
          } else {
            setSavedOutfits(prev => prev.filter(o => o.id !== outfitId));
          }
        }
      }
      await submitOutfitFeedback(outfitId, feedbackType, selectedOutfit);
    } catch (err) {
      console.error("Feedback error:", err);
    } finally {
      setIsFeedbackProcessing(false);
    }
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth() + 1);
    setCurrentYear(today.getFullYear());
    const todayStr = today.toISOString().split('T')[0];
    handleDateSelect(todayStr);
  };

  // Dynamic AI styling insights calculation
  const monthlyInsights = useMemo(() => {
    let totalOutfits = 0;
    const eventCounts = {};
    const styleCounts = {};
    const colorCounts = {};
    const wornDates = [];

    Object.entries(calendarHistory).forEach(([dateStr, items]) => {
      if (!items || items.length === 0) return;
      totalOutfits += items.length;
      wornDates.push(new Date(dateStr));

      items.forEach(item => {
        const ev = (item.event || 'casual').toLowerCase();
        eventCounts[ev] = (eventCounts[ev] || 0) + 1;

        const outfit = item.outfit;
        if (outfit && outfit.items) {
          Object.values(outfit.items).forEach(clothing => {
            if (clothing && clothing.color) {
              const col = clothing.color.toLowerCase();
              colorCounts[col] = (colorCounts[col] || 0) + 1;
            }
            if (clothing && clothing.styleTags) {
              clothing.styleTags.forEach(t => {
                const tag = t.toLowerCase();
                styleCounts[tag] = (styleCounts[tag] || 0) + 1;
              });
            }
          });
        }
      });
    });

    const getTopKey = (obj) => {
      let topKey = 'None';
      let maxCount = 0;
      Object.entries(obj).forEach(([k, v]) => {
        if (v > maxCount) {
          maxCount = v;
          topKey = k;
        }
      });
      return topKey.charAt(0).toUpperCase() + topKey.slice(1);
    };

    // Calculate streak
    wornDates.sort((a, b) => a - b);
    let maxStreak = 0;
    let currentStreak = 0;
    let lastDate = null;

    wornDates.forEach(date => {
      if (!lastDate) {
        currentStreak = 1;
      } else {
        const diffDays = Math.ceil(Math.abs(date - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays > 1) {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      }
      lastDate = date;
    });
    maxStreak = Math.max(maxStreak, currentStreak);

    return {
      totalOutfits,
      topEvent: getTopKey(eventCounts),
      favoriteStyle: getTopKey(styleCounts),
      favoriteColor: getTopKey(colorCounts),
      streak: maxStreak || 0
    };
  }, [calendarHistory]);

  // Client-side aesthetic style mood classifier
  const getOutfitMoodText = (items) => {
    if (!items) return "Balanced Styling";
    const activeItems = Object.values(items).filter(Boolean);
    const vibes = activeItems.map(i => i.vibe || 'casual');
    
    const hasHeels = activeItems.some(i => (i.name || '').toLowerCase().includes('heel') || (i.styleTags || []).map(t => t.toLowerCase()).includes('heels'));
    const hasSkirt = activeItems.some(i => (i.name || '').toLowerCase().includes('skirt'));
    const hasDress = Boolean(items.dress);
    const hasBlazer = activeItems.some(i => (i.name || '').toLowerCase().includes('blazer'));
    const hasSneakers = activeItems.some(i => (i.name || '').toLowerCase().includes('sneaker'));

    if ((hasHeels && hasSkirt) || (hasHeels && hasDress)) return "Sophisticated Elegance";
    if (hasBlazer) return "Professional Business";
    if (hasSneakers && activeItems.some(i => (i.styleTags || []).map(t => t.toLowerCase()).includes('streetwear'))) return "Urban Streetwear";
    if (vibes.includes('classy') && vibes.includes('casual')) return "Smart Casual";
    if (vibes.includes('sporty')) return "Sporty Athleisure";
    return "Casual Comfort";
  };

  // Date formatter for header
  const formatDateHeader = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' };
    return date.toLocaleDateString('en-US', options);
  };

  // Build Calendar grid cells
  const calendarCells = useMemo(() => {
    const totalDays = new Date(currentYear, currentMonth, 0).getDate();
    let firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay();
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const cells = [];

    // 1. Previous month trailing days
    const prevMonthDays = new Date(currentYear, currentMonth - 1, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        type: 'padding-prev',
        dateNumber: prevMonthDays - i,
        key: `prev-${prevMonthDays - i}`
      });
    }

    // 2. Current month days
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = new Date().toDateString() === new Date(currentYear, currentMonth - 1, day).toDateString();
      
      cells.push({
        type: 'day',
        dateNumber: day,
        dateString: dateStr,
        isToday,
        key: `day-${day}`
      });
    }

    // 3. Next month leading days
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const paddingNext = totalCells - cells.length;
    for (let i = 1; i <= paddingNext; i++) {
      cells.push({
        type: 'padding-next',
        dateNumber: i,
        key: `next-${i}`
      });
    }

    return cells;
  }, [currentMonth, currentYear]);

  // Outfits worn on selected date
  const selectedDateOutfits = useMemo(() => {
    if (!selectedDate) return [];
    return calendarHistory[selectedDate] || [];
  }, [selectedDate, calendarHistory]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F0E8] font-['Inter'] text-[#3D3D4E]">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
          }
          
          h1, h2, h3, .font-playfair {
            font-family: 'Playfair Display', serif;
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(180, 165, 148, 0.3);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(180, 165, 148, 0.5);
          }
        `}
      </style>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Topbar 
          title="Styling Diary" 
          showAddButton={false} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 h-full items-stretch">
            
            {/* LEFT COLUMN: Compact Calendar & Insights (42%) */}
            <div className="w-full lg:w-[42%] flex flex-col gap-6 flex-shrink-0">
              
              {/* Header Title */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-semibold text-[#1A1A2E] font-playfair tracking-tight">
                    Style <span className="text-[#81A6C6]">Archives</span>
                  </h2>
                  <p className="text-[#8A8A9A] text-xs font-semibold mt-0.5">
                    Your personal fashion catalog history log.
                  </p>
                </div>

                {/* Navigation Header */}
                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md border border-[rgba(180,165,148,0.15)] rounded-xl p-1 shadow-sm">
                  <button 
                    onClick={handlePrevMonth}
                    className="p-1.5 hover:bg-white rounded-lg transition-all active:scale-95"
                    aria-label="Prev Month"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#3D3D4E]" />
                  </button>
                  <span className="font-playfair text-[#1A1A2E] font-bold text-xs md:text-sm px-1 min-w-[95px] text-center select-none">
                    {MONTH_NAMES[currentMonth - 1]} {currentYear}
                  </span>
                  <button 
                    onClick={handleNextMonth}
                    className="p-1.5 hover:bg-white rounded-lg transition-all active:scale-95"
                    aria-label="Next Month"
                  >
                    <ChevronRight className="w-4 h-4 text-[#3D3D4E]" />
                  </button>
                  <div className="h-4 w-[1px] bg-[rgba(180,165,148,0.3)] mx-0.5" />
                  <button 
                    onClick={handleGoToToday}
                    className="p-1.5 hover:bg-white rounded-lg transition-all font-bold text-[9px] uppercase tracking-wider text-[#81A6C6]"
                  >
                    Today
                  </button>
                </div>
              </div>

              {/* Monthly AI insights section */}
              <div className="bg-[#EAE3D9]/60 border border-[rgba(180,165,148,0.2)] rounded-3xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-wrap gap-y-3 justify-between items-center text-left select-none">
                <div className="w-[30%] border-r border-[rgba(180,165,148,0.2)] pr-2">
                  <p className="text-[8px] font-bold text-[#8A8A9A] uppercase tracking-widest flex items-center gap-1">
                    <Activity className="w-2.5 h-2.5 text-[#81A6C6]" /> Looks
                  </p>
                  <p className="font-playfair text-lg font-bold text-[#1A1A2E] mt-0.5">{monthlyInsights.totalOutfits} Worn</p>
                </div>
                <div className="w-[35%] border-r border-[rgba(180,165,148,0.2)] px-2">
                  <p className="text-[8px] font-bold text-[#8A8A9A] uppercase tracking-widest flex items-center gap-1">
                    <TrendingUp className="w-2.5 h-2.5 text-[#81A6C6]" /> Favorite Style
                  </p>
                  <p className="font-playfair text-lg font-bold text-[#1A1A2E] mt-0.5 truncate">{monthlyInsights.favoriteStyle}</p>
                </div>
                <div className="w-[30%] pl-2">
                  <p className="text-[8px] font-bold text-[#8A8A9A] uppercase tracking-widest flex items-center gap-1">
                    <Palette className="w-2.5 h-2.5 text-[#81A6C6]" /> Color
                  </p>
                  <p className="font-playfair text-lg font-bold text-[#1A1A2E] mt-0.5 truncate">{monthlyInsights.favoriteColor}</p>
                </div>
              </div>

              {/* Compact Calendar Container */}
              <div className="bg-white/40 backdrop-blur-sm rounded-[28px] p-4 border border-[rgba(180,165,148,0.15)] shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-3">
                {/* Week Day headers */}
                <div className="grid grid-cols-7 gap-1 text-center select-none">
                  {WEEK_DAYS.map((day) => (
                    <div key={day} className="text-[9px] font-extrabold tracking-widest text-[#8A8A9A] uppercase">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Loading State or Calendar Grid */}
                {calendarLoading ? (
                  <div className="h-60 w-full flex items-center justify-center flex-col gap-2">
                    <div className="w-8 h-8 border-3 border-[#81A6C6]/20 border-t-[#81A6C6] rounded-full animate-spin" />
                    <p className="text-[#8A8A9A] text-[10px] font-bold tracking-widest uppercase">Fetching Logs...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-1.5">
                    {calendarCells.map((cell) => {
                      if (cell.type.startsWith('padding')) {
                        return (
                          <div 
                            key={cell.key} 
                            className="relative aspect-square bg-transparent border border-dashed border-[rgba(180,165,148,0.08)] rounded-xl p-1 opacity-20 select-none pointer-events-none"
                          >
                            <span className="font-playfair text-[10px] font-bold text-[#8A8A9A]">{cell.dateNumber}</span>
                          </div>
                        );
                      }

                      const wornOutfits = calendarHistory[cell.dateString] || [];
                      const hasOutfits = wornOutfits.length > 0;
                      const isSelected = selectedDate === cell.dateString;

                      if (hasOutfits) {
                        const mainOutfit = wornOutfits[0].outfit;
                        return (
                          <div 
                            key={cell.key}
                            onClick={() => handleDateSelect(cell.dateString)}
                            className={`relative aspect-square overflow-hidden rounded-xl group transition-all duration-300 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:-translate-y-0.5 ${
                              isSelected 
                                ? 'ring-2 ring-[#1A1A2E] ring-offset-2 scale-[0.98]' 
                                : cell.isToday
                                  ? 'border-2 border-[#81A6C6]'
                                  : 'border border-[rgba(180,165,148,0.15)] hover:border-[#81A6C6]'
                            }`}
                          >
                            {/* Visual Thumbnail */}
                            <div className="absolute inset-0 z-0 select-none pointer-events-none transition-transform duration-500 group-hover:scale-105">
                              <ImageStack items={mainOutfit?.items} variant="grid" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10 z-10" />

                            <span className="absolute top-1 left-1 z-20 font-playfair font-bold text-white text-[10px] bg-black/40 backdrop-blur-md rounded-md w-4 h-4 flex items-center justify-center border border-white/5 shadow-sm">
                              {cell.dateNumber}
                            </span>

                            {wornOutfits.length > 1 && (
                              <span className="absolute bottom-1 right-1 z-20 text-[7px] font-extrabold text-white bg-[#81A6C6]/90 px-1 rounded-sm border border-white/10 shadow-sm uppercase tracking-tighter">
                                +{wornOutfits.length - 1}
                              </span>
                            )}
                          </div>
                        );
                      }

                      // Empty Date Cell
                      return (
                        <div 
                          key={cell.key}
                          onClick={() => handleDateSelect(cell.dateString)}
                          className={`relative aspect-square bg-[#FDFBF7] hover:bg-[#FBF9F4] border rounded-xl p-1.5 flex flex-col justify-between group transition-all duration-300 cursor-pointer ${
                            isSelected 
                              ? 'ring-2 ring-[#1A1A2E] ring-offset-2 scale-[0.98]'
                              : cell.isToday 
                                ? 'border-2 border-[#81A6C6]/60' 
                                : 'border-[rgba(180,165,148,0.1)] hover:border-[#81A6C6]/30'
                          }`}
                        >
                          <span className={`font-playfair text-[10px] font-bold ${cell.isToday ? 'text-[#81A6C6]' : 'text-[#8A8A9A]/60'}`}>
                            {cell.dateNumber}
                          </span>
                          <Plus className="w-3.5 h-3.5 text-[#8A8A9A]/0 group-hover:text-[#8A8A9A]/40 scale-75 group-hover:scale-100 transition-all duration-300 mx-auto my-auto" />
                          <span className="h-1 w-1 block" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Large Outfit Memory Preview Panel (58%) */}
            <div className="flex-1 lg:w-[58%]">
              
              {/* Animation transition container */}
              <div className={`h-full transition-all duration-300 transform ${
                isTransitioning 
                  ? 'opacity-0 translate-y-3 scale-98' 
                  : 'opacity-100 translate-y-0 scale-100'
              }`}>
                {selectedDateOutfits.length > 0 ? (
                  <div className="bg-white rounded-[32px] border border-[rgba(180,165,148,0.15)] shadow-[0_12px_45px_rgba(0,0,0,0.03)] h-full overflow-hidden flex flex-col min-h-[500px]">
                    
                    {/* Header Details */}
                    <div className="p-6 md:p-8 border-b border-[rgba(180,165,148,0.12)] flex-shrink-0 flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-extrabold tracking-[0.25em] text-[#81A6C6] uppercase mb-1.5 block">
                          AI STYLING JOURNAL
                        </span>
                        <h3 className="font-playfair text-2xl md:text-3xl font-extrabold text-[#1A1A2E] leading-tight">
                          {formatDateHeader(selectedDate)}
                        </h3>
                      </div>
                      
                      {/* Floating Indicator */}
                      <span className="bg-[#FBF8F3] px-3.5 py-1.5 rounded-xl border border-[rgba(180,165,148,0.12)] font-bold text-[10px] uppercase tracking-wider text-[#8A8A9A] shadow-sm select-none">
                        {selectedDateOutfits.length} Look{selectedDateOutfits.length > 1 ? 's' : ''} Worn
                      </span>
                    </div>

                    {/* Scrollable list of outfits worn on the selected date */}
                    <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                      {selectedDateOutfits.map((item, index) => {
                        const outfitObj = item.outfit;
                        const eventName = item.event || 'casual';
                        const stylingMood = getOutfitMoodText(outfitObj?.items);

                        return (
                          <div 
                            key={item._id} 
                            className="bg-[#FDFBF7] rounded-[24px] border border-[rgba(180,165,148,0.15)] p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-stretch"
                          >
                            {/* Left: Large Outfit Cover Image */}
                            <div className="w-full md:w-[42%] aspect-[3/4] rounded-2xl overflow-hidden shadow-sm bg-gray-50 flex-shrink-0 relative">
                              <ImageStack items={outfitObj?.items} variant="grid" />
                              
                              {/* Soft Floating Score Badge */}
                              <div className="absolute top-3 left-3 z-20">
                                <span className="bg-black/60 backdrop-blur-md text-white font-bold text-xs px-2.5 py-1 rounded-lg border border-white/10 shadow-md">
                                  {outfitObj?.score}% Match
                                </span>
                              </div>
                            </div>

                            {/* Right: Detailed Fashion Information */}
                            <div className="flex-grow flex flex-col justify-between gap-4">
                              <div className="space-y-4">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2.5 py-0.5 rounded-lg bg-[rgba(129,166,198,0.08)] text-[9px] font-extrabold text-[#81A6C6] uppercase tracking-wider">
                                      {eventName}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-lg bg-[#EAE3D9] text-[9px] font-extrabold text-[#3D3D4E] uppercase tracking-wider">
                                      {stylingMood}
                                    </span>
                                  </div>

                                  <h4 className="font-playfair text-xl md:text-2xl font-bold text-[#1A1A2E] mt-2 leading-tight truncate">
                                    {outfitObj?.items?.top?.name || outfitObj?.items?.dress?.name || 'Stylist Look'}
                                  </h4>
                                </div>

                                {/* Custom notes if typed by user */}
                                {item.notes && (
                                  <div className="p-3 bg-[#F5F1EA] rounded-xl border-l-2 border-[#81A6C6] text-xs text-[#3D3D4E] italic font-medium">
                                    "{item.notes}"
                                  </div>
                                )}

                                {/* Stylist Explanations */}
                                <div className="space-y-1.5">
                                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                    <Info className="w-3.5 h-3.5 text-[#81A6C6]" /> Why it worked
                                  </p>
                                  <ul className="space-y-1 text-xs text-[#8A8A9A] font-medium leading-relaxed">
                                    {(item.reasons || outfitObj?.whyReasons || outfitObj?.reasons)?.map((reason, rIdx) => (
                                      <li key={rIdx} className="flex items-start gap-1.5">
                                        <span className="text-[#81A6C6]">•</span>
                                        <span>{reason}</span>
                                      </li>
                                    )) || (
                                      <li className="flex items-start gap-1.5">
                                        <span className="text-[#81A6C6]">•</span>
                                        <span>A premium color harmony matching your profile constraints.</span>
                                      </li>
                                    )}
                                  </ul>
                                </div>

                                {/* Color Palette Circles */}
                                <div className="space-y-1.5">
                                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                    Palette
                                  </p>
                                  <div className="flex gap-1.5 flex-wrap">
                                    {outfitObj?.colorPalette?.slice(0, 5).map((color, cIdx) => (
                                      <div 
                                        key={cIdx}
                                        className="w-5 h-5 rounded-full border border-gray-200/50 shadow-sm"
                                        style={{ backgroundColor: color.toLowerCase() }}
                                        title={color}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Trigger existing OutfitModal details popup */}
                              <button 
                                onClick={() => {
                                  const outfitWithReasons = {
                                    ...outfitObj,
                                    reasons: item.reasons || outfitObj?.reasons || outfitObj?.whyReasons || []
                                  };
                                  setSelectedOutfit(syncSavedState([outfitWithReasons], savedOutfits)[0]);
                                  setSelectedEvent(eventName);
                                }}
                                className="mt-4 w-full py-2.5 px-4 rounded-xl bg-[#1A1A2E] text-white hover:bg-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-gray-200"
                              >
                                View Stylist Details <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  // FALLBACK PLACEHOLDER: No outfits worn on selected day
                  <div className="bg-white/40 border border-dashed border-[rgba(180,165,148,0.25)] rounded-[32px] p-8 h-full flex flex-col items-center justify-center text-center gap-6 min-h-[500px]">
                    <div className="w-16 h-16 rounded-full bg-[#EAE3D9]/60 flex items-center justify-center border border-[rgba(180,165,148,0.15)] shadow-sm">
                      <Sparkles className="w-8 h-8 text-[#81A6C6]" />
                    </div>

                    <div className="space-y-2 max-w-sm">
                      <h3 className="font-playfair text-2xl font-bold text-[#1A1A2E]">
                        No styling logged
                      </h3>
                      <p className="text-[#8A8A9A] text-xs font-medium leading-relaxed">
                        This date in your style memory is waiting to be written. Get styling recommendations to build your visual diary.
                      </p>
                    </div>

                    <button 
                      onClick={() => navigate('/outfits')}
                      className="px-6 py-3 rounded-xl border border-[#81A6C6] text-[#81A6C6] hover:bg-[#81A6C6]/5 active:scale-95 transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                    >
                      Browse Recommendations <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Detail Popup Modal */}
      {selectedOutfit && (
        <OutfitModal 
          outfit={syncedSelectedOutfit} 
          event={selectedEvent} 
          onClose={() => setSelectedOutfit(null)} 
          onFeedback={handleModalFeedback}
          isProcessing={isFeedbackProcessing}
        />
      )}
    </div>
  );
};

export default HistoryPage;
