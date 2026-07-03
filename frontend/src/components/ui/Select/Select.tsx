import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../../lib/cn'
import './Select.css'

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn('select', className)} {...props} />
}
