'use server';

/**
 * @fileOverview Detects the sentiment (positive, negative, neutral) expressed in the speech.
 *
 * - performSentimentAnalysis - A function that handles the sentiment analysis process.
 * - PerformSentimentAnalysisInput - The input type for the performSentimentAnalysis function.
 * - PerformSentimentAnalysisOutput - The return type for the performSentimentAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PerformSentimentAnalysisInputSchema = z.object({
  transcription: z.string().describe('The transcription of the speech to analyze.'),
});
export type PerformSentimentAnalysisInput = z.infer<typeof PerformSentimentAnalysisInputSchema>;

const PerformSentimentAnalysisOutputSchema = z.object({
  sentiment: z
    .string()
    .describe(
      'The sentiment of the speech, which can be positive, negative, or neutral.'
    ),
  score: z.number().describe('A numerical score representing the sentiment strength.'),
});
export type PerformSentimentAnalysisOutput = z.infer<typeof PerformSentimentAnalysisOutputSchema>;

export async function performSentimentAnalysis(
  input: PerformSentimentAnalysisInput
): Promise<PerformSentimentAnalysisOutput> {
  return performSentimentAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'performSentimentAnalysisPrompt',
  input: {schema: PerformSentimentAnalysisInputSchema},
  output: {schema: PerformSentimentAnalysisOutputSchema},
  prompt: `You are an AI sentiment analysis expert. Analyze the following speech transcription and determine the sentiment expressed in it. Provide the sentiment as either "positive", "negative", or "neutral". Also, provide a numerical score from -1 to 1 representing the sentiment strength, where -1 is strongly negative, 0 is neutral, and 1 is strongly positive.\n\nTranscription: {{{transcription}}}`,
});

const performSentimentAnalysisFlow = ai.defineFlow(
  {
    name: 'performSentimentAnalysisFlow',
    inputSchema: PerformSentimentAnalysisInputSchema,
    outputSchema: PerformSentimentAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
