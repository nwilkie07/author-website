import React from "react";
import type { BookItem } from "~/types/books";

type Props = {
  items: BookItem[];
  imageWidth?: string;
  imageHeight?: string;
  containerClassName?: string;
  onImageClick?: (item: BookItem) => void;
};

// A simple, responsive horizontal carousel-like grid that can show multiple books side-by-side
export const MultiBookCarousel: React.FC<Props> = ({
  items,
  imageWidth = "100%",
  imageHeight = "180px",
  containerClassName = "",
  onImageClick,
}) => {
  return (
    <div className={containerClassName}>
      <div
        className="flex gap-4 h-auto overflow-x-auto py-2 px-8"
        style={{
          scrollSnapType: "x mandatory",
          justifyContent: items.length > 1 ? "start" : "center",
        }}
      >
        {items.map((it) => (
          <div
            key={it.id ?? it.name}
            className={
              "flex flex-col lg:flex-row min-w-full max-w-full lg:min-w-[900px] lg:max-w-[900px] h-auto bg-white rounded-lg p-4 gap-4 lg:gap-16 webkit-fill-available"
            }
            style={{
              scrollSnapAlign: "center",
            }}
          >
            <img
              src={it.imageUrl}
              alt={it.altText ?? it.name}
              className="h-[300px] lg:h-[500px] object-contain"
              style={{
                width: imageWidth,
                cursor: onImageClick ? "pointer" : "default",
              }}
              loading="lazy"
              onClick={() => {
                // If consumer provided an image click handler, pass the current item
                (onImageClick as any)?.(it);
              }}
            />
            <div className="flex flex-col gap-4 lg:gap-6 lg:px-8 h-auto px-6">
              {it.name && (
                <div className="flex w-full text-[#25384f] justify-center text-center text-3xl font-[IvyModeBold]">
                  {it.name}
                </div>
              )}
              {it.seriesNumber && (
                <div className="flex w-full text-xl text-[#25384F] font-[IvyModeSemiBold] justify-center">
                  {"Book " + it.seriesNumber}
                </div>
              )}
              {it.byLine && (
                <div className="flex w-full text-xl text-[#25384F] font-[IvyModeSemiBold] justify-center">
                  {it.byLine}
                </div>
              )}
              {it.description && (
                <div
                  className="text-[#25384F] font-[athelasbook] text-xl overflow-auto h-[30vh] lg:h-auto"
                  style={{ maxWidth: "100%" }}
                >
                  {it.description}
                </div>
              )}
              <button
                onClick={() => {
                  (onImageClick as any)?.(it);
                }}
                className="mt-auto bg-black text-white px-6 py-3 rounded-full font-large text-2xl flex-end w-[50%] self-center hover:underline hover:cursor-pointer"
              >
                Buy It
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiBookCarousel;
