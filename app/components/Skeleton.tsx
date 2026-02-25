import React from 'react'

type BaseProps = { height?: number; width?: string; label?: string }

export const SkeletonImage: React.FC<BaseProps> = ({ height = 240, width = '100%' }) => {
  return (
    <div
      aria-label={"loading image"}
      style={{ height, width, backgroundColor: '#e5e7eb' }}
      className="rounded animate-pulse"
    />
  )
}

export const SkeletonLine: React.FC<BaseProps> = ({ height = 16, width = '100%' }) => {
  return (
    <div
      style={{ height, width, backgroundColor: '#e5e7eb' }}
      className="rounded animate-pulse"
    />
  )
}

export const SkeletonTextBlock: React.FC<{ lines?: number }> = ({ lines = 2 }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} height={14} width={i % 2 ? '70%' : '100%'} />
      ))}
    </div>
  )
}

export const SkeletonGroup: React.FC<{ items?: number }> = ({ items = 3 }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonLine key={i} height={12} width={i % 2 ? '60%' : '90%'} />
      ))}
    </div>
  )
}

export default function SkeletonStack() {
  // Simple passthrough default for quick usage if needed
  return null
}
