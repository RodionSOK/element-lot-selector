import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../../lib/cn'
import './Button.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn('button', variant === 'secondary' ? 'button--secondary' : 'button--primary', className)}
      {...props}
    />
  )
}
