import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/helpers';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  isDoodle?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, isDoodle = true, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 border-2 border-indigo-700',
      secondary: 'bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-400 border-2 border-slate-200',
      outline: 'bg-transparent text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500 border-2 border-indigo-200',
      ghost: 'hover:bg-slate-100 text-slate-600',
      accent: 'bg-amber-400 text-slate-900 hover:bg-amber-500 focus:ring-amber-400 border-2 border-amber-500',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-base rounded-xl',
      lg: 'px-8 py-4 text-lg rounded-2xl',
    };

    // Doodle effect: Slightly irregular border radius
    const doodleStyle = isDoodle ? { borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' } : {};

    return (
      <button
        ref={ref}
        style={doodleStyle}
        className={cn(
          baseStyles, 
          variants[variant], 
          sizes[size], 
          isDoodle && 'soft-shadow',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;