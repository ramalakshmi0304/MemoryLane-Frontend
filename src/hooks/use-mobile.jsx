import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Custom hook to detect if the current viewport is mobile-sized.
 * @returns {boolean}
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(undefined);

  React.useEffect(() => {
    // Create the media query list
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    // Set the initial value
    setIsMobile(mql.matches);

    // Listener function to update state on resize
    const onChange = () => {
      setIsMobile(mql.matches);
    };

    // Modern browsers use addEventListener
    mql.addEventListener("change", onChange);
    
    // Clean up the listener when the component unmounts
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}