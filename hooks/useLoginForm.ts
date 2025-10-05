import React, { useState, useEffect, useRef } from 'react'

interface UseLoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>
  loading: boolean
}

interface UseLoginFormReturn {
  email: string
  password: string
  error: string
  showPassword: boolean
  rememberMe: boolean
  isSecure: boolean
  focusedField: string | null
  emailValid: boolean | null
  passwordValid: boolean | null
  emailRef: React.RefObject<HTMLInputElement>
  passwordRef: React.RefObject<HTMLInputElement>
  setEmail: (email: string) => void
  setPassword: (password: string) => void
  setError: (error: string) => void
  setShowPassword: (show: boolean) => void
  setRememberMe: (remember: boolean) => void
  setFocusedField: (field: string | null) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  handleKeyDown: (e: React.KeyboardEvent, nextRef?: React.RefObject<HTMLInputElement>) => void
  handleEmailChange: (email: string) => void
  handlePasswordChange: (password: string) => void
  getErrorMessage: (error: any) => string
}

export function useLoginForm({ onLogin, loading }: UseLoginFormProps): UseLoginFormReturn {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isSecure, setIsSecure] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [emailValid, setEmailValid] = useState<boolean | null>(null)
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  // Check for secure connection and initialize smart defaults
  useEffect(() => {
    setIsSecure(window.location.protocol === 'https:')
    
    // Smart defaults: Check for remembered email
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

  // Auto-focus email field on mount
  useEffect(() => {
    if (emailRef.current) {
      emailRef.current.focus()
    }
  }, [])

  // Enhanced error handling with specific guidance
  const getErrorMessage = (error: any): string => {
    if (error?.message?.includes('email')) {
      return "Email address not found. Please check your email or contact support if you need help."
    }
    if (error?.message?.includes('password')) {
      return "Incorrect password. Please try again or use 'Need help logging in?' below."
    }
    if (error?.message?.includes('network')) {
      return "Connection issue. Please check your internet connection and try again."
    }
    return "Unable to sign in. Please check your credentials or contact support for assistance."
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Basic validation with helpful feedback
    if (!email.trim()) {
      setError("Please enter your email address.")
      emailRef.current?.focus()
      return
    }
    
    if (!password.trim()) {
      setError("Please enter your password.")
      passwordRef.current?.focus()
      return
    }

    try {
      await onLogin(email, password)
      
      // Remember email if requested
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  // Real-time validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string): boolean => {
    return password.length >= 6
  }

  // Handle email change with validation
  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail)
    if (newEmail.length > 0) {
      setEmailValid(validateEmail(newEmail))
    } else {
      setEmailValid(null)
    }
  }

  // Handle password change with validation
  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword)
    if (newPassword.length > 0) {
      setPasswordValid(validatePassword(newPassword))
    } else {
      setPasswordValid(null)
    }
  }

  // Keyboard navigation enhancement
  const handleKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<HTMLInputElement>) => {
    if (e.key === 'Enter' && nextRef?.current) {
      e.preventDefault()
      nextRef.current.focus()
    }
  }

  return {
    email,
    password,
    error,
    showPassword,
    rememberMe,
    isSecure,
    focusedField,
    emailValid,
    passwordValid,
    emailRef,
    passwordRef,
    setEmail,
    setPassword,
    setError,
    setShowPassword,
    setRememberMe,
    setFocusedField,
    handleSubmit,
    handleKeyDown,
    handleEmailChange,
    handlePasswordChange,
    getErrorMessage
  }
}
