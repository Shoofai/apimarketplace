'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PhoneInputFieldProps {
  value: string;
  onChange: (phone: string) => void;
  defaultCountry?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
  inputClassName?: string;
  /** Optional label (rendered above the input) */
  label?: string;
}

/**
 * Phone input (tel). Value is stored as entered; for E.164 include country code (e.g. +14155551234).
 */
export const PhoneInputField = React.forwardRef<HTMLInputElement | null, PhoneInputFieldProps>(
  (
    {
      value,
      onChange,
      defaultCountry = 'us',
      placeholder = 'Phone number',
      disabled = false,
      required = false,
      id,
      className,
      inputClassName,
      label,
    },
    ref
  ) => {
    const displayValue = (value || '').replace(/^\+\s*/, '');
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.replace(/\D/g, '');
      onChange(v ? `+${v}` : '');
    };

    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        <div className="flex rounded-md border border-input bg-transparent shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <span className="flex h-9 items-center rounded-l-md border-r border-input bg-muted/50 px-3 text-sm text-muted-foreground">
            +
          </span>
          <input
            ref={ref}
            type="tel"
            id={id}
            value={displayValue}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            aria-label={label ?? 'Phone number'}
            className={cn(
              'flex h-9 w-full border-0 bg-transparent px-3 py-1 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50',
              inputClassName
            )}
          />
        </div>
      </div>
    );
  }
);
PhoneInputField.displayName = 'PhoneInputField';
