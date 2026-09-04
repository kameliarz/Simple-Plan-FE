import React from 'react';

export type ButtonVariant = 'default' | 'outline' | 'ghost' | 'secondary';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
  default: 'bg-blue-900 text-white hover:bg-blue-800 shadow-sm',
  outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center font-medium rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;