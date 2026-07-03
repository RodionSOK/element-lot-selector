import { Link as RouterLink, type LinkProps } from 'react-router-dom'
import { cn } from '../../../lib/cn'
import './Link.css'

export function Link({ className, ...props }: LinkProps) {
  return <RouterLink className={cn('link', className)} {...props} />
}
