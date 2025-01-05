import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost'
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className = "", 
  variant = "default", 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none"
  const variantStyles = {
    default: "bg-[#4A1D2C] text-white hover:bg-[#3A1622] px-4 py-2",
    ghost: "text-gray-500 hover:text-gray-900"
  }
  
  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}