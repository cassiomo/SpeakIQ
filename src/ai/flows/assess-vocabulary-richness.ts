'use server';
/**
 * @fileOverview Flow for assessing the vocabulary richness of a speech.
 *
 * - assessVocabularyRichness - A function that assesses vocabulary richness.
 * - AssessVocabularyRichnessInput - The input type for the assessVocabularyRichness function.
 * - AssessVocabularyRichnessOutput - The return type for the assessVocabularyRichness function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessVocabularyRichnessInputSchema = z.object({
  transcription: z.string().describe('The transcription of the speech to analyze.'),
});
export type AssessVocabularyRichnessInput = z.infer<
  typeof AssessVocabularyRichnessInputSchema
>;

const AssessVocabularyRichnessOutputSchema = z.object({
  vocabularyRichnessScore: z
    .number()
    .describe(
      'A score indicating the vocabulary richness of the speech, higher values indicating a richer vocabulary.'
    ),
  feedback: z
    .string()
    .describe(
      'Feedback on the vocabulary richness of the speech, including suggestions for improvement.'
    ),
});
export type AssessVocabularyRichnessOutput = z.infer<
  typeof AssessVocabularyRichnessOutputSchema
>;

export async function assessVocabularyRichness(
  input: AssessVocabularyRichnessInput
): Promise<AssessVocabularyRichnessOutput> {
  return assessVocabularyRichnessFlow(input);
}

const assessVocabularyRichnessPrompt = ai.definePrompt({
  name: 'assessVocabularyRichnessPrompt',
  input: {schema: AssessVocabularyRichnessInputSchema},
  output: {schema: AssessVocabularyRichnessOutputSchema},
  prompt: `You are an expert speech analyst. Assess the vocabulary richness of the following speech transcription.

Transcription: {{{transcription}}}

Provide a vocabulary richness score from 0 to 100 and feedback on how to improve vocabulary richness in future speeches.`,
});

const assessVocabularyRichnessFlow = ai.defineFlow(
  {
    name: 'assessVocabularyRichnessFlow',
    inputSchema: AssessVocabularyRichnessInputSchema,
    outputSchema: AssessVocabularyRichnessOutputSchema,
  },
  async input => {
    const {output} = await assessVocabularyRichnessPrompt(input);
    return output!;
  }
);
