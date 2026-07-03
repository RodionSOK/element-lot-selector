import type { HTMLAttributes } from 'react'
import { cn } from '../../../lib/cn'
import './Badge.css'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'success' | 'warning' | 'neutral'
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return <span className={cn('badge', `badge--${tone}`, className)} {...props} />
}
