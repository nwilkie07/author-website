/**
 * TestimonialCarousel — accessible carousel for reader testimonial quotes.
 *
 * Renders a single testimonial at a time with previous/next navigation
 * buttons and a dot-indicator row for direct index navigation. The active
 * index wraps around at both ends (circular navigation).
 *
 * `goToNext` and `goToPrevious` are memoised with `useCallback` to avoid
 * unnecessary re-renders if the component is used inside a larger tree.
 *
 * Returns `null` if the `testimonials` array is empty, so callers do not
 * need to guard against rendering an empty carousel.
 */
import { useState, useCallback } from "react";
import type { Testimonial } from "../types/db";

type TestimonialCarouselProps = {
  testimonials: Testimonial[];
};

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  if (testimonials.length === 0) {
    return null;
  }

  const current = testimonials[currentIndex];

  return (
    <div className="relative top-[-50px]">
      <div className="flex items-center justify-center gap-4">
        {testimonials.length > 1 && (
          <button
            onClick={goToPrevious}
            className="text-[#426684] hover:text-[#25384F] p-2"
            aria-label="Previous testimonial"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        <div className="max-w-3xl">
          <blockquote className="mx-auto text-2xl text-center">
            "{current.description}"
          </blockquote>
          <div className="mt-4 text-center">
            — {current.name}{current.store && ` • ${current.store}`}
          </div>
        </div>

        {testimonials.length > 1 && (
          <button
            onClick={goToNext}
            className="text-[#426684] hover:text-[#25384F] p-2"
            aria-label="Next testimonial"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
      
      {testimonials.length > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-[#426684] w-6" : "bg-[#426684]/50"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
