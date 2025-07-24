import { kv } from '@vercel/kv';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get('artist');
  const track = searchParams.get('track');

  if (!artist || !track) {
    return new Response(JSON.stringify({ error: 'Artist and track parameters are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Create a unique key for the cache
  const cacheKey = `track-info:${artist.toLowerCase().replace(/ /g, '_')}-${track.toLowerCase().replace(/ /g, '_')}`;

  try {
    // 1. Check cache first
    const cachedDescription = await kv.get<string>(cacheKey);

    if (cachedDescription) {
      // Cache hit: return the stored description
      return new Response(JSON.stringify({ description: cachedDescription, source: 'cache' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Cache miss: call OpenAI API
    const prompt = `
Here is the track: "${track}" by "${artist}".

Write a precise and engaging 50-word maximum description of a music track. Use available metadata to highlight the track, the album (if applicable), the release year, the genre, and the country of origin of the artist. If relevant, include an anecdote or trivia about the track, artist, or recording. The tone should mix technical insight with a warm, curious radio host vibe — like something you’d hear on Worldwide FM. Avoid vague or generic phrases; aim for accuracy, depth, and musical context.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200, // Reduced as we no longer need space for JSON
    });

    const description = response.choices[0]?.message?.content?.trim();

    if (!description) {
      throw new Error('Failed to generate description from OpenAI');
    }

    // 3. Store the new description string in the cache
    await kv.set(cacheKey, description, { ex: 60 * 60 * 24 * 30 });

    // Return the newly generated description
    return new Response(JSON.stringify({ description }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in getTrackInfo:', error);

    // Check for OpenAI API errors or Vercel timeout errors
    if (error instanceof OpenAI.APIError || error.code === 'FUNCTION_INVOCATION_TIMEOUT') {
      // Use a 504 status to indicate an upstream timeout or failure
      return new Response(JSON.stringify({ error: 'Failed to fetch description from OpenAI.' }), {
        status: 504, 
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generic internal server error for other issues
    return new Response(JSON.stringify({ error: 'An internal server error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 