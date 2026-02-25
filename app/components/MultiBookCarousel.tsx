import React from 'react'
import type { PurchaseLink } from "../types/db"

type Item = {
  id?: string | number
  imageUrl: string
  title: string
  description?: string
  purchaseLinks?: PurchaseLink[]
}

type Props = {
  items: Item[]
  imageWidth?: string
  imageHeight?: string
  containerClassName?: string
}

// A simple, responsive horizontal carousel-like grid that can show multiple books side-by-side
export const MultiBookCarousel: React.FC<Props> = ({ items, imageWidth = '100%', imageHeight = '180px', containerClassName = '' }) => {
  return (
    <div className={containerClassName}>
      <div className="flex gap-4 h-[100%] overflow-x-auto py-2 px-8" style={{ scrollSnapType: 'x mandatory' }}>
        {items.map((it) => (
          <div key={it.id ?? it.title} className={'flex flex-col w-[33%] h-full bg-white rounded-lg p-4'} style={{ scrollSnapAlign: 'start' }}>
            <img src={it.imageUrl} alt={it.title} style={{ width: imageWidth, maxHeight: "500px", objectFit: 'contain' }} />
            <div className="mt-2 text-sm md:text-base font-semibold">{it.title}</div>
            <div className='flex flex-col gap-4 h-full'>
            {it.title && (
              <div className='flex w-full text-[#25384f] justify-center text-center text-2xl text-[IvyModeBold]'>
                {it.title}
                </div>
            )}
            <div className="flex w-full text-l text-[#25384F] font-[athelasbook] justify-center">
              (Series Placeholder)
              </div>
            {it.description && (
              <div className="text-xs md:text-sm text-[#25384F] font-[athelasbook]" style={{ maxWidth: '100%' }}>
                {it.description}
              </div>
            
            )}
            <button className="mt-auto bg-black text-white px-6 py-3 rounded-full font-large text-2xl flex-end">
              Buy It
            </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MultiBookCarousel
