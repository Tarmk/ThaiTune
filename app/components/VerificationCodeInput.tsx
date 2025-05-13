"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ArrowRight, CheckCircle, Clock, Mail, RefreshCw, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerificationCodeInputProps {
  email: string
  onVerify: (code: string) => Promise<void>
  onResend: () => Promise<void>
  error?: string
}

export function VerificationCodeInput({ email, onVerify, onResend, error }: VerificationCodeInputProps) {
  const [code, setCode] = React.useState<string[]>(Array(6).fill(""))
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [isVerified, setIsVerified] = React.useState(false)
  const [timeLeft, setTimeLeft] = React.useState(60)
  const [isResending, setIsResending] = React.useState(false)
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])
  
  // Mask email for privacy
  const maskedEmail = email.replace(/(.{3})(.*)(@.*)/, "$1•••$3")

  // The specific maroon color from your theme
  const maroonColor = "#4A1D2C"
  const maroonLighter = "#6A2D3C" // Slightly lighter for hover states
  const maroonLightest = "#F8F1F3" // Very light for backgrounds

  React.useEffect(() => {
    const timer = timeLeft > 0 && !isVerified && setInterval(() => setTimeLeft(timeLeft - 1), 1000)
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [timeLeft, isVerified])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(0, 1)
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    } else if (value && index === 5) {
      // Auto-verify when all digits are filled
      if (newCode.every((digit) => digit !== "")) {
        handleVerify(newCode.join(""))
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").trim()

    // Check if pasted content is a valid 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split("")
      setCode(newCode)
      inputRefs.current[5]?.focus()

      // Auto-verify when pasting a complete code
      handleVerify(pastedData)
    }
  }

  const handleVerify = async (codeToVerify = code.join("")) => {
    if (codeToVerify.length !== 6) return
    
    setIsVerifying(true)
    try {
      await onVerify(codeToVerify)
      setIsVerified(true)
    } catch (err) {
      // Error handling is managed by the parent component
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (timeLeft > 0) return
    
    setIsResending(true)
    try {
      await onResend()
      setTimeLeft(60)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card className="w-full max-w-md overflow-hidden border-0 shadow-lg">
      <div className="h-2" style={{ background: `linear-gradient(to right, ${maroonColor}, ${maroonLighter})` }} />
      <CardHeader className="space-y-1 pt-6 pb-4">
        <div className="flex justify-center mb-2">
          {isVerified ? (
            <div className="rounded-full bg-green-100 p-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          ) : (
            <div className="rounded-full p-2" style={{ backgroundColor: maroonLightest }}>
              <Mail className="h-8 w-8" style={{ color: maroonColor }} />
            </div>
          )}
        </div>
        <h2 className="text-center text-2xl font-bold tracking-tight">
          {isVerified ? "Email Verified!" : "Verify your email"}
        </h2>
        <p className="text-center text-sm text-gray-500">
          {isVerified
            ? "Your email has been successfully verified."
            : `Enter the 6-digit code sent to ${maskedEmail}`}
        </p>
      </CardHeader>

      <CardContent>
        {!isVerified ? (
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <div key={index} className="relative">
                  <input
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className={cn(
                      "h-14 w-12 rounded-md border text-center text-xl font-semibold shadow-sm transition-all",
                      error ? "border-red-300 bg-red-50" : "border-gray-200",
                      "focus:outline-none",
                    )}
                    style={{
                      borderColor: digit ? maroonColor : undefined,
                      backgroundColor: digit ? maroonLightest : undefined,
                    }}
                    aria-label={`Digit ${index + 1}`}
                    autoFocus={index === 0}
                  />
                  <div
                    className="absolute bottom-0 left-0 h-1 w-full rounded-b-md transition-all duration-300"
                    style={{ backgroundColor: digit ? maroonColor : "#e5e7eb" }}
                  />
                </div>
              ))}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="flex items-center justify-center text-sm font-medium text-red-800">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {error}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="mb-4 rounded-full bg-green-100 p-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <p className="text-center text-gray-600">You can now continue using our services</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pb-6">
        {!isVerified ? (
          <>
            <Button
              onClick={() => handleVerify()}
              disabled={isVerifying || code.join("").length !== 6 || isVerified}
              className="w-full text-white"
              style={{
                backgroundColor: maroonColor,
              }}
            >
              {isVerifying ? (
                <span className="flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                </span>
              ) : (
                <span className="flex items-center">
                  Verify <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-sm">
              {timeLeft > 0 ? (
                <div className="flex items-center text-gray-500">
                  <Clock className="mr-1 h-3 w-3" /> Resend code in {timeLeft}s
                </div>
              ) : (
                <button
                  onClick={handleResend}
                  className="flex items-center transition-colors"
                  style={{ color: maroonColor }}
                  disabled={isResending}
                >
                  <RefreshCw className={cn("mr-1 h-3 w-3", isResending && "animate-spin")} /> 
                  {isResending ? "Sending..." : "Resend code"}
                </button>
              )}
            </div>
          </>
        ) : (
          <Button
            className="w-full text-white"
            style={{ backgroundColor: maroonColor }}
            onClick={() => window.location.href = "/dashboard"}
          >
            Continue to Dashboard
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}