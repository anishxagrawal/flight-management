'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plane, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-destructive/5 via-background to-background">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center max-w-md"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-8"
        >
          <div className="relative mx-auto w-24 h-24">
            <div className="relative w-24 h-24 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
          </div>
        </motion.div>

        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <Plane className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold gradient-text">SkyVoyage</span>
        </Link>

        <h1 className="text-3xl font-bold mb-4">Authentication Error</h1>
        <p className="text-muted-foreground mb-4">
          Something went wrong during the authentication process.
        </p>

        {(error || errorDescription) && (
          <div className="glass-card p-4 rounded-xl mb-8 text-left">
            {error && (
              <p className="font-mono text-sm text-destructive mb-2">{error}</p>
            )}
            {errorDescription && (
              <p className="text-sm text-muted-foreground">{errorDescription}</p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/auth/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </Button>
          <Button asChild>
            <Link href="/auth/sign-up">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
