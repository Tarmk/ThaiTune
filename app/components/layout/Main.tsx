"use client"

import Link from "next/link"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MusicIcon, Code, Headphones, ArrowRight, Sparkles, Music, Play, Volume2, Zap, Star } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { useAuth } from "@/app/providers/auth-provider"

export default function Main() {
  const { t, ready } = useTranslation("common")
  const [isClient, setIsClient] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number; opacity: number }>>([])
  const { theme } = useTheme()
  const { user } = useAuth()

  // Set isClient to true on component mount
  useEffect(() => {
    setIsClient(true)
    // Staggered entrance animations
    setTimeout(() => setIsVisible(true), 200)
    
    // Generate animated particles
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.1
    }))
    setParticles(newParticles)
  }, [])

  // Enhanced mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: (particle.y + particle.speed * 0.1) % 100,
        x: particle.x + Math.sin(Date.now() * 0.001 + particle.id) * 0.1
      })))
    }, 50)
    
    return () => clearInterval(interval)
  }, [])

  // Theme colors
  const maroonColor = "#4A1D2C"
  const maroonLighter = "#6A2D3C"
  const maroonLightest = "#F8F1F3"
  const maroonDark = "#8A3D4C"

  // Show loading placeholder when translations aren't ready
  if (!ready || !isClient) {
    return (
      <main className="flex-1 pt-16 dark:bg-[#1a1f2c]">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="h-[600px] flex items-center justify-center">
            <div className="animate-pulse">
              <div className="h-12 w-96 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-6 w-72 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 min-h-screen bg-gray-50 dark:bg-[#1a1f2c] pt-16 overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient Orbs with enhanced animations */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-[#4A1D2C]/15 via-[#8A3D4C]/10 to-[#6A2D3C]/15 rounded-full blur-3xl animate-pulse"
          style={{
            top: `${20 + scrollY * 0.1}px`,
            left: `${10 + mousePosition.x * 0.02}px`,
            animationDuration: '4s',
            transform: `scale(${1 + Math.sin(Date.now() * 0.001) * 0.1})`
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] bg-gradient-to-r from-[#8A3D4C]/8 via-[#4A1D2C]/5 to-[#6A2D3C]/8 rounded-full blur-3xl animate-pulse"
          style={{
            top: `${160 - scrollY * 0.05}px`,
            right: `${80 - mousePosition.x * 0.015}px`,
            animationDelay: '1s',
            animationDuration: '6s',
            transform: `scale(${1 + Math.sin(Date.now() * 0.0008) * 0.15})`
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-gradient-to-r from-[#6A2D3C]/12 via-[#4A1D2C]/8 to-[#8A3D4C]/12 rounded-full blur-3xl animate-pulse"
          style={{
            bottom: `${160 + scrollY * 0.08}px`,
            left: `${30 + mousePosition.y * 0.01}%`,
            animationDelay: '2s',
            animationDuration: '5s',
            transform: `scale(${1 + Math.sin(Date.now() * 0.0012) * 0.08})`
          }}
        />
        
        {/* Floating Musical Elements with enhanced motion */}
        <div 
          className="absolute animate-bounce delay-300"
          style={{
            top: `${128 + Math.sin(Date.now() * 0.002) * 20}px`,
            left: `${80 + mousePosition.x * 0.01}px`,
            animationDuration: '3s'
          }}
        >
          <Music className="h-8 w-8 text-[#4A1D2C]/40 dark:text-[#8A3D4C]/60 animate-pulse" />
        </div>
        <div 
          className="absolute animate-bounce delay-700"
          style={{
            top: `${240 + Math.sin(Date.now() * 0.0015) * 15}px`,
            right: `${128 + mousePosition.y * 0.008}px`,
            animationDuration: '2.5s'
          }}
        >
          <Volume2 className="h-6 w-6 text-[#8A3D4C]/40 dark:text-[#4A1D2C]/60 animate-pulse" />
        </div>
        <div 
          className="absolute animate-bounce delay-1000"
          style={{
            bottom: `${320 + Math.sin(Date.now() * 0.0018) * 25}px`,
            left: `${25 + mousePosition.x * 0.005}%`,
            animationDuration: '2.8s'
          }}
        >
          <Play className="h-5 w-5 text-[#6A2D3C]/40 dark:text-[#8A3D4C]/60 animate-pulse" />
        </div>
        <div 
          className="absolute animate-bounce delay-1500"
          style={{
            top: `${384 + Math.sin(Date.now() * 0.0022) * 18}px`,
            right: `${25 + mousePosition.y * 0.006}%`,
            animationDuration: '3.2s'
          }}
        >
          <Sparkles className="h-9 w-9 text-[#4A1D2C]/30 dark:text-[#8A3D4C]/50 animate-pulse" />
        </div>
        
        {/* Animated Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-[#4A1D2C]/30 dark:bg-[#8A3D4C]/40 rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animationDelay: `${particle.id * 0.2}s`,
              animationDuration: `${2 + particle.id * 0.1}s`
            }}
          />
        ))}
        
        {/* Twinkling Stars with enhanced effects */}
        {[...Array(12)].map((_, i) => (
          <div 
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${1.5 + Math.random() * 2}s`,
              transform: `scale(${0.5 + Math.random() * 0.5}) rotate(${Math.random() * 360}deg)`
            }}
          >
            <Star className="h-2 w-2 text-[#4A1D2C]/25 dark:text-[#8A3D4C]/35 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
        ))}
      </div>

      {/* Hero Section with Enhanced Animations */}
      <div className="w-full py-24 relative">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-r from-[#4A1D2C] to-[#8A3D4C] rounded-full animate-ping"></div>
                  <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-r from-[#4A1D2C] to-[#8A3D4C] rounded-full animate-pulse"></div>
                  <h1 className={`text-5xl font-bold tracking-tight text-gray-900 dark:text-white lg:text-6xl/none leading-tight bg-gradient-to-r from-[#4A1D2C] via-[#8A3D4C] to-[#4A1D2C] dark:from-[#8A3D4C] dark:via-[#af5169] dark:to-[#8A3D4C] bg-clip-text text-transparent animate-gradient transform transition-all duration-1000 ${
                    isVisible ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-20 opacity-0 scale-95'
                  }`}>
                    {t("learnTitle")}
                  </h1>
                </div>
                <p className={`text-xl text-gray-500 dark:text-gray-300 max-w-[600px] transform transition-all duration-1000 delay-300 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}>
                  {t("description")}
                </p>
              </div>
              <div className={`flex flex-col sm:flex-row gap-4 transform transition-all duration-1000 delay-500 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
              }`}>
                {!user && (
                  <Link href="/signup">
                    <Button 
                      className="text-base px-8 py-4 shadow-xl transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-[#4A1D2C]/30 bg-gradient-to-r from-[#4A1D2C] to-[#8A3D4C] hover:from-[#3A1520] hover:to-[#6A2D3C] dark:from-[#8A3D4C] dark:to-[#af5169] text-white relative overflow-hidden group transform hover:rotate-1"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></span>
                      <span className="relative z-10 flex items-center">
                        {t("getStarted")}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-110" />
                      </span>
                    </Button>
                  </Link>
                )}
                <Link href="/community">
                  <Button 
                    variant="outline" 
                    className="text-base px-8 py-4 border-2 border-[#4A1D2C] text-[#4A1D2C] dark:border-[#8A3D4C] dark:text-gray-200 hover:bg-[#4A1D2C] hover:text-white dark:hover:bg-[#8A3D4C] transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-[#4A1D2C]/20 relative overflow-hidden group hover:-rotate-1"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-[#4A1D2C]/0 via-[#4A1D2C]/20 to-[#4A1D2C]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></span>
                    <span className="relative z-10 transition-all duration-300 group-hover:scale-105">{t("exploreCommunity")}</span>
                  </Button>
                </Link>
              </div>
            </div>
            <div className={`flex items-center justify-center transform transition-all duration-1000 delay-700 ${
              isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-20 opacity-0 scale-95'
            }`}>
              <div 
                className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-105 hover:shadow-[#4A1D2C]/20 group"
                style={{
                  transform: isClient ? `perspective(1000px) rotateY(${(mousePosition.x - (typeof window !== 'undefined' ? window.innerWidth : 0)/2) * 0.015}deg) rotateX(${(mousePosition.y - (typeof window !== 'undefined' ? window.innerHeight : 0)/2) * -0.015}deg)` : 'none'
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-[#4A1D2C] via-[#8A3D4C] to-[#4A1D2C] flex items-center justify-center p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 via-transparent to-white/5 animate-pulse"></div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl w-full h-full flex items-center justify-center relative group-hover:bg-white/15 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1500"></div>
                    <MusicIcon className="h-32 w-32 text-white animate-pulse group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
                    <div className="absolute top-4 right-4 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                    <div className="absolute top-4 right-4 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-4 left-4 w-3 h-3 bg-yellow-400 rounded-full animate-pulse delay-500"></div>
                    <div className="absolute top-8 left-8 w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-1000"></div>
                    <div className="absolute bottom-8 right-8 w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-1500"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section with Enhanced Animations */}
      <div className="w-full py-24 bg-white dark:bg-[#232838] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#4A1D2C]/5 via-transparent to-[#8A3D4C]/5 dark:from-[#8A3D4C]/8 dark:to-[#4A1D2C]/8"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-[#4A1D2C]/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-r from-[#8A3D4C]/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container px-4 md:px-6 max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl mb-4 dark:text-white bg-gradient-to-r from-[#4A1D2C] via-[#8A3D4C] to-[#4A1D2C] dark:from-[#8A3D4C] dark:via-[#af5169] dark:to-[#8A3D4C] bg-clip-text text-transparent animate-gradient transform transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'
            }`}>
              {t("widenRepertoire")}
            </h2>
            <p className={`text-xl text-gray-500 dark:text-gray-300 max-w-3xl mx-auto transform transition-all duration-1000 delay-200 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              {t("uploadDescription")}
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: <MusicIcon className="h-8 w-8" />, title: t("feature1Title"), description: t("feature1Desc") },
              { icon: <Code className="h-8 w-8" />, title: t("feature2Title"), description: t("feature2Desc") },
              { icon: <Headphones className="h-8 w-8" />, title: t("feature3Title"), description: t("feature3Desc") }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className={`border-0 shadow-lg overflow-hidden dark:bg-[#2a3349] dark:border-none transition-all duration-700 hover:shadow-2xl hover:shadow-[#4A1D2C]/20 hover:scale-105 hover:-translate-y-3 cursor-pointer group transform ${
                  isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95'
                }`}
                style={{ 
                  animationDelay: `${600 + index * 150}ms`,
                  transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div className="h-1 bg-gradient-to-r from-[#4A1D2C] to-[#8A3D4C] dark:from-[#8A3D4C] dark:to-[#af5169] group-hover:h-3 transition-all duration-500"></div>
                <CardContent className="p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#4A1D2C]/8 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1500"></div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-r from-[#4A1D2C]/10 to-transparent rounded-full blur-xl"></div>
                  </div>
                  <div 
                    className="rounded-full p-3 mb-5 inline-block transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:shadow-lg" 
                    style={{ 
                      backgroundColor: theme === 'dark' ? 'rgba(138, 61, 76, 0.2)' : maroonLightest,
                    }}
                  >
                    <div style={{ color: theme === 'dark' ? '#e5a3b4' : maroonColor }} className="transition-all duration-500 group-hover:scale-110">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 dark:text-white group-hover:text-[#4A1D2C] dark:group-hover:text-[#e5a3b4] transition-all duration-500 group-hover:scale-105">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-300 transition-all duration-500 group-hover:text-gray-700 dark:group-hover:text-gray-200">
                    {feature.description}
                  </p>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <Zap className="h-5 w-5 text-[#4A1D2C] dark:text-[#e5a3b4] animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {/* Editor Preview Section with Enhanced Animations */}
      <div className="w-full py-24 bg-gray-50 dark:bg-[#1a1f2c] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#4A1D2C]/8 via-transparent to-[#8A3D4C]/8 dark:from-[#8A3D4C]/15 dark:to-[#4A1D2C]/15"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-[#4A1D2C]/30 to-transparent rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[#8A3D4C]/30 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
        </div>
        
        <div className="container px-4 md:px-6 max-w-7xl mx-auto relative">
          <div className="space-y-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl mb-4 dark:text-white bg-gradient-to-r from-[#4A1D2C] via-[#8A3D4C] to-[#4A1D2C] dark:from-[#8A3D4C] dark:via-[#af5169] dark:to-[#8A3D4C] bg-clip-text text-transparent animate-gradient transform transition-all duration-1000 ${
                isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'
              }`}>
                {t("advancedEditor")}
              </h2>
              <p className={`text-xl text-gray-500 dark:text-gray-300 transform transition-all duration-1000 delay-200 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                {t("editorDescription")}
              </p>
            </div>
            <div 
              className={`relative rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-[#2a3349] aspect-[2/1] transition-all duration-700 hover:shadow-3xl hover:shadow-[#4A1D2C]/20 hover:scale-105 group transform ${
                isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95'
              }`}
              style={{ 
                animationDelay: '800ms',
                transform: isClient ? `perspective(1000px) rotateY(${(mousePosition.x - (typeof window !== 'undefined' ? window.innerWidth : 0)/2) * 0.008}deg) rotateX(${(mousePosition.y - (typeof window !== 'undefined' ? window.innerHeight : 0)/2) * -0.008}deg)` : 'none'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#4A1D2C]/8 to-[#8A3D4C]/8 dark:from-[#8A3D4C]/15 dark:to-[#af5169]/15"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1500"></div>
              <div className="w-full h-full relative overflow-hidden">
                <Image
                  src="/images/music-editor-preview.png"
                  alt="Music Score Editor Interface"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              {/* Enhanced Floating UI Elements */}
              <div className="absolute top-4 right-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-6 group-hover:translate-x-0 shadow-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Live Preview</span>
                </div>
              </div>
              
              <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-6 group-hover:translate-y-0 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-[#4A1D2C]/10 dark:bg-[#8A3D4C]/20 rounded-full">
                    <Play className="h-5 w-5 text-[#4A1D2C] dark:text-[#8A3D4C]" />
                  </div>
                  <div className="flex gap-1">
                    {[...Array(8)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-1 bg-[#4A1D2C] dark:bg-[#8A3D4C] rounded-full animate-pulse transition-all duration-300"
                        style={{ 
                          height: `${12 + Math.random() * 8}px`,
                          animationDelay: `${i * 100}ms`,
                          animationDuration: `${1 + Math.random() * 0.5}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
                <div className="w-16 h-16 border-2 border-white/30 rounded-full flex items-center justify-center animate-spin">
                  <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes gradient {
          0%, 100% { 
            background-position: 0% 50%;
            background-size: 200% 200%;
          }
          50% { 
            background-position: 100% 50%;
            background-size: 200% 200%;
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(74, 29, 44, 0.3); }
          50% { box-shadow: 0 0 40px rgba(138, 61, 76, 0.5); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 4s ease infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        .hover\\:shadow-3xl:hover {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.35);
        }
        .group:hover .animate-bounce {
          animation-duration: 0.8s;
        }
      `}</style>
    </main>
  )
}
