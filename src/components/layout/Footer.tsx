import Link from 'next/link';
import { Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t-2 border-slate-100 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-6 w-6 text-indigo-600" />
              <span className="text-xl font-extrabold text-slate-800">FlashLearn</span>
            </div>
            <p className="text-slate-500 max-w-sm">
              Making vocabulary learning fun, visual, and effective. Learn English naturally through your favorite stories.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Explore</h4>
            <ul className="space-y-2 text-slate-600 font-medium">
              <li><Link href="/shows" className="hover:text-indigo-600">TV Shows</Link></li>
              <li><Link href="/flashcards" className="hover:text-indigo-600">My Decks</Link></li>
              <li><Link href="/leaderboard" className="hover:text-indigo-600">Leaderboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-slate-600 font-medium">
              <li><Link href="/privacy" className="hover:text-indigo-600">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-indigo-600">Terms</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-100 mt-12 pt-8 text-center text-slate-400 font-medium flex items-center justify-center gap-1">
          Made with <Heart className="h-4 w-4 text-red-400 fill-current" /> for learners everywhere.
        </div>
      </div>
    </footer>
  );
}