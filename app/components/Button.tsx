export const Button = ({ 
  children, 
  className = "", 
  variant = "default", 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'default' | 'ghost' 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
  const variantStyles = {
    default: "bg-[#4A1D2C] text-white hover:bg-[#3A1622] px-4 py-2",
    ghost: "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
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