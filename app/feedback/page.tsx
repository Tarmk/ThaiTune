"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Lock, Send, MessageSquare, Star, Heart, CheckCircle } from "lucide-react"
import { TopMenu } from "@/app/components/layout/TopMenu"
import Footer from "@/app/components/layout/Footer"
import { motion } from "framer-motion"

export default function FeedbackPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedbackType: 'general',
    rating: 5,
    title: '',
    message: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/submit-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setFormData({
          name: '',
          email: '',
          feedbackType: 'general',
          rating: 5,
          title: '',
          message: ''
        })
      } else {
        console.error('Failed to submit feedback')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') {
      localStorage.setItem('admin_session', 'true')
      router.push('/admin/feedback')
    } else {
      alert('Invalid password')
    }
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1f2c] flex flex-col">
      <TopMenu />
      
      <main className="flex-1 pt-16">
        {/* Header */}
        <section className="w-full py-8 bg-gradient-to-br from-[#4A1D2C] to-[#6A2D3C] dark:from-[#1a1f2c] dark:to-[#2a1f2c]">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center"
            >
              <motion.h1 
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold text-white mb-4"
              >
                We Value Your Feedback
              </motion.h1>
              <motion.p 
                variants={fadeInUp}
                className="text-xl text-gray-200 mb-6"
              >
                Help us improve ThaiTune by sharing your thoughts and suggestions
              </motion.p>
              
              {/* Admin Access Button */}
              <motion.div
                variants={fadeInUp}
                className="flex justify-center mb-4"
              >
                <Button
                  onClick={() => setShowAdminLogin(!showAdminLogin)}
                  variant="ghost"
                  className="text-white hover:bg-white/10 transition-colors"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Admin Access
                </Button>
              </motion.div>

              {/* Admin Login */}
              {showAdminLogin && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto"
                >
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="Admin password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="flex-1 bg-white/20 border-white/30 text-white placeholder-white/70"
                      onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                    />
                    <Button
                      onClick={handleAdminLogin}
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 text-white"
                    >
                      Login
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Feedback Form */}
        <section className="w-full py-16 bg-gray-50 dark:bg-[#232838]">
          <div className="container px-4 md:px-6 max-w-2xl mx-auto">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-8">
                    <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                      Thank You!
                    </h2>
                    <p className="text-green-700 dark:text-green-300 mb-6">
                      Your feedback has been received and will help us improve ThaiTune.
                    </p>
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Submit Another Feedback
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <Card className="shadow-lg dark:bg-gray-800">
                  <CardHeader className="text-center">
                    <motion.div variants={fadeInUp}>
                      <MessageSquare className="h-8 w-8 text-[#4A1D2C] dark:text-[#e5a3b4] mx-auto mb-4" />
                      <CardTitle className="text-2xl text-[#4A1D2C] dark:text-[#e5a3b4]">
                        Share Your Feedback
                      </CardTitle>
                    </motion.div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                            Name *
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="mt-1 dark:bg-gray-700"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                            Email *
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="mt-1 dark:bg-gray-700"
                          />
                        </div>
                      </motion.div>

                      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="feedbackType" className="text-gray-700 dark:text-gray-300">
                            Feedback Type
                          </Label>
                          <select
                            id="feedbackType"
                            name="feedbackType"
                            value={formData.feedbackType}
                            onChange={handleInputChange}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                          >
                            <option value="general">General Feedback</option>
                            <option value="feature">Feature Request</option>
                            <option value="bug">Bug Report</option>
                            <option value="improvement">Improvement Suggestion</option>
                            <option value="compliment">Compliment</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="rating" className="text-gray-700 dark:text-gray-300">
                            Rating (1-5)
                          </Label>
                          <div className="mt-1 flex items-center gap-2">
                            <input
                              id="rating"
                              name="rating"
                              type="range"
                              min="1"
                              max="5"
                              value={formData.rating}
                              onChange={handleInputChange}
                              className="flex-1"
                            />
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-5 w-5 ${
                                    star <= formData.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div variants={fadeInUp}>
                        <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">
                          Title *
                        </Label>
                        <Input
                          id="title"
                          name="title"
                          type="text"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                          className="mt-1 dark:bg-gray-700"
                          placeholder="Brief summary of your feedback"
                        />
                      </motion.div>

                      <motion.div variants={fadeInUp}>
                        <Label htmlFor="message" className="text-gray-700 dark:text-gray-300">
                          Message *
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={5}
                          className="mt-1 dark:bg-gray-700"
                          placeholder="Please provide detailed feedback..."
                        />
                      </motion.div>

                      <motion.div variants={fadeInUp}>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-[#4A1D2C] hover:bg-[#3A1520] text-white dark:bg-[#8A3D4C] dark:hover:bg-[#6A2D3C]"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Submitting...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Send className="h-4 w-4" />
                              Submit Feedback
                            </div>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
} 