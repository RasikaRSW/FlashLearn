import { GoogleGenAI } from '@google/genai';
import { EnglishLevel } from '@/types';

import { generateFlashcardsWithOpenRouter } from '../openrouter/client';

// Check if API key exists
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set in environment variables');
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Free tier friendly models in order of preference
const MODELS = {
  primary: 'gemini-2.0-flash-lite',  // 15 RPM, 1000 RPD - most generous free tier
  fallback: 'gemini-1.5-flash-latest',      // 15 RPM, 1500 RPD - stable and reliable
  lastResort: 'gemini-1.5-flash-8b', // Lightweight fallback
};

// Simple in-memory request tracking for rate limiting
const rateLimiter = {
  requests: [] as number[],
  windowMs: 60000, // 1 minute
  
  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    // Allow max 10 requests per minute (conservative for free tier)
    return this.requests.length < 10;
  },
  
  recordRequest() {
    this.requests.push(Date.now());
  },
  
  getWaitTime(): number {
    if (this.requests.length === 0) return 0;
    const oldestRequest = this.requests[0];
    return Math.max(0, this.windowMs - (Date.now() - oldestRequest));
  }
};

// Sleep helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Exponential backoff calculation
const calculateBackoff = (attempt: number, baseDelay: number = 1000): number => {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), 60000); // Max 60s
  const jitter = Math.random() * delay * 0.1; // 10% jitter
  return delay + jitter;
};

export async function generateFlashcardsFromSubtitle(
  subtitle: string,
  userLevel: EnglishLevel,
  count: number = 10
) {
  console.log('🤖 Starting flashcard generation...');
  
  // Rate limiting check
  if (!rateLimiter.canMakeRequest()) {
    const waitTime = rateLimiter.getWaitTime();
    console.log(`⏳ Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s...`);
    await sleep(waitTime);
  }

  const prompt = `
    Analyze the following subtitle text and create ${count} vocabulary flashcards appropriate for a ${userLevel} level English learner.
    
    Subtitle text:
    ${subtitle.substring(0, 2000)}
    
    For each flashcard, provide:
    1. The word/phrase
    2. The exact context sentence where it appears
    3. A clear definition suitable for ${userLevel} level
    4. Part of speech
    5. 2-3 synonyms
    6. 2-3 antonyms (if applicable)
    7. 2 example sentences in different contexts
    8. Difficulty level (easy/medium/hard) relative to ${userLevel}
    
    Return the response as a JSON array with this structure:
    [
      {
        "word": "string",
        "context_sentence": "string",
        "definition": "string",
        "part_of_speech": "string",
        "synonyms": ["string"],
        "antonyms": ["string"],
        "examples": ["string"],
        "difficulty": "easy" | "medium" | "hard"
      }
    ]
    
    Focus on words that are:
    - Useful for everyday communication
    - Slightly challenging but not too advanced for ${userLevel} level
    - Frequently used in the context
    - Have clear meaning from context
    
    Important: Return ONLY valid JSON, no markdown formatting, no code blocks.
  `;
  // Try primary model with retries
  let lastError: Error | null = null;

  for (const [modelName, modelId] of Object.entries(MODELS)) {
    console.log(`🤖 Trying model: ${modelName} (${modelId})`);
    
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        // Enforce rate limiting before each request
        if (!rateLimiter.canMakeRequest()) {
          const waitTime = rateLimiter.getWaitTime();
          console.log(`⏳ Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s...`);
          await sleep(waitTime);
        }

        rateLimiter.recordRequest();
        
        console.log(`🤖 Attempt ${attempt + 1}/3 with ${modelId}...`);
        const response = await ai.models.generateContent({
          model: modelId,
          contents: prompt,
        });

        const text = response.text;
        console.log('✅ Received response from Gemini');

        if (!text) {
          throw new Error('Empty response from Gemini');
        }

        // Extract JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          console.error('❌ No valid JSON found in response:', text.substring(0, 200));
          throw new Error('No valid JSON found in response');
        }

        const flashcards = JSON.parse(jsonMatch[0]);
        console.log('✅ Parsed', flashcards.length, 'flashcards');
        return flashcards;

      } catch (error: any) {
        lastError = error;
        console.error(`❌ Attempt ${attempt + 1} failed:`, error.message);

        // Check if it's a rate limit error (429)
        const isRateLimit = error.status === 429 || 
                          error.message?.includes('429') ||
                          error.message?.includes('RESOURCE_EXHAUSTED') ||
                          error.message?.includes('quota');

        if (isRateLimit) {
          console.log('⚠️  Rate limit hit (429)');
          
          // If this is the last attempt with this model, try next model
          if (attempt === 2) {
            console.log(`🔄 Switching to next model...`);
            break;
          }

          // Calculate backoff delay
          const delay = calculateBackoff(attempt);
          console.log(`⏳ Waiting ${Math.round(delay / 1000)}s before retry...`);
          await sleep(delay);
        } else {
          // Non-rate-limit error, don't retry
          throw error;
        }
      }
    }
  }

  // All models failed
  console.error('❌ All models exhausted');
  throw new Error(`Failed to generate flashcards after all retries. Last error: ${lastError?.message}`);
}

export async function explainWord(word: string, context: string, userLevel: EnglishLevel) {
  const prompt = `
    Explain the word "${word}" as used in this context: "${context}"
    
    Provide an explanation suitable for a ${userLevel} level English learner including:
    1. Simple definition
    2. How it's used in this specific context
    3. Common usage patterns
    4. Cultural notes if relevant
    5. Common mistakes to avoid
    
    Keep the explanation clear and engaging.
  `;

   // Rate limiting check
  if (!rateLimiter.canMakeRequest()) {
    const waitTime = rateLimiter.getWaitTime();
    await sleep(waitTime);
  }

  for (const [modelName, modelId] of Object.entries(MODELS)) {
    try {
      rateLimiter.recordRequest();
      
      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
      });

      return response.text || '';
    } catch (error: any) {
      console.error(`❌ ${modelName} failed:`, error.message);
      
      const isRateLimit = error.status === 429 || error.message?.includes('quota');
      if (!isRateLimit) throw error;
      
      // Try next model
      continue;
    }
  }

  throw new Error('All models failed to explain word');
}