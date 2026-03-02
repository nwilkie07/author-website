import { useState, useEffect } from "react";

export type ScreenSize = "mobile" | "tablet" | "desktop";

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
