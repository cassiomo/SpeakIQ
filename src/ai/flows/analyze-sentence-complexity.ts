'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing the sentence complexity of a speech.
 *
 * It evaluates the complexity and provides a score and feedback.
 *
 * @exports analyzeSentenceComplexity - An async function that takes a transcription and returns the analysis.
 * @exports AnalyzeSentenceComplexityInput - The input type.
 * @exports AnalyzeSentenceComplexityOutput - The output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSentenceComplexityInputSchema = z.object({
  transcription: z.string().describe('The text of the speech to analyze.'),
});

export type AnalyzeSentenceComplexityInput = z.infer<typeof AnalyzeSentenceComplexityInputSchema>;

const AnalyzeSentenceComplexityOutputSchema = z.object({
  sentenceComplexityScore: z.number().describe('A score from 0 to 100 indicating sentence complexity.'),
  feedback: z.string().describe('Feedback on sentence complexity and how to improve it.'),
});

export type AnalyzeSentenceComplexityOutput = z.infer<typeof AnalyzeSentenceComplexityOutputSchema>;

const prompt = ai.definePrompt({
  name: 'analyzeSentenceComplexityPrompt',
  input: {schema: AnalyzeSentenceComplexityInputSchema},
  output: {schema: AnalyzeSentenceComplexityOutputSchema},
  prompt: `Analyze the sentence complexity of the following speech transcript. Provide a score from 0 to 100, where a higher score means more varied and appropriately complex sentences. Also provide actionable feedback.

Transcription: {{{transcription}}}`,
});

const analyzeSentenceComplexityFlow = ai.defineFlow(
  {
    name: 'analyzeSentenceComplexityFlow',
    inputSchema: AnalyzeSentenceComplexityInputSchema,
    outputSchema: AnalyzeSentenceComplexityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function analyzeSentenceComplexity(input: AnalyzeSentenceComplexityInput): Promise<AnalyzeSentenceComplexityOutput> {
  return analyzeSentenceComplexityFlow(input);
}
