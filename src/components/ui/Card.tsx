import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/helpers';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'interactive' | 'doodle';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border-2 border-slate-200',
      hover: 'bg-white border-2 border-slate-200 hover:border-indigo-300 transition-colors',
      interactive: 'bg-white border-2 border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer',
      doodle: 'bg-white border-2 border-slate-800 soft-shadow', // The main style
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl overflow-hidden', 
          variants[variant], 
          className
        )}
        style={{ borderRadius: '20px' }} // Slightly rounder standard
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pb-2', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export default Card;