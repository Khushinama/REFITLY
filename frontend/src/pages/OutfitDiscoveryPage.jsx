import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { fetchHistory } from '../store/slices/historySlice';
import FilterDrawer from '../components/outfit/FilterDrawer';
import OutfitGrid from '../components/outfit/OutfitGrid';
import OutfitModal from '../components/outfit/OutfitModal';
import EmptyState from '../components/outfit/EmptyState';
import ShuffleButton from '../components/outfit/ShuffleButton';
import { Filter } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { fetchRecommendations, submitOutfitFeedback, fetchSavedOutfits } from '../services/api/recommendationApi';
import { useSearchParams } from 'react-router-dom';
import { syncSavedState } from '../utils/syncSavedState';

const FILTER_MAP = {
  "casual": ["casual"],
  "formal": ["formal"],
  "party": ["party"],
  "date night": ["party", "casual"],
  "office": ["formal", "office"],
  "vacation": ["casual"],
};


const OutfitDiscoveryPage = () => {
  // State Management as requested (Step 2)
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [filters, setFilters] = useState({
    eventLabel: "Casual",
    eventValues: ["casual"],
    style: [],
    season: "all"
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') || 'discover';
  const [savedOutfits, setSavedOutfits] = useState([]);

  // Fetch saved outfits from backend database
  const loadSavedOutfits = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetchSavedOutfits();
      if (res.success) {
        setSavedOutfits(res.data.outfits || []);
      }
    } catch (err) {
      console.error("Error loading saved outfits:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // API Fetch Function (Step 4)
  const fetchOutfits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const eventQuery = filters.eventValues.map(e => e.toLowerCase()).join(",");
      const styleQuery = filters.style.map(s => s.toLowerCase()).join(",");
      const seasonQuery = filters.season.toLowerCase();
      
      console.log("Filters:", filters);
      console.log("API Query:", { event: eventQuery, style: styleQuery, season: seasonQuery });

      const res = await fetchRecommendations({
        event: eventQuery,
        style: styleQuery,
        season: seasonQuery === 'all' ? 'all' : seasonQuery,
        page: page,
        limit: 6
      });

      if (res.success) {
        const fetchedOutfits = res.data.outfits || [];
        setOutfits((prev) =>
          page === 1 ? fetchedOutfits : [...prev, ...fetchedOutfits]
        );
        setHasMore(res.data.pagination.hasMore);
      } else {
        setError(res.message);
      }
    } catch (err) {
      console.error("API ErrorDetails:", err.response?.data);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to fetch outfits. Please check your connection.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  const dispatch = useDispatch();

  // Load history and saved outfits silently on mount
  useEffect(() => {
    dispatch(fetchHistory());
    loadSavedOutfits(true);
  }, [dispatch, loadSavedOutfits]);

  // Auto Trigger API based on view
  useEffect(() => {
    if (currentView === 'saved') {
      loadSavedOutfits(false);
    } else {
      fetchOutfits();
    }
  }, [currentView, fetchOutfits, loadSavedOutfits]);

  // Synchronize state dynamically using syncSavedState
  const syncedOutfits = useMemo(() => {
    return syncSavedState(outfits, savedOutfits);
  }, [outfits, savedOutfits]);

  const syncedSelectedOutfit = useMemo(() => {
    if (!selectedOutfit) return null;
    const synced = syncSavedState([selectedOutfit], savedOutfits)[0];
    return synced || selectedOutfit;
  }, [selectedOutfit, savedOutfits]);

  // Handle Option Clicks (Step 3)
  const handleEventClick = (label) => {
    const mapped = FILTER_MAP[label.toLowerCase()] || ["casual"];

    setFilters(prev => ({
      ...prev,
      eventLabel: label,
      eventValues: mapped
    }));

    setPage(1); // reset pagination
    setOutfits([]); // clear old results
  };

  const handleStyleClick = (style) => {
    setFilters(prev => ({
      ...prev,
      style: prev.style.includes(style)
        ? prev.style.filter(s => s !== style)
        : [...prev.style, style]
    }));

    setPage(1);
    setOutfits([]);
  };

  const handleSeasonClick = (season) => {
    setFilters(prev => ({
      ...prev,
      season
    }));

    setPage(1);
    setOutfits([]);
  };

  const handleFeedback = async (outfitId, feedbackType) => {
    // Keep a backup of current states in case we need to roll back
    const previousOutfits = [...outfits];
    const previousSavedOutfits = [...savedOutfits];
    const previousSelectedOutfit = selectedOutfit;

    // Perform optimistic updates
    const targetOutfit = [...outfits, ...savedOutfits].find(o => o.id === outfitId);
    if (!targetOutfit) return;

    let nextOutfit = { ...targetOutfit };
    if (feedbackType === 'like') {
      nextOutfit.isLiked = !nextOutfit.isLiked;
    } else if (feedbackType === 'save') {
      nextOutfit.isSaved = !nextOutfit.isSaved;
    } else if (feedbackType === 'dislike') {
      nextOutfit.isLiked = false;
      nextOutfit.isSaved = false;
    }

    // Instantly update local state lists for UI responsiveness
    setOutfits(prev => prev.map(o => o.id === outfitId ? nextOutfit : o));
    setSavedOutfits(prev => {
      if (feedbackType === 'save') {
        if (nextOutfit.isSaved) {
          if (!prev.some(o => o.id === outfitId)) {
            return [...prev, nextOutfit];
          }
          return prev;
        } else {
          return prev.filter(o => o.id !== outfitId);
        }
      } else if (feedbackType === 'dislike') {
        return prev.filter(o => o.id !== outfitId);
      } else {
        return prev.map(o => o.id === outfitId ? nextOutfit : o);
      }
    });

    if (selectedOutfit && selectedOutfit.id === outfitId) {
      setSelectedOutfit(nextOutfit);
    }

    try {
      setIsProcessing(true);
      const res = await submitOutfitFeedback(outfitId, feedbackType, targetOutfit);
      if (res.success) {
        const updatedOutfit = { ...res.data.outfit };
        // Apply final backend truth
        setOutfits(prev => prev.map(o => o.id === outfitId ? { ...o, ...updatedOutfit } : o));
        setSavedOutfits(prev => {
          if (feedbackType === 'save') {
            if (updatedOutfit.isSaved) {
              if (!prev.some(o => o.id === outfitId)) {
                return [...prev, updatedOutfit];
              }
              return prev.map(o => o.id === outfitId ? { ...o, ...updatedOutfit } : o);
            } else {
              return prev.filter(o => o.id !== outfitId);
            }
          } else if (feedbackType === 'dislike') {
            return prev.filter(o => o.id !== outfitId);
          } else {
            return prev.map(o => o.id === outfitId ? { ...o, ...updatedOutfit } : o);
          }
        });
        if (selectedOutfit && selectedOutfit.id === outfitId) {
          setSelectedOutfit(updatedOutfit);
        }
      } else {
        // Rollback state on failure response
        setOutfits(previousOutfits);
        setSavedOutfits(previousSavedOutfits);
        setSelectedOutfit(previousSelectedOutfit);
      }
    } catch (err) {
      console.error("Feedback error, rolling back:", err);
      // Rollback state on network/API exception
      setOutfits(previousOutfits);
      setSavedOutfits(previousSavedOutfits);
      setSelectedOutfit(previousSelectedOutfit);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F0E8] font-['Inter'] text-[#3D3D4E]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Topbar 
          title="Outfits" 
          showAddButton={false} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-[1440px] mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-semibold text-[#1A1A2E] font-playfair">
                  Your <span className="text-[#81A6C6]">Style</span> Guide
                </h2>
                <p className="text-[#8A8A9A] text-sm font-medium mt-1">
                  Filtering for <span className="text-[#1A1A2E]">{filters.eventLabel}</span>
                  {filters.style.length > 0 && <span> • {filters.style.join(", ")}</span>}
                  {filters.season !== 'all' && <span className="capitalize"> • {filters.season}</span>}
                </p>
              </div>

              <div className="flex items-center gap-3 justify-end">
                {currentView === 'discover' && (
                  <button 
                    onClick={() => setShowFilters(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#1A1A2E] text-white rounded-full shadow-lg hover:bg-black transition-all transform active:scale-95"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Filters</span>
                  </button>
                )}

                <div className="flex bg-white/50 backdrop-blur p-1 rounded-full border border-gray-100 shadow-sm">
                  <button 
                    onClick={() => setSearchParams({ view: 'discover' })}
                    className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${currentView === 'discover' ? 'bg-[#1A1A2E] text-white shadow-md' : 'text-gray-500 hover:text-[#1A1A2E]'}`}
                  >
                    Discover
                  </button>
                  <button 
                    onClick={() => setSearchParams({ view: 'saved' })}
                    className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${currentView === 'saved' ? 'bg-[#1A1A2E] text-white shadow-md' : 'text-gray-500 hover:text-[#1A1A2E]'}`}
                  >
                    Saved
                  </button>
                </div>
              </div>
            </div>

            <div className="transition-all duration-500 ease-in-out">
              {currentView === 'saved' ? (
                savedOutfits.length === 0 && !loading ? (
                  <EmptyState 
                    type="no-results" 
                    customTitle="No saved outfits yet"
                    customDescription="Start exploring AI recommendations and save the ones you love!"
                    onReset={() => setSearchParams({ view: 'discover' })} 
                  />
                ) : (
                  <OutfitGrid 
                    outfits={savedOutfits}
                    loading={loading}
                    event="Collection"
                    onFeedback={handleFeedback}
                    isProcessing={isProcessing}
                    onCardClick={setSelectedOutfit}
                  />
                )
              ) : error ? (
                <EmptyState 
                  type={error.toLowerCase().includes('wardrobe') ? 'insufficient-wardrobe' : 'error'} 
                  onReset={() => error.toLowerCase().includes('wardrobe') ? (window.location.href='/wardrobe') : fetchOutfits()}
                  customDescription="Upload clothes to your wardrobe to get outfit suggestions."
                />
              ) : outfits.length === 0 && !loading ? (
                <EmptyState 
                  type="no-results" 
                  onReset={() => handleEventClick("Casual")} 
                  customDescription="Upload clothes to your wardrobe to get outfit suggestions."
                />
              ) : (
                <div className="pb-20">
                  <OutfitGrid 
                    outfits={syncedOutfits}
                    loading={loading}
                    event={filters.eventLabel}
                    onFeedback={handleFeedback}
                    isProcessing={isProcessing}
                    onCardClick={setSelectedOutfit}
                  />

                  {hasMore && (
                    <ShuffleButton 
                      onClick={() => setPage((prev) => prev + 1)} 
                      isLoading={loading} 
                    />
                  )}
                  
                  {!hasMore && outfits.length > 0 && (
                     <div className="text-center py-20 text-[#8A8A9A] font-medium italic text-sm">
                        You've found all the best matches for this vibe! ✨
                     </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <FilterDrawer 
        isOpen={showFilters} 
        onClose={() => setShowFilters(false)}
        filters={filters}
        onEventClick={handleEventClick}
        onStyleClick={handleStyleClick}
        onSeasonClick={handleSeasonClick}
      />

      <OutfitModal 
        outfit={syncedSelectedOutfit}
        event={filters.eventLabel}
        onClose={() => setSelectedOutfit(null)}
        onFeedback={handleFeedback}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default OutfitDiscoveryPage;
