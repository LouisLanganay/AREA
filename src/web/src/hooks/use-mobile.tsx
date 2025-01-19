import * as React from "react";

/**
 * Breakpoint width in pixels that defines mobile devices
 */
const MOBILE_BREAKPOINT = 768;

/**
 * Custom hook to detect if the current viewport is mobile-sized
 * @returns {boolean} True if viewport width is less than MOBILE_BREAKPOINT
 */
export function useIsMobile() {
  // State to track mobile status, initially undefined
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Create media query for mobile breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Handler function to update mobile status
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Add listener for viewport changes
    mql.addEventListener("change", onChange);

    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Cleanup listener on unmount
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Convert undefined to false and return boolean
  return !!isMobile;
}
