import Link from "next/link"
import { Facebook, Twitter, Instagram, Github, Linkedin, Youtube, MusicIcon } from "lucide-react"
import { Logo } from "../common/Logo"

export default function Footer() {
  // Theme colors
  const maroonColor = "#4A1D2C"
  const maroonLighter = "#6A2D3C"
  const maroonLightest = "#F8F1F3"

  return (
    <footer className="bg-white pt-16 pb-12 border-t border-gray-100">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Logo and description section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-12">
          <div className="mb-8 md:mb-0 md:max-w-xs">
            <Logo size="lg" withText={true} variant="primary" borderRadius="rounded-lg" />
            <p className="mt-4 text-gray-500 text-sm">
              ThaiTune helps musicians learn, create, and share traditional Thai music with a modern platform 
              designed to preserve cultural heritage.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 xl:gap-12">
            <div>
              <h3 className="text-base font-bold mb-4" style={{ color: maroonColor }}>ThaiTune</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors">
                    Database Overview
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors">
                    Song Submission
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors">
                    Learning Resources
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors">
                    Community
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-bold mb-4" style={{ color: maroonColor }}>Organization</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors">
                    Partners
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-bold mb-4" style={{ color: maroonColor }}>Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors">
                    API Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-bold mb-4" style={{ color: maroonColor }}>Contact</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors">
                    Get in Touch
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors">
                    Feedback
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-[#4A1D2C] transition-colors">
                    Report an Issue
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom section with socials and copyright */}
        <div className="border-t border-gray-100 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-500">&copy; 2025 ThaiTune. All rights reserved.</p>
          
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Link href="#" aria-label="Twitter" className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <Twitter className="h-4 w-4" style={{ color: maroonColor }} />
            </Link>
            <Link href="#" aria-label="Instagram" className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <Instagram className="h-4 w-4" style={{ color: maroonColor }} />
            </Link>
            <Link href="#" aria-label="Facebook" className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <Facebook className="h-4 w-4" style={{ color: maroonColor }} />
            </Link>
            <Link href="#" aria-label="GitHub" className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <Github className="h-4 w-4" style={{ color: maroonColor }} />
            </Link>
            <Link href="#" aria-label="LinkedIn" className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <Linkedin className="h-4 w-4" style={{ color: maroonColor }} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
