"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Button } from "@/_app/components/ui/button"
import { Input } from "@/_app/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/_app/components/ui/card"
import { Label } from "@/_app/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/_app/components/ui/alert"
import { AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import '@/i18n'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { t } = useTranslation(['auth'])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof Error) {
        switch (err.message) {
          case 'Firebase: Error (auth/user-not-found).':
          case 'Firebase: Error (auth/wrong-password).':
            setError(t('auth:errors.invalidCredentials'))
            break
          case 'Firebase: Error (auth/network-request-failed).':
            setError(t('auth:errors.networkError'))
            break
          default:
            setError(t('auth:errors.unexpected'))
        }
      } else {
        setError(t('auth:errors.unexpected'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 relative">
      <Card className="w-[350px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{t('auth:login')}</CardTitle>
          <CardDescription className="text-center">
            {t('auth:enterCredentials')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/" className="absolute top-4 left-4 flex items-center text-[#800000] hover:text-[#600000]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('auth:backToHome')}
          </Link>
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('error')}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth:email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth:password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button 
              className="w-full mt-4 bg-[#4A1D2C] text-white hover:bg-[#3A1622]" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? t('auth:loggingIn') : t('auth:loginButton')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            {t('auth:dontHaveAccount')}{' '}
            <Link href="/signup" className="text-[#800000] hover:underline">
              {t('auth:signup')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}