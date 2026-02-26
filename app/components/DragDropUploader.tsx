import React, { useRef, useState } from "react";

export default function DragDropUploader({
  accept = "image/*",
  onFileSelected,
  onPreviewChange,
  label,
}: {
  accept?: string;
  onFileSelected?: (file: File) => Promise<void> | void;
  onPreviewChange?: (src: string | null) => void;
  label?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => onPreviewChange?.(ev.target?.result as string);
      reader.readAsDataURL(file);
      try {
        setIsUploading(true);
        const result = onFileSelected?.(file);
        if (result && typeof (result as any).then === 'function') {
          await (result as Promise<void>);
        }
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => onPreviewChange?.(ev.target?.result as string);
      reader.readAsDataURL(file);
      try {
        setIsUploading(true);
        const result = onFileSelected?.(file);
        if (result && typeof (result as any).then === 'function') {
          await (result as Promise<void>);
        }
      } finally {
        setIsUploading(false);
      }
    }
  };

  const onClick = () => inputRef.current?.click();
  const wrapperClass = `relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`;

  return (
    <div className="space-y-2" style={{ position: 'relative' }}>
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={onClick}
        className={wrapperClass}
      >
        <div style={{ position: 'absolute', inset: 0, display: isUploading ? 'flex' : 'none', background: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
          <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
            <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div className="space-y-2">
          <div className="text-4xl">📎</div>
          <p className="text-sm text-gray-600">Drag and drop a file here, or click to select</p>
          <p className="text-xs text-gray-400">Accepts images (PNG, JPG, WebP)</p>
        </div>
      </div>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFileChange} />
    </div>
  );
}
