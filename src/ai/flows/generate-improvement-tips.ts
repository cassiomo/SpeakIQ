'use server';

/**
 * @fileOverview A flow to generate personalized recommendations for improving speaking skills.
 *
 * - generateImprovementTips - A function that generates improvement tips based on speech analysis.
 * - GenerateImprovementTipsInput - The input type for the generateImprovementTips function.
 * - GenerateImprovementTipsOutput - The return type for the generateImprovementTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImprovementTipsInputSchema = z.object({
  fillerWordAnalysis: z
    .string()
    .describe('Analysis of filler words used in the speech.'),
  vocabularyRichnessScore: z
    .number()
    .describe('Score representing vocabulary richness of the speech.'),
  speechStructureAssessment: z
    .string()
    .describe('Assessment of the structural coherence of the speech.'),
  sentimentAnalysis: z.string().describe('Sentiment analysis of the speech.'),
  comparativeAnalysis: z
    .string()
    .describe(
      "Comparative analysis of the user's speech with expert speakers."
    ),
});
export type GenerateImprovementTipsInput = z.infer<
  typeof GenerateImprovementTipsInputSchema
>;

const GenerateImprovementTipsOutputSchema = z.object({
  improvementTips: z
    .array(z.string())
    .describe('Personalized recommendations for improvement.'),
});
export type GenerateImprovementTipsOutput = z.infer<
  typeof GenerateImprovementTipsOutputSchema
>;

export async function generateImprovementTips(
  input: GenerateImprovementTipsInput
): Promise<GenerateImprovementTipsOutput> {
  return generateImprovementTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateImprovementTipsPrompt',
  input: {schema: GenerateImprovementTipsInputSchema},
  output: {schema: GenerateImprovementTipsOutputSchema},
  prompt: `You are an expert speaking coach. Based on the analysis of the user's speech, provide personalized recommendations for improvement.

Here's the analysis of the speech:

Filler Word Analysis: {{{fillerWordAnalysis}}}
Vocabulary Richness Score: {{{vocabularyRichnessScore}}}
Speech Structure Assessment: {{{speechStructureAssessment}}}
Sentiment Analysis: {{{sentimentAnalysis}}}
Comparative Analysis with Expert Speakers: {{{comparativeAnalysis}}}

Provide actionable and relevant personalized recommendations for improvement. Return the recommendations as a list of strings. Focus on what the user can concretely do to improve their speaking skills.
`,
});

const generateImprovementTipsFlow = ai.defineFlow(
  {
    name: 'generateImprovementTipsFlow',
    inputSchema: GenerateImprovementTipsInputSchema,
    outputSchema: GenerateImprovementTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
