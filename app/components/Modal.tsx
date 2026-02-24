import { useEffect } from "react";
import type { PurchaseLink } from "../types/db";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  purchaseLinks: PurchaseLink[];
  bookTitle?: string;
}

export function Modal({ isOpen, onClose, title, purchaseLinks, bookTitle }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 transform transition-all"
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

        <div className="space-y-3">
          {purchaseLinks.length > 0 ? (
            purchaseLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all group"
              >
                {link.icon_url ? (
                  <img 
                    src={link.icon_url} 
                    alt={link.store_name}
                    className="w-10 h-10 object-contain"
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
              No purchase links available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
