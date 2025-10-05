"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { TrendingUp, Users, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface InstitutionalContent {
  id: string
  image: string
  title: string
  subtitle: string
  metric: string
  icon: React.ReactNode
}

const institutionalContent: InstitutionalContent[] = [
  {
    id: 'student-success',
    image: '/bcpmain.jpg', // Original BCP building - perfect for institutional authority
    title: 'Empowering Student Success',
    subtitle: 'Real-time concern management and support',
    metric: '98%',
    icon: <TrendingUp className="w-6 h-6" />
  },
  {
    id: 'streamlined-operations',
    image: '/bcpmain.jpg', // Using BCP building for consistency
    title: 'Streamlined Operations',
    subtitle: 'AI-powered insights and automated workflows',
    metric: '40%',
    icon: <Users className="w-6 h-6" />
  },
  {
    id: 'connected-campus',
    image: '/bcpmain.jpg', // Using BCP building for consistency
    title: 'Connected Campus',
    subtitle: 'Seamless communication across all departments',
    metric: '500+',
    icon: <MessageSquare className="w-6 h-6" />
  }
]

export const InstitutionalCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === institutionalContent.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])


  const currentContent = institutionalContent[currentIndex]

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={currentContent.image}
          alt={currentContent.title}
          fill
          className="object-cover transition-all duration-1000 ease-in-out"
          priority={currentIndex === 0}
        />
        <div className="absolute inset-0 bg-black/50 z-10" />
      </div>

      {/* Content */}
      <div className="relative z-20 flex flex-col justify-between items-start text-white p-16 h-full">
        {/* Top Section - Portal Branding */}
        <div className="flex flex-col space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium tracking-wide uppercase text-white drop-shadow-md">
              StudentLink Portal
            </span>
          </div>
          
          <div className="space-y-4 content-carousel">
            <h1 className="text-5xl institutional-title leading-tight drop-shadow-lg">
              Welcome to
              <br />
                <span className="inline-block">
                  <span className="bg-gradient-to-r from-[#60A5FA] via-[#3B82F6] to-[#1E40AF] bg-clip-text text-transparent drop-shadow-lg font-black tracking-tight">
                    STUDENT
                  </span>
                  <span className="bg-gradient-to-r from-[#F87171] via-[#EF4444] to-[#DC2626] bg-clip-text text-transparent drop-shadow-lg font-black tracking-tight">
                    LINK
                  </span>
                </span>
            </h1>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold institutional-title drop-shadow-lg">
                {currentContent.title}
              </h2>
              <p className="text-lg text-white/90 max-w-md leading-relaxed drop-shadow-md">
                {currentContent.subtitle}
              </p>
              
              {/* Metric Display */}
              <div className="flex items-center space-x-3 mt-4">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm">
                  {currentContent.icon}
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#60A5FA] via-[#3B82F6] to-[#1E40AF] bg-clip-text text-transparent drop-shadow-lg">
                    {currentContent.metric}
                  </div>
                  <div className="text-sm text-white/80 font-medium">
                    {currentContent.id === 'student-success' && 'resolution rate'}
                    {currentContent.id === 'streamlined-operations' && 'efficiency increase'}
                    {currentContent.id === 'connected-campus' && 'daily interactions'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Institution Info */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-white/20 text-white border-white/30 backdrop-blur-sm w-fit drop-shadow-md">
              Bestlink College of the Philippines
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation Controls - Dots Only */}
      <div className="absolute bottom-8 right-8 z-30 flex items-center justify-center">
        {/* Dots Indicator */}
        <div className="flex space-x-2">
          {institutionalContent.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index)
                setIsAutoPlaying(false)
              }}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to content ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Auto-play indicator */}
      <div className="absolute top-8 right-8 z-30">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 ${
            isAutoPlaying 
              ? 'bg-white/20 hover:bg-white/30' 
              : 'bg-white/10 hover:bg-white/20'
          }`}
          aria-label={isAutoPlaying ? 'Pause auto-play' : 'Resume auto-play'}
        >
          <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-white' : 'bg-white/50'}`} />
        </button>
      </div>
    </div>
  )
}
