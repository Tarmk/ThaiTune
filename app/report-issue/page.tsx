"use client"

import { useState, useEffect } from "react"
import { TopMenu } from "@/app/components/layout/TopMenu"
import Footer from "@/app/components/layout/Footer"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { AlertTriangle, Bug, MessageSquare, Zap, Send } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useTheme } from "next-themes"

export default function ReportIssuePage() {
  const { t } = useTranslation("common")
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    issueType: "bug",
    title: "",
    description: "",
    steps: "",
    priority: "medium"
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        setIsSubmitted(false)
      }, 5000) // Hide success message after 5 seconds
      
      return () => clearTimeout(timer)
    }
  }, [isSubmitted])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Submit to API endpoint
      const response = await fetch('/api/submit-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit ticket')
      }

      console.log("Ticket created successfully:", result)
      
      // Show success message
      setIsSubmitted(true)
      
      // Reset form after successful submission
      setFormData({
        name: "",
        email: "",
        issueType: "bug",
        title: "",
        description: "",
        steps: "",
        priority: "medium"
      })
      
    } catch (error) {
      console.error("Error submitting form:", error)
      // You can add error handling here - for now just log
      alert("Error submitting ticket. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Theme colors
  const maroonColor = "#4A1D2C"
  const maroonLighter = "#6A2D3C"
  const maroonLightest = "#F8F1F3"
  const maroonDark = "#8A3D4C"

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#1a1f2c] flex flex-col">
        <div className="h-16 w-full bg-white dark:bg-[#1a1f2c] border-b border-gray-100 dark:border-gray-800"></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">
            <div className="h-12 w-96 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-6 w-72 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1f2c] flex flex-col">
      <TopMenu />

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="w-full py-16 bg-gradient-to-br from-[#4A1D2C] to-[#6A2D3C] dark:from-[#1a1f2c] dark:to-[#2a1f2c]">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-6">
              <Bug className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4">
              Report an Issue
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Help us improve ThaiTune by reporting bugs, issues, or suggesting improvements. Your feedback is valuable to us.
            </p>
          </div>
        </section>

        {/* Issue Types */}
        <section className="w-full py-16 bg-gray-50 dark:bg-[#232838]">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                What type of issue are you experiencing?
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Choose the category that best describes your issue
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-16">
              <Card className="bg-white dark:bg-[#2a3349] shadow-lg hover:shadow-xl dark:shadow-none dark:border-none transition-shadow cursor-pointer group">
                <div className="h-1" style={{ background: `linear-gradient(to right, ${theme === 'dark' ? '#8A3D4C' : '#4A1D2C'}, ${theme === 'dark' ? '#af5169' : '#6A2D3C'})` }} />
                <CardContent className="p-6 text-center">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                    style={{ 
                      backgroundColor: theme === 'dark' ? 'rgba(138, 61, 76, 0.2)' : 'rgba(74, 29, 44, 0.1)',
                    }}
                  >
                    <Bug className="h-6 w-6" style={{ color: theme === 'dark' ? '#e5a3b4' : '#4A1D2C' }} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Bug Report</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Something isn't working as expected
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#2a3349] shadow-lg hover:shadow-xl dark:shadow-none dark:border-none transition-shadow cursor-pointer group">
                <div className="h-1" style={{ background: `linear-gradient(to right, ${theme === 'dark' ? '#8A3D4C' : '#4A1D2C'}, ${theme === 'dark' ? '#af5169' : '#6A2D3C'})` }} />
                <CardContent className="p-6 text-center">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                    style={{ 
                      backgroundColor: theme === 'dark' ? 'rgba(138, 61, 76, 0.2)' : 'rgba(74, 29, 44, 0.1)',
                    }}
                  >
                    <Zap className="h-6 w-6" style={{ color: theme === 'dark' ? '#e5a3b4' : '#4A1D2C' }} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Performance Issue</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    The app is slow or unresponsive
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#2a3349] shadow-lg hover:shadow-xl dark:shadow-none dark:border-none transition-shadow cursor-pointer group">
                <div className="h-1" style={{ background: `linear-gradient(to right, ${theme === 'dark' ? '#8A3D4C' : '#4A1D2C'}, ${theme === 'dark' ? '#af5169' : '#6A2D3C'})` }} />
                <CardContent className="p-6 text-center">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                    style={{ 
                      backgroundColor: theme === 'dark' ? 'rgba(138, 61, 76, 0.2)' : 'rgba(74, 29, 44, 0.1)',
                    }}
                  >
                    <MessageSquare className="h-6 w-6" style={{ color: theme === 'dark' ? '#e5a3b4' : '#4A1D2C' }} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Feature Request</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Suggest a new feature or improvement
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Report Form */}
            <Card className="bg-white dark:bg-[#2a3349] shadow-lg dark:shadow-none dark:border-none">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Report Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Your Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4A1D2C] focus:border-[#4A1D2C] dark:bg-[#1a1f2c] dark:text-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4A1D2C] focus:border-[#4A1D2C] dark:bg-[#1a1f2c] dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="issueType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Issue Type
                      </Label>
                      <select
                        id="issueType"
                        name="issueType"
                        value={formData.issueType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4A1D2C] focus:border-[#4A1D2C] dark:bg-[#1a1f2c] dark:text-white"
                      >
                        <option value="bug">Bug Report</option>
                        <option value="performance">Performance Issue</option>
                        <option value="feature">Feature Request</option>
                        <option value="ui">UI/UX Issue</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Priority
                      </Label>
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4A1D2C] focus:border-[#4A1D2C] dark:bg-[#1a1f2c] dark:text-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Issue Title
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      placeholder="Brief description of the issue"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4A1D2C] focus:border-[#4A1D2C] dark:bg-[#1a1f2c] dark:text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Detailed Description
                    </Label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      placeholder="Provide a detailed description of the issue..."
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4A1D2C] focus:border-[#4A1D2C] dark:bg-[#1a1f2c] dark:text-white resize-vertical"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="steps" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Steps to Reproduce (if applicable)
                    </Label>
                    <textarea
                      id="steps"
                      name="steps"
                      rows={3}
                      placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                      value={formData.steps}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4A1D2C] focus:border-[#4A1D2C] dark:bg-[#1a1f2c] dark:text-white resize-vertical"
                    />
                  </div>

                  {isSubmitted && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-green-800 dark:text-green-200 font-medium">Report submitted successfully!</p>
                          <p className="text-green-600 dark:text-green-300 text-sm">Thank you for your feedback. We'll review your report and get back to you if needed.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#4A1D2C] hover:bg-[#3A1520] dark:bg-[#8A3D4C] dark:hover:bg-[#6A2D3C] text-white py-3 px-6 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Report
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Additional Info */}
        <section className="w-full py-16 bg-white dark:bg-[#1a1f2c]">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            <div className="bg-blue-50 dark:bg-[#232838] rounded-lg p-6 border border-blue-200 dark:border-gray-700">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-2">
                    Before submitting your report
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• Check if the issue has already been reported</li>
                    <li>• Try refreshing the page or clearing your browser cache</li>
                    <li>• Include your browser and device information if relevant</li>
                    <li>• Provide screenshots if they help explain the issue</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
} 