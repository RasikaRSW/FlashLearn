import { forwardRef, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/helpers';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, label, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-bold text-slate-700 mb-2 ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              'appearance-none w-full px-4 py-3 bg-white border-2 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 font-medium transition-all',
              error ? 'border-red-400' : 'border-slate-200',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-500 pointer-events-none" />
        </div>
        {error && <p className="mt-2 text-sm text-red-500 font-medium ml-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;