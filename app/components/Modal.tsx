import { useEffect, useState } from "react";
import type { PurchaseLink } from "../types/db";
import { r2Image } from "~/utils/images";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  purchaseLinks: PurchaseLink[];
  bookTitle?: string;
}

export function Modal({ isOpen, onClose, title, purchaseLinks, bookTitle }: ModalProps) {
  // Group purchase links by media_type and sort within each group by store name
  const groupedLinks: Record<string, PurchaseLink[]> = purchaseLinks.reduce((acc, link) => {
    const key = link.media_type || "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(link);
    return acc;
  }, {} as Record<string, PurchaseLink[]>);
  // sort each group's links by store_name
  Object.values(groupedLinks).forEach((arr) => arr.sort((a, b) => a.store_name.localeCompare(b.store_name)));
  // Ensure a stable, user-friendly tab order for known media types
  const ORDER = ["e-book", "paperback", "audiobook"] as const;
  const allLinks = purchaseLinks.slice().sort((a, b) => a.store_name.localeCompare(b.store_name));
  const hasAll = allLinks.length > 0;
  const tabTypes = hasAll
    ? (['All', ...ORDER.filter((t) => groupedLinks[t]?.length > 0)] as string[])
    : (ORDER.filter((t) => groupedLinks[t]?.length > 0) as string[]);
  const [activeTab, setActiveTab] = useState<string>(tabTypes[0] ?? "");
  const [showLinks, setShowLinks] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => setShowLinks(true), 100);
      return () => {
        clearTimeout(timer);
        setShowLinks(false);
      };
    } else {
      document.body.style.overflow = "unset";
      setShowLinks(false);
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // When the purchase links change, reset the active tab to the first available tab
  useEffect(() => {
    if (tabTypes.length > 0) {
      setActiveTab(tabTypes[0]);
    } else {
      setActiveTab("");
    }
  }, [purchaseLinks]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 h-[70%] opacity-0 translate-y-4"
        style={{
          animation: isOpen ? "modalIn 0.4s ease-out forwards" : undefined,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {title && (
          <h2 className="text-2xl font-semibold text-[#0e2a48] mb-2">{title}</h2>
        )}
        
        {bookTitle && (
          <p className="text-gray-600 mb-6">{bookTitle}</p>
        )}

        <div className="space-y-3 h-[80%] overflow-auto scrollbar-color-grey">
          {tabTypes.length > 0 ? (
            (() => {
              const activeLinksRaw = activeTab === "All" ? allLinks : (groupedLinks[activeTab] ?? []);
              const activeLinks = activeLinksRaw.slice().sort((a, b) => a.store_name.localeCompare(b.store_name));
              return activeLinks.length > 0 ? (
                activeLinks.map((link, index) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all group ${
                    showLinks 
                      ? "opacity-100 translate-y-0" 
                      : "opacity-0 translate-y-4"
                  }`}
                  style={{
                    opacity: showLinks ? 1 : 0,
                    transform: showLinks ? "translateY(0)" : "translateY(16px)",
                    transition: `opacity 0.5s ease-out, transform 0.5s ease-out`,
                    transitionDelay: showLinks ? `${index * 150}ms` : "0ms",
                  }}
                >
                  {link.icon_url ? (
                   <img 
                  src={r2Image(link.icon_url)} 
                  alt={`Icon for ${link.store_name}`}
                  className="w-10 h-10 object-contain"
                  loading="lazy"
                />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 group-hover:text-[#0e2a48] transition-colors">
                      {link.store_name}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      Visit store
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </a>
              ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No purchase links available for {activeTab}
                </div>
              )
            })()
          ) : (
            <div className="text-center py-8 text-gray-500">
              No purchase links available
            </div>
          )}
        </div>
        {/* Tabs header for media_type categories */}
        <div className="mt-2 flex flex-wrap gap-2" aria-label="Purchase links categories">
          {tabTypes.map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`px-3 py-1 rounded-full border border-gray-300 text-sm transition-colors ${activeTab === type
                ? "bg-[#e8f0ff] text-[#0e2a48]"
                : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
