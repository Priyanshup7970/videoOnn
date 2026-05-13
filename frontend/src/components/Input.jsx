import React, { useId } from 'react';

export const Input = React.forwardRef(
  ({ label, className = '', ...props }, ref) => {
    const id = useId();
    
    return (
      <div className={`w-full ${className}`}>
        {label && <label htmlFor={id} className="block text-sm font-medium text-zinc-300 mb-1.5">{label}</label>}
        <input 
          id={id}
          className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
          ref={ref}
          {...props} 
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
