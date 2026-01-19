import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'text-white shadow-md',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800 shadow-md',
  outline: 'bg-transparent border-2 shadow-sm',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200'
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg'
}

const iconSizeStyles: Record<ButtonSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  className = '',
  disabled = false,
  leftIcon,
  rightIcon,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  const flexStyles = (leftIcon || rightIcon) ? 'flex items-center justify-center gap-2' : ''
  const widthStyle = fullWidth ? 'w-full' : ''
  
  const combinedClassName = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${flexStyles}
    ${widthStyle}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  const customStyle = variant === 'primary' 
    ? { 
        backgroundColor: 'var(--color-royal-blue)',
        '--tw-shadow-color': 'var(--color-royal-blue-dark)',
      } as React.CSSProperties & { '--tw-shadow-color': string }
    : variant === 'outline'
    ? {
        borderColor: 'var(--color-royal-blue)',
        color: 'var(--color-royal-blue)',
      } as React.CSSProperties
    : undefined

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'primary' && !disabled) {
      e.currentTarget.style.backgroundColor = 'var(--color-royal-blue-dark)'
    } else if (variant === 'outline' && !disabled) {
      e.currentTarget.style.backgroundColor = 'rgba(0, 71, 171, 0.1)'
    }
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'primary' && !disabled) {
      e.currentTarget.style.backgroundColor = 'var(--color-royal-blue)'
    } else if (variant === 'outline' && !disabled) {
      e.currentTarget.style.backgroundColor = 'transparent'
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'primary' && !disabled) {
      e.currentTarget.style.backgroundColor = 'var(--color-royal-blue-darker)'
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'primary' && !disabled) {
      e.currentTarget.style.backgroundColor = 'var(--color-royal-blue-dark)'
    }
  }

  return (
    <button
      className={combinedClassName}
      style={customStyle}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      {...props}
    >
      {leftIcon && (
        <span className={`inline-flex ${iconSizeStyles[size]}`}>
          {leftIcon}
        </span>
      )}
      {children}
      {rightIcon && (
        <span className={`inline-flex ${iconSizeStyles[size]}`}>
          {rightIcon}
        </span>
      )}
    </button>
  )
}

