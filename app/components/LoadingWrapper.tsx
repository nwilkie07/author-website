import React from 'react'
import { SkeletonImage, SkeletonLine } from './Skeleton'

type LoadingWrapperProps = {
  isLoading: boolean
  variant?: 'card' | 'grid' | 'section'
  skeletonCount?: number
  className?: string
  children?: React.ReactNode
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  isLoading,
  variant = 'section',
  skeletonCount = 3,
  className = '',
  children,
}) => {
  if (!isLoading) {
    return <>{children}</>
  }

  switch (variant) {
    case 'grid':
      return (
        <div className={className + ' grid grid-cols-1 md:grid-cols-3 gap-6'}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i} className="bg-white rounded shadow p-4 flex flex-col items-center gap-4">
              <SkeletonImage height={180} width="100%" />
              <SkeletonLine height={14} width="60%" />
              <SkeletonLine height={12} width="80%" />
            </div>
          ))}
        </div>
      )
    case 'card':
    case 'section':
    default:
      // Generic vertical skeleton list
      return (
        <div className={className + ' space-y-4'}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i} className="space-y-2">
              <SkeletonLine height={16} width={i % 2 ? '60%' : '100%'} />
              <SkeletonLine height={12} width={i % 3 === 0 ? '80%' : '50%'} />
            </div>
          ))}
        </div>
      )
  }
}

export default LoadingWrapper
