import { useState, useEffect } from "react";

/** Discrete breakpoint categories returned by the hook. */
export type ScreenSize = "mobile" | "tablet" | "desktop";

/**
 * Tracks the current viewport width and returns a breakpoint category.
 *
 * Breakpoints:
 *  - mobile  — width < 640 px
 *  - tablet  — 640 px ≤ width < 1024 px
 *  - desktop — width ≥ 1024 px
 *
 * The hook attaches a `resize` event listener and cleans it up on unmount.
 * It is a no-op during SSR (returns "desktop" as a safe default until the
 * client hydrates and the effect runs).
 *
 * @returns `{ screenSize, width, isMobile, isTablet, isDesktop }`
 */
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState<ScreenSize>("desktop");
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      setWidth(currentWidth);

      if (currentWidth < 640) {
        setScreenSize("mobile");
      } else if (currentWidth < 1024) {
        setScreenSize("tablet");
      } else {
        setScreenSize("desktop");
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { screenSize, width, isMobile: screenSize === "mobile", isTablet: screenSize === "tablet", isDesktop: screenSize === "desktop" };
}
