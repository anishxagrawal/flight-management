'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plane, Mail, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center max-w-md"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-8"
        >
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>
          </div>
        </motion.div>

        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <Plane className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold gradient-text">SkyVoyage</span>
        </Link>

        <h1 className="text-3xl font-bold mb-4">Check your email</h1>
        <p className="text-muted-foreground mb-8">
          We&apos;ve sent a confirmation link to your email address. 
          Please click the link to verify your account and complete the signup process.
        </p>

        <div className="glass-card p-6 rounded-xl mb-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium">Verification email sent</p>
              <p className="text-sm text-muted-foreground">
                Check your inbox and spam folder
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/auth/login">
              Back to Login
            </Link>
          </Button>
          <Button asChild>
            <Link href="/">
              Go to Home
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Didn&apos;t receive the email?{' '}
          <button className="text-primary hover:underline">
            Resend confirmation
          </button>
        </p>
      </motion.div>
    </div>
  )
}
