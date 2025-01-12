import * as React from 'react';

import { cn } from '@/lib/utils';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'> & { variantSize?: 'sm' | 'md' | 'lg' }>(
  ({ className, type, variantSize = 'md', ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const getSizeClass = (size: string) => {
      switch (size) {
      case 'sm':
        return 'h-8 text-sm';
      case 'lg':
        return 'h-10 text-base';
      default:
        return 'h-9 text-base';
      }
    };

    return (
      <div className='relative w-full'>
        <input
          type={type === 'password' && !showPassword ? 'password' : 'text'}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            className,
            getSizeClass(variantSize)
          )}
          ref={ref}
          {...props}
        />
        {type === 'password' && (
          <button
            type='button'
            onMouseDown={() => setShowPassword(true)}
            onMouseUp={() => setShowPassword(false)}
            onMouseLeave={() => setShowPassword(false)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className='absolute p-1 right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-300'
          >
            {showPassword ?
              <EyeSlashIcon className='size-4' />
              :
              <EyeIcon className='size-4' />
            }
          </button>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
