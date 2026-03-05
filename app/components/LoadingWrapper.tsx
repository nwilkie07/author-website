import React from "react";
import { SkeletonImage, SkeletonLine, SkeletonTextBlock } from "./Skeleton";
import { useScreenSize } from "~/hooks/useScreenSize";

type LoadingWrapperProps = {
  variant?: "card" | "grid" | "section" | "text" | "carousel";
  skeletonCount?: number;
  className?: string;
};

/**
 * Pure skeleton fallback — renders skeleton UI with no logic.
 * Intended to be used as the `fallback` prop of a <Suspense> boundary.
 *
 * Before:
 *   <LoadingWrapper isLoading={isLoading} variant="grid" skeletonCount={3}>
 *     <MyContent />
 *   </LoadingWrapper>
 *
 * After:
 *   <Suspense fallback={<LoadingWrapper variant="grid" skeletonCount={3} />}>
 *     <Await resolve={dataPromise}>
 *       {(data) => <MyContent data={data} />}
 *     </Await>
 *   </Suspense>
 */
export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  variant = "section",
  skeletonCount = 3,
  className = "",
}) => {
  const { isDesktop } = useScreenSize();
  switch (variant) {
    case "grid":
      return (
        <div className={className + " grid grid-cols-1 gap-6"}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded shadow p-4 flex flex-col items-center gap-4"
            >
              <SkeletonImage height={180} width="100%" />
              <SkeletonLine height={14} width="60%" />
              <SkeletonLine height={12} width="80%" />
            </div>
          ))}
        </div>
      );
    case "carousel":
      return (
        <div className={className + "flex w-full justify-center py-8"}>
          <div className="flex gap-4 h-auto overflow-x-auto py-2 px-8 w-[80%] justify-center">
            <div
              className={
                "flex flex-col min-w-full max-w-full lg:flex-row lg:min-w-[900px] lg:max-w-[900px] h-auto bg-white rounded-lg p-4 gap-4 lg:gap-16 webkit-fill-available"
              }
              style={{
                scrollSnapAlign: "start",
              }}
            >
              <div className="flex justify-center grow-1 pl-8 pb-8">
                <SkeletonImage
                  height={isDesktop ? 500 : 300}
                  width={isDesktop ? "300px" : "200px"}
                />
              </div>
              <div className="flex flex-col gap-4 lg:m-4 h-auto px-6 grow-3">
                <div className="flex w-full justify-center">
                  <SkeletonLine height={20} width="80%" />
                </div>
                <div className="flex w-full justify-center">
                  <SkeletonLine height={14} width="60%" />
                </div>
                <div className="flex w-full justify-center">
                  <SkeletonLine height={14} width="60%" />
                </div>
                <div
                  className="h-[30vh] lg:h-auto"
                  style={{ maxWidth: "100%" }}
                >
                  <SkeletonTextBlock lines={8} />
                </div>
                <button className="mt-auto bg-black px-6 py-3 rounded-full flex-end w-[50%] h-[50px] self-center rounded animate-pulse"></button>
              </div>
            </div>
          </div>
        </div>
      );
    case "card":
    case "section":
    case "text":
      return (
        <div className={className + " flex grow-1"}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded shadow p-4 flex flex-col items-center gap-4 grow-1 m-12"
            >
              <SkeletonLine height={20} width="80%" />
              <SkeletonTextBlock lines={8} />
            </div>
          ))}
        </div>
      );
    default:
      return (
        <div className={className + " space-y-4"}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i} className="space-y-2">
              <SkeletonLine height={16} width={i % 2 ? "60%" : "100%"} />
              <SkeletonLine height={12} width={i % 3 === 0 ? "80%" : "50%"} />
            </div>
          ))}
        </div>
      );
  }
};

export default LoadingWrapper;
