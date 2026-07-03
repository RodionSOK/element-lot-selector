import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../../lib/cn'
import './Button.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md'
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'button',
        variant === 'secondary' ? 'button--secondary' : 'button--primary',
        size === 'sm' ? 'button--sm' : 'button--md',
        className,
      )}
      {...props}
    />
  )
}
