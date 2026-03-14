'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import { LayoutDashboard, BookOpen, LogOut, Menu, X, Sparkles, Library } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-slate-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-12 transition-transform">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Flash<span className="text-indigo-600">Learn</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/shows" className="text-slate-600 hover:text-indigo-600 font-bold transition-colors">
              Shows
            </Link>
            {user && (
              <>
                <Link href="/dashboard" className="text-slate-600 hover:text-indigo-600 font-bold transition-colors flex items-center gap-1">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link href="/flashcards" className="text-slate-600 hover:text-indigo-600 font-bold transition-colors flex items-center gap-1">
                  <Library className="h-4 w-4" />
                  My Cards
                </Link>
                <Link href="/flashcards/review" className="text-slate-600 hover:text-indigo-600 font-bold transition-colors flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  Review
                </Link>
              </>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {user.email?.split('@')[0]}
                </span>
                <Button variant="ghost" size="sm" onClick={signOut} className="text-slate-500 hover:text-red-500">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" isDoodle={false}>Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="flex flex-col p-4 space-y-4">
              <Link href="/shows" className="text-lg font-bold text-slate-700" onClick={() => setIsMenuOpen(false)}>Browse Shows</Link>
              {user ? (
                <>
                  <Link href="/dashboard" className="text-lg font-bold text-slate-700 flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                    <LayoutDashboard className="h-5 w-5" /> Dashboard
                  </Link>
                  <Link href="/flashcards" className="text-lg font-bold text-slate-700 flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                    <Library className="h-5 w-5" /> My Flashcards
                  </Link>
                  <Link href="/flashcards/review" className="text-lg font-bold text-slate-700 flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                    <BookOpen className="h-5 w-5" /> Review
                  </Link>
                  <Button onClick={() => { signOut(); setIsMenuOpen(false); }} variant="outline" className="w-full">Logout</Button>
                </>
              ) : (
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Sign In</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}