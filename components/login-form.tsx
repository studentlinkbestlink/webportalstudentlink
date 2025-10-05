"use client"

import type React from "react"
import { memo, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Mail, Lock, Eye, EyeOff, GraduationCap, Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Image from "next/image"
import { useLoginForm } from "@/hooks/useLoginForm"
import { InstitutionalCarousel } from "./institutional-carousel"

interface LoginFormProps {
  className?: string
}

// Memoized components for performance optimization
const TrustIndicators = memo(({ isSecure }: { isSecure: boolean }) => (
  <div className="flex items-center justify-center mb-2">
    <div className="flex items-center space-x-1 login-form-secure-text">
      <Lock className="w-3 h-3 text-green-600" />
      <span>Secure</span>
    </div>
  </div>
))


export const LoginForm = memo(function LoginForm({ className }: LoginFormProps) {
  const { login, loading } = useAuth()
  
  const {
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
    handlePasswordChange
  } = useLoginForm({ onLogin: login, loading })

  // Memoized event handlers for performance
  const handleEmailInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleEmailChange(e.target.value)
  }, [handleEmailChange])

  const handlePasswordInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handlePasswordChange(e.target.value)
  }, [handlePasswordChange])

  const handleRememberMeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked)
  }, [setRememberMe])

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(!showPassword)
  }, [showPassword, setShowPassword])

  return (
    <div className="login-container">
      {/* Left Side - Dynamic Institutional Carousel */}
      <div className="login-image-panel login-image-container">
        <InstitutionalCarousel />
      </div>

      {/* Right Side - Login Form (Responsive) */}
      <div className="login-form-panel bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="login-form-content space-y-2 max-h-[90vh] overflow-y-auto">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-xl border border-gray-100">
                <Image
                  src="/studentlinklogo.png"
                  alt="Bestlink College of the Philippines Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
            <h2 className="text-2xl institutional-title text-[#1E2A78]">
              <span className="bg-gradient-to-r from-[#60A5FA] via-[#3B82F6] to-[#1E40AF] bg-clip-text text-transparent font-black tracking-tight">STUDENT</span>
              <span className="bg-gradient-to-r from-[#F87171] via-[#EF4444] to-[#DC2626] bg-clip-text text-transparent font-black tracking-tight">LINK</span> Portal
            </h2>
            <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>Bestlink College of the Philippines</p>
          </div>

          {/* Login Card */}
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm relative overflow-hidden w-full">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#1E2A78]/5 to-[#2480EA]/5 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#DFD10F]/10 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
            
            <CardHeader className="login-form-header text-center px-6 lg:px-8 relative z-10">
              {/* Enhanced Logo Design - Much Larger */}
              <div className="flex justify-center mb-3">
                <Image
                  src="/studentlinklogo.png"
                  alt="Bestlink College of the Philippines Logo"
                  width={80}
                  height={80}
                  className="object-contain login-logo-enhanced"
                />
              </div>
              
              {/* Better Positioned Title */}
              <CardTitle className="login-form-title">Sign In</CardTitle>
          </CardHeader>
            <CardContent className="login-form-content-compact px-6 lg:px-8 relative z-10">
              {/* Trust Indicators */}
              <TrustIndicators isSecure={isSecure} />

                <form onSubmit={handleSubmit} className="space-y-2" role="form" aria-label="Sign in form" noValidate>
                <div className="space-y-1">
                  <Label 
                    htmlFor="email" 
                    className="login-form-label"
                  >
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail 
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1E2A78] transition-colors" 
                      aria-hidden="true"
                    />
                <Input
                      ref={emailRef}
                  id="email"
                  type="email"
                  value={email}
                      onChange={handleEmailInputChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      onKeyDown={(e) => handleKeyDown(e, passwordRef)}
                      placeholder="Enter your email address"
                      className={`pl-12 pr-10 h-12 rounded-xl border-gray-200 focus:border-[#1E2A78] focus:ring-[#1E2A78]/20 transition-all duration-300 login-form-input bg-gray-50/50 focus:bg-white ${
                        emailValid === true ? 'border-green-300 bg-green-50/30' : 
                        emailValid === false ? 'border-red-300 bg-red-50/30' : ''
                      }`}
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      aria-describedby={error ? "error-message" : emailValid === false ? "email-error" : undefined}
                      aria-invalid={emailValid === false ? "true" : "false"}
                  required
                />
                    {emailValid === true && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
                    )}
                    {emailValid === false && (
                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-600" />
                    )}
                  </div>
                  {emailValid === false && (
                    <p id="email-error" className="login-form-error-text mt-1">
                      Please enter a valid email address
                    </p>
                  )}
              </div>
                
                <div className="space-y-1">
                  <Label 
                    htmlFor="password" 
                    className="login-form-label"
                  >
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock 
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1E2A78] transition-colors" 
                      aria-hidden="true"
                    />
                <Input
                      ref={passwordRef}
                  id="password"
                      type={showPassword ? "text" : "password"}
                  value={password}
                      onChange={handlePasswordInputChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                  placeholder="Enter your password"
                      className={`pl-12 pr-12 h-12 rounded-xl border-gray-200 focus:border-[#1E2A78] focus:ring-[#1E2A78]/20 transition-all duration-300 login-form-input bg-gray-50/50 focus:bg-white ${
                        passwordValid === true ? 'border-green-300 bg-green-50/30' : 
                        passwordValid === false ? 'border-red-300 bg-red-50/30' : ''
                      }`}
                      autoComplete="current-password"
                      aria-describedby={error ? "error-message" : passwordValid === false ? "password-error" : undefined}
                      aria-invalid={passwordValid === false ? "true" : "false"}
                  required
                />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#1E2A78] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1E2A78]/20 rounded"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={0}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordValid === false && (
                    <p id="password-error" className="login-form-error-text mt-1">
                      Password must be at least 6 characters
                    </p>
                  )}
                </div>

                  {/* Remember Me Option */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={handleRememberMeChange}
                        className="w-4 h-4 text-[#1E2A78] border-gray-300 rounded focus:ring-[#1E2A78]/20"
                      />
                      <Label 
                        htmlFor="rememberMe" 
                        className="login-form-help-text cursor-pointer"
                      >
                        Remember my email
                      </Label>
                    </div>
                    {rememberMe && email && (
                      <button
                        type="button"
                        onClick={() => {
                          setEmail("")
                          setRememberMe(false)
                          localStorage.removeItem('rememberedEmail')
                        }}
                        className="login-form-help-text text-[#1E2A78] hover:text-[#2480EA] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1E2A78]/20 rounded px-2 py-1"
                      >
                        Clear
                      </button>
                    )}
              </div>

                {/* Enhanced Error Display */}
              {error && (
                  <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm" role="alert">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <AlertDescription 
                      id="error-message" 
                      className="login-form-error-text text-red-800"
                    >
                      {error}
                    </AlertDescription>
                </Alert>
              )}

                  <Button 
                    type="submit" 
                    className={`w-full h-12 professional-button text-white login-form-button rounded-xl focus:outline-none group ${
                      loading ? 'loading' : ''
                    }`}
                    disabled={loading || (emailValid === false || passwordValid === false)}
                    aria-describedby={loading ? "loading-message" : undefined}
                    aria-label={loading ? "Signing in, please wait" : "Sign in to your account"}
                  >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2" id="loading-message">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Sign In</span>
                      <svg 
                        className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
              </Button>

                {/* Help Section */}
                <div className="text-center border-t border-gray-100 pt-2">
                  <p className="login-form-help-text mb-1">
                    Need help logging in?
                  </p>
                  <div className="flex justify-center space-x-4 text-xs">
                    <button 
                      type="button"
                      className="login-form-help-text text-[#1E2A78] hover:text-[#2480EA] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1E2A78]/20 rounded px-2 py-1"
                    >
                      Forgot Password?
                    </button>
                    <span className="text-gray-300">•</span>
                    <button 
                      type="button"
                      className="login-form-help-text text-[#1E2A78] hover:text-[#2480EA] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1E2A78]/20 rounded px-2 py-1"
                    >
                      Contact Support
                    </button>
                  </div>
                </div>
            </form>

              {/* Footer */}
              <div className="mt-1 pt-2 border-t border-gray-100 text-center">
                <p className="login-form-help-text">
                  © 2025 Bestlink College of the Philippines. All rights reserved.
                </p>
              </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
})
