/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { LearnerProfile } from '../types';
import { AudioProcessor } from '../lib/audio-utils';
import { Mic, MicOff, Volume2, VolumeX, X, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  profile: LearnerProfile;
  onClose: () => void;
}

export default function Conversation({ profile, onClose }: Props) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<{ text: string; type: 'user' | 'model' }[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const audioProcessor = useRef(new AudioProcessor());
  const sessionRef = useRef<any>(null);

  const systemInstruction = `You are Flash Learn, an AI English tutor designed for real-time voice conversations.

Your goal is to help the learner improve spoken English through short, interactive dialogue.

Learner Profile:
- Name: ${profile.name}
- Level: ${profile.level}
- Native Language: ${profile.nativeLanguage}
- Goal: ${profile.goal}
- Topic: ${profile.topic}

Core Behavior:
- Speak naturally like a human tutor.
- Keep responses SHORT (1–3 sentences max).
- Ask ONLY ONE question at a time.
- Pause often to let the learner speak.
- Always keep the conversation going.

Teaching Style:
- Start with a friendly greeting using the learner’s name.
- Focus on speaking practice, not long explanations.
- Use simple, clear English based on their level.
- Use real-life situations (daily life, travel, work, etc.).

Error Correction:
When the learner makes a mistake:
1. Repeat the correct sentence naturally
2. Briefly explain (1 short sentence)
3. Ask them to try again

Pronunciation Help:
- Break difficult words into syllables
- Give simple sound hints
- Ask learner to repeat

Engagement Rules:
- Encourage often ("Good job!", "Nice!", "Almost perfect!")
- If learner struggles, simplify your question
- If learner says "I don't know", give 2 simple options

Voice-Friendly Rules:
- Avoid long paragraphs
- Avoid lists unless necessary
- Use conversational tone
- No complex grammar explanations

Flow Structure:
1. Greeting
2. Simple question
3. Learner response
4. Correction (if needed)
5. Follow-up question
6. Continue loop

Important:
- Do NOT speak too much
- Do NOT ask multiple questions at once
- Do NOT switch topics suddenly
- Always end with a question.`;

  useEffect(() => {
    const startSession = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const sessionPromise = ai.live.connect({
          model: "gemini-2.5-flash-native-audio-preview-12-2025",
          callbacks: {
            onopen: () => {
              setIsConnected(true);
              setIsRecording(true);
              audioProcessor.current.start((base64Data) => {
                if (!isMuted) {
                  sessionRef.current?.sendRealtimeInput({
                    audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                  });
                }
              });
            },
            onmessage: async (message) => {
              if (message.serverContent?.modelTurn?.parts) {
                for (const part of message.serverContent.modelTurn.parts) {
                  if (part.inlineData) {
                    audioProcessor.current.playAudioChunk(part.inlineData.data);
                  }
                }
              }

              if (message.serverContent?.interrupted) {
                // Handle interruption if needed
              }

              // Handle transcriptions
              if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
                 // Text part from model
              }
            },
            onerror: (err) => {
              console.error("Live API Error:", err);
              setError("Connection error. Please check your API key and try again.");
            },
            onclose: () => {
              setIsConnected(false);
              setIsRecording(false);
            }
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
            },
            systemInstruction,
          },
        });

        sessionRef.current = await sessionPromise;
      } catch (err) {
        console.error("Failed to connect:", err);
        setError("Failed to initialize conversation.");
      }
    };

    startSession();

    return () => {
      audioProcessor.current.stop();
      sessionRef.current?.close();
    };
  }, [profile, isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="absolute top-6 right-6 flex gap-4">
        <button 
          onClick={onClose}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
        >
          <X size={24} />
        </button>
      </div>

      <div className="max-w-xl w-full flex flex-col items-center gap-12">
        <motion.div 
          animate={{ 
            scale: isRecording && !isMuted ? [1, 1.1, 1] : 1,
            opacity: isConnected ? 1 : 0.5
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`w-48 h-48 rounded-full flex items-center justify-center relative ${
            isMuted ? 'bg-slate-700' : 'bg-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)]'
          }`}
        >
          {isMuted ? (
            <MicOff size={64} className="text-white/50" />
          ) : (
            <Mic size={64} className="text-white" />
          )}
          
          {isRecording && !isMuted && (
            <motion.div 
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 border-4 border-emerald-500 rounded-full"
            />
          )}
        </motion.div>

        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">
            {isConnected ? `Talking to ${profile.name}` : 'Connecting...'}
          </h2>
          <p className="text-slate-400 text-lg">
            {isMuted ? 'Microphone muted' : 'Listening for your voice...'}
          </p>
          {error && (
            <p className="text-red-400 bg-red-400/10 px-4 py-2 rounded-xl text-sm">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-6">
          <button
            onClick={toggleMute}
            className={`p-6 rounded-3xl transition-all flex flex-col items-center gap-2 ${
              isMuted ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {isMuted ? <Volume2 size={32} /> : <VolumeX size={32} />}
            <span className="text-xs font-bold uppercase tracking-wider">
              {isMuted ? 'Unmute' : 'Mute'}
            </span>
          </button>

          <button
            onClick={() => window.location.reload()}
            className="p-6 bg-white/10 text-white rounded-3xl hover:bg-white/20 transition-all flex flex-col items-center gap-2"
          >
            <RotateCcw size={32} />
            <span className="text-xs font-bold uppercase tracking-wider">Reset</span>
          </button>
        </div>

        <div className="w-full bg-white/5 rounded-3xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-white/60 text-sm font-medium">Session Info</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white/40 mb-1">Topic</p>
              <p className="text-white font-medium">{profile.topic}</p>
            </div>
            <div>
              <p className="text-white/40 mb-1">Level</p>
              <p className="text-white font-medium">{profile.level}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
