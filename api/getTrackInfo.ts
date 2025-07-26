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
  const album = searchParams.get('album'); // Get the album from the query

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
    const prompt = `You are a music curator for a beloved independent radio station, like Worldwide FM or NTS. Your goal is to write a short, insightful description for the track about to be played.

The track is: "${track}"
The artist is: "${artist}"
${album ? `From the album: "${album}"` : ''}

Your instructions:
1.  **Write a captivating description** of 50-60 words.
2.  **VARY YOUR SENTENCE STRUCTURE AND OPENING.** Do not always start with the same phrase. You could start with the release year, a piece of trivia, the artist's origin, or a description of the sound itself.
3.  **Weave in key details** like genre, release year, and artist's country of origin when possible.
4.  **Maintain a tone** that is both knowledgeable and passionate—technical yet accessible.

Here are a few examples of the style we love to demonstrate the variety we're looking for:

Example 1 (starting with the year):
"1992's 'Equinox (Heavenly Club Mix)' is the work of New York's Code 718, an alias of legendary DJ Danny Tenaglia. This classic house track pulses with hypnotic rhythms, embodying the era's club scene magic."

Example 2 (starting with the artist):
"Sweden's Carbon Based Lifeforms are known for pioneering the psybient genre. Their 2003 track 'Tensor,' from the album 'Hydroponic Garden,' blends lush textures and intricate rhythms into something both cosmic and grounding."

Example 3 (starting with a fact):
"A cult favorite from the '90s shoegaze scene, Bowery Electric's 'Long Way Down' (1996) envelops you in lush, textured soundscapes. Taken from their sophomore album 'Beat,' it showcases their innovative fusion of ambient and rock."
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