"use client"

import { useTranslation } from "react-i18next"
import { useTheme } from "next-themes"
import { Scale, Shield, Users, AlertTriangle, Clock, Mail } from "lucide-react"
import { PageTransition } from "../components/common/PageTransition"
import { TopMenu } from "../components/layout/TopMenu"
import Footer from "../components/layout/Footer"

export default function TermsOfServicePage() {
  const { t } = useTranslation('common')
  const { resolvedTheme } = useTheme()
  
  const maroonColor = "#4A1D2C"
  const maroonLight = "#e5a3b4"

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1f2c] flex flex-col transition-colors duration-300">
      <TopMenu collapsible={true} />
      <PageTransition>
        <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          {/* Hero Section */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#4A1D2C]/10 to-[#6A2D3C]/10 dark:from-[#4A1D2C]/20 dark:to-[#6A2D3C]/20"></div>
            <div className="relative container mx-auto px-4 py-16 md:py-24">
              <div className="max-w-4xl mx-auto text-center">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-lg">
                    <Scale className="w-12 h-12 text-[#4A1D2C] dark:text-[#e5a3b4]" />
                  </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#4A1D2C] to-[#6A2D3C] bg-clip-text text-transparent dark:from-[#e5a3b4] dark:to-[#f5c7d1]">
                  Terms of Service
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
                  Last updated: January 2025
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 py-16 max-w-4xl">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12">
              
              {/* Introduction */}
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <Users className="w-6 h-6 text-[#4A1D2C] dark:text-[#e5a3b4] mr-3" />
                  <h2 className="text-2xl font-bold text-[#4A1D2C] dark:text-[#e5a3b4]">
                    Welcome to ThaiTune
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  These Terms of Service ("Terms") govern your use of ThaiTune, a digital platform dedicated to preserving and sharing traditional Thai music. By accessing or using our service, you agree to be bound by these Terms.
                </p>
              </div>

              {/* Acceptance of Terms */}
              <div className="mb-12">
                <h3 className="text-xl font-semibold text-[#4A1D2C] dark:text-[#e5a3b4] mb-4">
                  1. Acceptance of Terms
                </h3>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    By creating an account or using ThaiTune, you confirm that:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                    <li>You are at least 13 years old</li>
                    <li>You have the legal capacity to enter into these Terms</li>
                    <li>You will use the service in accordance with these Terms and applicable laws</li>
                  </ul>
                </div>
              </div>

              {/* User Accounts */}
              <div className="mb-12">
                <h3 className="text-xl font-semibold text-[#4A1D2C] dark:text-[#e5a3b4] mb-4">
                  2. User Accounts
                </h3>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    To access certain features of ThaiTune, you must create an account. You are responsible for:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                    <li>Providing accurate and complete information during registration</li>
                    <li>Maintaining the security of your account credentials</li>
                    <li>All activities that occur under your account</li>
                    <li>Notifying us immediately of any unauthorized use</li>
                  </ul>
                </div>
              </div>

              {/* Content and Intellectual Property */}
              <div className="mb-12">
                <h3 className="text-xl font-semibold text-[#4A1D2C] dark:text-[#e5a3b4] mb-4">
                  3. Content and Intellectual Property
                </h3>
                <div className="prose dark:prose-invert max-w-none">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Your Content</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    When you upload traditional Thai music scores or related content to ThaiTune:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4 mb-6">
                    <li>You retain ownership of your original contributions</li>
                    <li>You grant us a non-exclusive license to display and distribute your content</li>
                    <li>You represent that you have the right to share the content</li>
                    <li>You agree to respect traditional Thai music heritage and cultural significance</li>
                  </ul>
                  
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Our Content</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    ThaiTune's platform, design, and original content are protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without permission.
                  </p>
                </div>
              </div>

              {/* Acceptable Use */}
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <Shield className="w-6 h-6 text-[#4A1D2C] dark:text-[#e5a3b4] mr-3" />
                  <h3 className="text-xl font-semibold text-[#4A1D2C] dark:text-[#e5a3b4]">
                    4. Acceptable Use Policy
                  </h3>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    You agree not to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                    <li>Upload content that infringes on others' intellectual property rights</li>
                    <li>Share inappropriate, offensive, or harmful content</li>
                    <li>Misrepresent the origin or authenticity of traditional Thai music</li>
                    <li>Use the platform for commercial purposes without authorization</li>
                    <li>Attempt to hack, disrupt, or compromise the platform's security</li>
                    <li>Spam other users or engage in harmful behavior</li>
                  </ul>
                </div>
              </div>

              {/* Cultural Responsibility */}
              <div className="mb-12">
                <h3 className="text-xl font-semibold text-[#4A1D2C] dark:text-[#e5a3b4] mb-4">
                  5. Cultural Responsibility
                </h3>
                <div className="bg-gradient-to-r from-[#4A1D2C]/5 to-[#6A2D3C]/5 dark:from-[#4A1D2C]/10 dark:to-[#6A2D3C]/10 rounded-lg p-6">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    ThaiTune is dedicated to preserving traditional Thai music with respect and authenticity. Users are expected to approach Thai musical heritage with cultural sensitivity, accuracy, and reverence for its historical and spiritual significance.
                  </p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <AlertTriangle className="w-6 h-6 text-[#4A1D2C] dark:text-[#e5a3b4] mr-3" />
                  <h3 className="text-xl font-semibold text-[#4A1D2C] dark:text-[#e5a3b4]">
                    6. Disclaimer of Warranties
                  </h3>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    ThaiTune is provided "as is" without warranties of any kind. We do not guarantee:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                    <li>Uninterrupted or error-free service</li>
                    <li>Complete accuracy of all musical content</li>
                    <li>Compatibility with all devices or software</li>
                    <li>Availability of the service at all times</li>
                  </ul>
                </div>
              </div>

              {/* Limitation of Liability */}
              <div className="mb-12">
                <h3 className="text-xl font-semibold text-[#4A1D2C] dark:text-[#e5a3b4] mb-4">
                  7. Limitation of Liability
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  To the fullest extent permitted by law, ThaiTune shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our service.
                </p>
              </div>

              {/* Modifications */}
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <Clock className="w-6 h-6 text-[#4A1D2C] dark:text-[#e5a3b4] mr-3" />
                  <h3 className="text-xl font-semibold text-[#4A1D2C] dark:text-[#e5a3b4]">
                    8. Modifications to Terms
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  We may update these Terms from time to time. We will notify users of significant changes via email or through the platform. Continued use of ThaiTune after changes constitutes acceptance of the updated Terms.
                </p>
              </div>

              {/* Contact Information */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <div className="flex items-center mb-6">
                  <Mail className="w-6 h-6 text-[#4A1D2C] dark:text-[#e5a3b4] mr-3" />
                  <h3 className="text-xl font-semibold text-[#4A1D2C] dark:text-[#e5a3b4]">
                    Contact Us
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  If you have questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-800 dark:text-gray-200 font-medium">
                    Email: support@thaitune.com
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    We typically respond within 24-48 hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
      <Footer />
    </div>
  )
} 