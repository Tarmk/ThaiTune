import Link from "next/link"
import { Facebook, Twitter, Instagram, Github, Linkedin, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-50 py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4 text-[#4A1D2C]">ThaiTune</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  Database Overview
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  Song Submission
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  Offline Access
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  High Quality Recordings
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  Song History
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  Thai Music Notation Editor
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  Learning Resources
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  Community
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  Gift Membership
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 text-[#4A1D2C]">Organization</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  Updates
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  Partners
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 text-[#4A1D2C]">Our Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  ThaiTune Database
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  ThaiTune for Education
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  Thai Music Snippets
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  Embed Player
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 text-[#4A1D2C]">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  API Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  System Status
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 text-[#4A1D2C]">Contact</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  Get in Touch
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  Feedback
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#4A1D2C]">
                  Report an Issue
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-600">&copy; 2025 ThaiTune. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" aria-label="Twitter">
              <Twitter className="h-5 w-5 text-gray-600 hover:text-[#4A1D2C]" />
            </Link>
            <Link href="#" aria-label="Instagram">
              <Instagram className="h-5 w-5 text-gray-600 hover:text-[#4A1D2C]" />
            </Link>
            <Link href="#" aria-label="Facebook">
              <Facebook className="h-5 w-5 text-gray-600 hover:text-[#4A1D2C]" />
            </Link>
            <Link href="#" aria-label="GitHub">
              <Github className="h-5 w-5 text-gray-600 hover:text-[#4A1D2C]" />
            </Link>
            <Link href="#" aria-label="LinkedIn">
              <Linkedin className="h-5 w-5 text-gray-600 hover:text-[#4A1D2C]" />
            </Link>
            <Link href="#" aria-label="YouTube">
              <Youtube className="h-5 w-5 text-gray-600 hover:text-[#4A1D2C]" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
