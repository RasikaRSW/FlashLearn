import type { Metadata } from 'next';
import { Nunito, Fredoka } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { QueryClientProvider } from '@/providers/QueryClientProvider';

const nunito = Nunito({ 
  subsets: ['latin'],
  variable: '--font-nunito',
});

const fredoka = Fredoka({
  subsets: ['latin'],
  variable: '--font-fredoka',
  weight: ['400', '600'],
});

export const metadata: Metadata = {
  title: 'FlashLearn - Fun English Learning',
  description: 'Learn English vocabulary from your favorite TV shows and movies',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} ${fredoka.variable}`}>
      <body className="font-sans antialiased">
        <QueryClientProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            {/* All pages get container padding by default */}
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}