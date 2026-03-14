import OpenAI from 'openai';

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000', // Required by OpenRouter
    'X-Title': 'TV Flashcards', // Required
  },
});

export async function generateFlashcardsWithOpenRouter(
  subtitle: string,
  userLevel: string,
  count: number = 10
) {
  const prompt = `
    Analyze the following subtitle text and create ${count} vocabulary flashcards appropriate for a ${userLevel} level English learner.
    
    Subtitle text:
    ${subtitle.substring(0, 1500)}
    
    For each flashcard, provide:
    1. The word/phrase
    2. The exact context sentence where it appears
    3. A clear definition suitable for ${userLevel} level
    4. Part of speech
    5. 2-3 synonyms
    6. 2-3 antonyms (if applicable)
    7. 2 example sentences in different contexts
    8. Difficulty level (easy/medium/hard) relative to ${userLevel}
    
    Return ONLY a JSON array with this exact structure:
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
    
    Focus on words that are useful for everyday communication and slightly challenging for ${userLevel} level.
  `;

  try {
    console.log('🤖 Calling OpenRouter API...');
    
    const completion = await openrouter.chat.completions.create({
      model: 'google/gemini-2.0-flash-lite-001', // Free model on OpenRouter
      messages: [
        {
          role: 'system',
          content: 'You are a helpful language learning assistant. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const text = completion.choices[0]?.message?.content;
    
    if (!text) {
      throw new Error('Empty response from OpenRouter');
    }

    console.log('✅ Received response from OpenRouter');

    // Extract JSON
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('❌ No JSON found:', text.substring(0, 200));
      throw new Error('No valid JSON in response');
    }

    const flashcards = JSON.parse(jsonMatch[0]);
    console.log('✅ Parsed', flashcards.length, 'flashcards');
    return flashcards;

  } catch (error: any) {
    console.error('❌ OpenRouter error:', error.message);
    throw error;
  }
}