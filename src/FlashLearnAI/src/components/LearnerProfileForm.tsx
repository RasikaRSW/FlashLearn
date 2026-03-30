/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LearnerProfile, Level } from '../types';
import { BookOpen, User, Target, Globe, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onStart: (profile: LearnerProfile) => void;
}

export default function LearnerProfileForm({ onStart }: Props) {
  const [profile, setProfile] = useState<LearnerProfile>({
    name: '',
    level: 'Beginner',
    nativeLanguage: '',
    goal: '',
    topic: 'Daily Life',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.name && profile.nativeLanguage && profile.goal) {
      onStart(profile);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-black/5"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-500 rounded-2xl">
          <BookOpen className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Flash Learn AI</h1>
          <p className="text-slate-500 text-sm">Your AI English Tutor</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <User size={16} /> Name
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            placeholder="What should I call you?"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <Target size={16} /> Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Beginner', 'Intermediate', 'Advanced'] as Level[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setProfile({ ...profile, level: l })}
                className={`py-2 rounded-xl text-sm font-medium transition-all ${
                  profile.level === l
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <Globe size={16} /> Native Language
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            placeholder="e.g. Spanish, Chinese"
            value={profile.nativeLanguage}
            onChange={(e) => setProfile({ ...profile, nativeLanguage: e.target.value })}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <MessageSquare size={16} /> Topic
          </label>
          <select
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
            value={profile.topic}
            onChange={(e) => setProfile({ ...profile, topic: e.target.value })}
          >
            <option>Daily Life</option>
            <option>Travel</option>
            <option>Business</option>
            <option>Hobbies</option>
            <option>Technology</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <Target size={16} /> Goal
          </label>
          <textarea
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
            rows={2}
            placeholder="What do you want to achieve?"
            value={profile.goal}
            onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
        >
          Start Learning
        </button>
      </form>
    </motion.div>
  );
}
