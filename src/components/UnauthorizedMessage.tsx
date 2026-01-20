'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Home } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function UnauthorizedMessage() {
  const [seconds, setSeconds] = useState(5)
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds <= 1) {
          clearInterval(interval)
          router.push('/')
          return 0
        }
        return prevSeconds - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [router])

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="w-12 h-12 text-destructive" />
          </div>
          <CardTitle className="text-destructive">Access Denied</CardTitle>
          <CardDescription className="text-base">
            You must be an administrator to view this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Redirecting to Home in <span className="font-bold text-foreground">{seconds}</span> seconds...
          </p>

          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-destructive h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(seconds / 5) * 100}%` }}
            />
          </div>

          <Button onClick={handleGoHome} className="w-full gap-2">
            <Home className="w-4 h-4" />
            Go to Home Now
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}