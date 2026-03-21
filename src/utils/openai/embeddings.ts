import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates an embedding for the given text using OpenAI's text-embedding-3-small model.
 * This model produces 1536-dimensional vectors.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    return new Array(1536).fill(0);
  }

  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.replace(/\n/g, ' '),
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Helper to format track data for embedding.
 */
export function formatTrackForEmbedding(title: string, description: string, tags: string): string {
  return `Title: ${title}\nDescription: ${description}\nTags: ${tags}`;
}

/**
 * Helper to format user profile for embedding.
 */
export function formatUserForEmbedding(studioName: string, bio: string): string {
  return `Studio Name: ${studioName}\nBio: ${bio}`;
}
