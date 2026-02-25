import { useState, useEffect, useCallback } from "react";

import type { PurchaseLink } from "../types/db";

interface CarouselItem {
  id: number | string;
  imageUrl: string;
  title?: string;
  description?: string;
  link?: string;
  purchaseLinks?: PurchaseLink[];
}

interface CarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  className?: string;
  imageHeight?: string;
  onImageClick?: (item: CarouselItem) => void;
}

export function Carousel({
  items,
  autoPlay = false,
  autoPlayInterval = 5000,
  showIndicators = true,
  showArrows = true,
  showTitle = true,
  showDescription = false,
  className = "",
  imageHeight = "400px",
  onImageClick,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!autoPlay || isHovered || items.length <= 1) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isHovered, goToNext, items.length]);

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height: imageHeight }}>
        <p className="text-gray-500">No items to display</p>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div className={`flex gap-6 ${className}`}>
      <div
        className="relative overflow-hidden rounded-lg flex-1"
        style={{ height: imageHeight }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-full h-full transition-opacity duration-500">
          <img
            src={currentItem.imageUrl}
            alt={currentItem.title || `Slide ${currentIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => {
              // If consumer provided an image click handler, pass the current item
              (onImageClick as any)?.(currentItem);
            }}
          />
        </div>

        {showArrows && items.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all"
              aria-label="Previous slide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all"
              aria-label="Next slide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {showIndicators && items.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? "bg-white w-6" : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {(showTitle || showDescription) && (currentItem.title || currentItem.description) && (
        <div className="flex flex-col justify-center w-80 p-4">
          {showTitle && currentItem.title && (
            <h3 className="text-[#0e2a48] text-2xl font-[IvyModeSemiBold] mb-4">{currentItem.title}</h3>
          )}
          {showDescription && currentItem.description && (
            <p className="text-gray-700 font-[athelasbook] text-sm leading-relaxed">{currentItem.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
