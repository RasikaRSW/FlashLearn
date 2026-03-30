/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import LearnerProfileForm from './components/LearnerProfileForm';
import Conversation from './components/Conversation';
import { LearnerProfile } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans">
      <AnimatePresence mode="wait">
        {!profile ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex justify-center"
          >
            <LearnerProfileForm onStart={setProfile} />
          </motion.div>
        ) : (
          <motion.div
            key="conversation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <Conversation profile={profile} onClose={() => setProfile(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
