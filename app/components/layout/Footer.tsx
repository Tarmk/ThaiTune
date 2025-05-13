"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Github, Linkedin, Youtube, MusicIcon } from "lucide-react"
import { Logo } from "../common/Logo"
import { useTheme } from "next-themes"

export default function Footer() {
  // Theme colors
  const maroonColor = "#4A1D2C"
  const maroonLighter = "#6A2D3C"
  const maroonLightest = "#F8F1F3"
  const maroonDark = "#8A3D4C"
  const { theme } = useTheme()

  return (
    <footer className="bg-white dark:bg-[#232838] pt-16 pb-12 border-t border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Logo and description section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-12">
          <div className="mb-8 md:mb-0 md:max-w-xs">
            <Logo size="lg" withText={true} variant="primary" borderRadius="rounded-lg" />
            <p className="mt-4 text-gray-500 dark:text-gray-300 text-sm">
              ThaiTune helps musicians learn, create, and share traditional Thai music with a modern platform 
              designed to preserve cultural heritage.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 xl:gap-12">
            <div>
              <h3 
                className="text-base font-bold mb-4 dark:text-[#e5a3b4]" 
                style={{ color: theme === 'dark' ? undefined : maroonColor }}
              >
                ThaiTune
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors dark:text-gray-300 dark:hover:text-white">
                    Database Overview
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors dark:text-gray-300 dark:hover:text-white">
                    Song Submission
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors dark:text-gray-300 dark:hover:text-white">
                    Learning Resources
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors dark:text-gray-300 dark:hover:text-white">
                    Community
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 
                className="text-base font-bold mb-4 dark:text-[#e5a3b4]" 
                style={{ color: theme === 'dark' ? undefined : maroonColor }}
              >
                Organization
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors dark:text-gray-300 dark:hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors dark:text-gray-300 dark:hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors dark:text-gray-300 dark:hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors dark:text-gray-300 dark:hover:text-white">
                    Partners
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 
                className="text-base font-bold mb-4 dark:text-[#e5a3b4]" 
                style={{ color: theme === 'dark' ? undefined : maroonColor }}
              >
                Support
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors dark:text-gray-300 dark:hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors dark:text-gray-300 dark:hover:text-white">
                    API Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors dark:text-gray-300 dark:hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors dark:text-gray-300 dark:hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 
                className="text-base font-bold mb-4 dark:text-[#e5a3b4]" 
                style={{ color: theme === 'dark' ? undefined : maroonColor }}
              >
                Contact
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors dark:text-gray-300 dark:hover:text-white">
                    Get in Touch
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors dark:text-gray-300 dark:hover:text-white">
                    Feedback
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors dark:text-gray-300 dark:hover:text-white">
                    Report an Issue
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom section with socials and copyright */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">&copy; 2025 ThaiTune. All rights reserved.</p>
          
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Link href="#" aria-label="Twitter" className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#1a1f2c] dark:hover:bg-gray-700 transition-colors">
              <Twitter className="h-4 w-4" style={{ color: theme === 'dark' ? '#e5a3b4' : maroonColor }} />
            </Link>
            <Link href="#" aria-label="Instagram" className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#1a1f2c] dark:hover:bg-gray-700 transition-colors">
              <Instagram className="h-4 w-4" style={{ color: theme === 'dark' ? '#e5a3b4' : maroonColor }} />
            </Link>
            <Link href="#" aria-label="Facebook" className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#1a1f2c] dark:hover:bg-gray-700 transition-colors">
              <Facebook className="h-4 w-4" style={{ color: theme === 'dark' ? '#e5a3b4' : maroonColor }} />
            </Link>
            <Link href="#" aria-label="GitHub" className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#1a1f2c] dark:hover:bg-gray-700 transition-colors">
              <Github className="h-4 w-4" style={{ color: theme === 'dark' ? '#e5a3b4' : maroonColor }} />
            </Link>
            <Link href="#" aria-label="LinkedIn" className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#1a1f2c] dark:hover:bg-gray-700 transition-colors">
              <Linkedin className="h-4 w-4" style={{ color: theme === 'dark' ? '#e5a3b4' : maroonColor }} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
