'use client'

import { Star } from 'lucide-react'
import clsx from 'clsx'

interface StarRatingProps {
  value: number | null
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md'
}

export default function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={clsx(
            'transition-colors',
            !readonly && 'hover:scale-110 transition-transform cursor-pointer',
            readonly && 'cursor-default'
          )}
        >
          <Star
            className={clsx(
              iconSize,
              value !== null && star <= (value ?? 0)
                ? 'fill-accent text-accent'
                : 'text-border fill-transparent'
            )}
          />
        </button>
      ))}
    </div>
  )
}
