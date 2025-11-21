import { useState, useEffect } from 'react';

/**
 * A custom hook that provides responsive design breakpoints
 * @returns {Object} Object containing boolean flags for different screen sizes
 */
const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return {
    width: windowSize.width,
    height: windowSize.height,
    isMobile: windowSize.width < 640,  // sm breakpoint in Tailwind
    isTablet: windowSize.width >= 640 && windowSize.width < 1024, // md-lg breakpoint
    isDesktop: windowSize.width >= 1024, // lg+ breakpoint
    isLargeDesktop: windowSize.width >= 1280, // xl breakpoint
  };
};

export default useResponsive;