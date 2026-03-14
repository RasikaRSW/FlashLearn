import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import { Film, Brain, Target, Award } from 'lucide-react';

export default function HomePage() {
  const features = [
    { icon: Film, title: 'Learn from Stories', desc: 'Vocabulary sticks better when it comes from characters you love.' },
    { icon: Brain, title: 'Smart Flashcards', desc: 'AI picks words perfect for your level, automatically.' },
    { icon: Target, title: 'Spaced Repetition', desc: 'Scientifically optimized review timing for maximum memory.' },
    { icon: Award, title: 'Track Growth', desc: 'Visualize your vocabulary expansion over time.' },
  ];

  return (
    // Full width breakout using calc to counteract parent padding
    <div 
      className="space-y-24 pb-20"
      style={{
        marginLeft: 'calc(-1 * (100vw - 98%) / 2)',
        marginRight: 'calc(-1 * (100vw - 98%) / 2)',
        marginTop: '-4rem', // -py-8 equivalent
        marginBottom: '-2rem', // -py-8 equivalent
        paddingLeft: 'calc((100vw - 130%) / 2)',
        paddingRight: 'calc((100vw - 130%) / 2)',
        paddingTop: '0rem',
        paddingBottom: 'rem',
        width: '100vw',
      }}
    >
      
      {/* Hero Section - Full width */}
      <section className="relative pt-10 pb-20 lg:pt-20 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 opacity-10 translate-x-1/3 -translate-y-1/4">
           <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-[600px] h-[600px] fill-indigo-500">
             <path d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,70.6,31.6C59,41.7,47.1,49,35.3,56.5C23.5,64,11.8,71.7,-1.8,74.8C-15.4,77.9,-30.8,76.4,-44.5,69.9C-58.2,63.4,-70.2,51.9,-78.6,38.3C-87,24.7,-91.8,9,-89.6,-5.7C-87.4,-20.4,-78.2,-34.1,-66.7,-44.6C-55.2,-55.1,-41.4,-62.4,-27.8,-69.9C-14.2,-77.4,-0.8,-85.1,13.3,-83.8C27.4,-82.5,54.8,-72.2,44.7,-76.4Z" transform="translate(100 100)" />
           </svg>
        </div>

        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-sm mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            New Shows Added Weekly!
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 mb-8 tracking-tight">
            Learn English with <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Your Favorite Shows
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop studying boring textbooks. Start learning real, natural English from the movies and series you actually enjoy watching.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/shows">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8">Start Learning</Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-8">How it Works</Button>
            </Link>
          </div>

          <div className="mt-16 relative mx-auto max-w-4xl h-64 lg:h-96 bg-white rounded-3xl border-2 border-slate-200 soft-shadow overflow-hidden flex items-center justify-center">
             <div className="text-center">
                <div className="text-6xl mb-4">📺 🧠 ✨</div>
                <p className="text-slate-400 font-bold">Interactive Preview Placeholder</p>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Why FlashLearn?</h2>
            <p className="text-slate-500">The most fun you'll have studying vocabulary.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} variant="doodle" className="hover:-translate-y-2 transition-transform duration-300">
                  <CardContent className="pt-8 text-center">
                    <div className="inline-flex p-4 bg-indigo-50 rounded-2xl mb-6 text-indigo-600">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20 border-y-2 border-slate-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-extrabold text-center text-slate-900 mb-16">
              Simple Steps to Fluency
            </h2>
            
            <div className="space-y-12 relative">
              <div className="absolute left-8 top-8 bottom-8 w-1 bg-slate-100 hidden md:block" />
              
              {[
                { step: '1', title: 'Pick a Show', desc: 'Choose from our library of popular TV shows and movies.' },
                { step: '2', title: 'Set Your Level', desc: 'Tell us your English level so we know which words to pick.' },
                { step: '3', title: 'Generate', desc: 'Our AI scans the episode script and creates flashcards instantly.' },
                { step: '4', title: 'Review', desc: 'Study with our spaced repetition system. Never forget a word again.' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-6 items-start relative z-10">
                  <div className="shrink-0 w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-lg border-4 border-white">
                    {item.step}
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 flex-1">
                    <h3 className="text-xl font-extrabold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}