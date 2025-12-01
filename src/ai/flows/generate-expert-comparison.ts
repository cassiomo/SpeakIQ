'use server';

/**
 * @fileOverview A flow to generate a comparison against expert speaker archetypes.
 *
 * - generateExpertComparison - A function that returns scores for clarity, engagement, and confidence.
 * - GenerateExpertComparisonInput - The input type for the function.
 * - GenerateExpertComparisonOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExpertComparisonInputSchema = z.object({
  transcription: z.string().describe('The transcription of the speech.'),
});
export type GenerateExpertComparisonInput = z.infer<typeof GenerateExpertComparisonInputSchema>;

const GenerateExpertComparisonOutputSchema = z.object({
  clarity: z.number().describe('Score for clarity (0-100), based on structure and simplicity.'),
  engagement: z.number().describe('Score for engagement (0-100), based on sentiment and vocabulary.'),
  confidence: z.number().describe('Score for confidence (0-100), based on filler words and pacing.'),
});
export type GenerateExpertComparisonOutput = z.infer<typeof GenerateExpertComparisonOutputSchema>;

export async function generateExpertComparison(input: GenerateExpertComparisonInput): Promise<GenerateExpertComparisonOutput> {
  return generateExpertComparisonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExpertComparisonPrompt',
  input: {schema: GenerateExpertComparisonInputSchema},
  output: {schema: GenerateExpertComparisonOutputSchema},
  prompt: `Analyze the following speech transcript and rate it on three dimensions compared to an expert speaker: Clarity, Engagement, and Confidence. Provide a score from 0 to 100 for each.

- Clarity: How clear and understandable is the message? Consider sentence structure and vocabulary.
- Engagement: How well does the speaker hold the audience's attention? Consider sentiment and narrative elements.
- Confidence: How confident does the speaker sound? Consider filler words and pace.

Transcript: {{{transcription}}}
`,
});

const generateExpertComparisonFlow = ai.defineFlow(
  {
    name: 'generateExpertComparisonFlow',
    inputSchema: GenerateExpertComparisonInputSchema,
    outputSchema: GenerateExpertComparisonOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
