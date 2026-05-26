import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchRecommendations } from '../services/api/recommendationApi';
import { DEFAULT_FILTERS } from '../utils/constants';

/**
 * Custom hook to manage outfit recommendations state and fetching
 */
export const useOutfitRecommendations = () => {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  // Use ref to track active request to avoid race conditions
  const requestCount = useRef(0);

  const loadOutfits = useCallback(async (isNewSearch = false, customPage = 1) => {
    const currentRequest = ++requestCount.current;
    
    if (isNewSearch) {
      setLoading(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }
    
    setError(null);

    try {
      const response = await fetchRecommendations({
        ...filters,
        page: isNewSearch ? 1 : customPage,
        limit: 6
      });

      // Avoid updating state if a newer request has been started
      if (currentRequest !== requestCount.current) return;

      if (response.success) {
        if (isNewSearch) {
          setOutfits(response.data.outfits);
        } else {
          setOutfits(prev => [...prev, ...response.data.outfits]);
        }
        
        setHasMore(response.data.pagination.hasMore);
        setMeta(response.data.meta);
        if (!isNewSearch) setPage(customPage);
      } else {
        setError(response.message || 'Failed to fetch recommendations');
      }
    } catch (err) {
      if (currentRequest !== requestCount.current) return;
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      if (currentRequest === requestCount.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [filters]);

  // Initial load or filter change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadOutfits(true);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [loadOutfits]);

  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      loadOutfits(false, page + 1);
    }
  }, [loading, loadingMore, hasMore, page, loadOutfits]);

  const refresh = useCallback(() => {
    loadOutfits(true);
  }, [loadOutfits]);

  return {
    outfits,
    loading,
    loadingMore,
    error,
    hasMore,
    filters,
    setFilters,
    loadMore,
    refresh,
    meta,
    setOutfits
  };
};
