'use client'

import Link from 'next/link'

const footerLinks = [
  { label: 'Privacy Protocol', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'API Status', href: '/api-status' },
  { label: 'Global Network', href: '/network' },
]

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-gradient-to-t from-[#0e0e0e] to-[#131313]">
      <div className="container mx-auto px-4 md:px-10 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold tracking-tighter text-[#e5e2e1] font-sans">
              AeroCommand
            </span>
            
            {/* Links */}
            <nav className="hidden md:flex items-center gap-6">
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs text-[#bec7d4] hover:text-[#e5e2e1] transition-colors font-mono tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Copyright */}
          <p className="text-xs text-[#bec7d4] font-mono">
            © 2024 AeroCommand Systems. All altitudes cleared.
          </p>
        </div>
        
        {/* Mobile Links */}
        <nav className="flex md:hidden flex-wrap justify-center gap-4 mt-6 pt-6 border-t border-white/5">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs text-[#bec7d4] hover:text-[#e5e2e1] transition-colors font-mono"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
