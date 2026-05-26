import { useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to detect when user has scrolled to the bottom
 * @param {Function} callback - Function to call when bottom is reached
 * @param {boolean} hasMore - Boolean to prevent loading if no more data
 */
export const useInfiniteScroll = (callback, hasMore) => {
  const observer = useRef();

  const lastElementRef = useCallback(node => {
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        callback();
      }
    });

    if (node) observer.current.observe(node);
  }, [callback, hasMore]);

  return lastElementRef;
};
