'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/')
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#131313]">
      {/* Left Side - Visual (cockpit image) */}
      <div className="hidden lg:flex flex-1 items-end relative overflow-hidden">
        {/* Background image placeholder - using gradient to simulate cockpit */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%), radial-gradient(ellipse at center top, rgba(0,163,255,0.1) 0%, transparent 50%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent" />
        
        {/* Brand text at bottom */}
        <div className="relative z-10 p-10">
          <h2 className="text-4xl md:text-5xl font-bold text-[#00a3ff] italic tracking-tight font-sans mb-4">
            AeroCommand
          </h2>
          <p className="text-[#bec7d4] max-w-md leading-relaxed">
            Precision flight management and terminal operations for the modern aerospace network.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Glass Card */}
          <div 
            className="rounded-xl p-8 border border-white/5"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%), rgba(28, 27, 27, 0.6)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <h1 className="text-3xl font-bold mb-2 text-[#e5e2e1] font-sans">Secure Access</h1>
            <p className="text-[#bec7d4] mb-8">
              Enter your credentials to initiate sequence.
            </p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs text-[#bec7d4] font-mono tracking-wider uppercase">Operator ID</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bec7d4]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="AC-8492"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-[#121212] border-white/5 border-b-white/10 text-[#e5e2e1] placeholder:text-[#bec7d4]/50 focus:border-[#00a3ff] focus:border-b-[#00a3ff]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs text-[#bec7d4] font-mono tracking-wider uppercase">Passkey</Label>
                  <Link href="/auth/forgot-password" className="text-xs text-[#00a3ff] hover:underline font-mono">
                    Forgot Passkey?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bec7d4]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 bg-[#121212] border-white/5 border-b-white/10 text-[#e5e2e1] placeholder:text-[#bec7d4]/50 focus:border-[#00a3ff] focus:border-b-[#00a3ff]"
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-[#93000a]/20 border border-[#ffb4ab]/20"
                >
                  <p className="text-sm text-[#ffb4ab]">{error}</p>
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[#00a3ff] to-[#00ded1] text-[#003354] font-semibold hover:shadow-[0_0_20px_rgba(0,163,255,0.4)] transition-all font-mono"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Authenticate
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-[#bec7d4]">
              New operator?{' '}
              <Link href="/auth/sign-up" className="text-[#00a3ff] hover:underline">
                Request Access
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
