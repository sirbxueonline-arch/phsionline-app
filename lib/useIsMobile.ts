import { useEffect, useState } from "react";

/**
 * Detects if viewport width is below the given breakpoint.
 * Defaults to 768px to match the Tailwind `md` breakpoint.
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setIsMobile(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
}
