import type { InputHTMLAttributes } from 'react'
import { cn } from '../../../lib/cn'
import './Input.css'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('input', className)} {...props} />
}
