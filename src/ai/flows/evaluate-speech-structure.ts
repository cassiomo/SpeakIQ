'use server';

/**
 * @fileOverview This file defines a Genkit flow for evaluating the structure and coherence of a speech.
 *
 * The flow takes the speech transcript as input and returns an assessment of its structural coherence.
 * It exports:
 *   - `evaluateSpeechStructure`: The main function to call the flow.
 *   - `EvaluateSpeechStructureInput`: The input type for the flow.
 *   - `EvaluateSpeechStructureOutput`: The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateSpeechStructureInputSchema = z.string().describe('The transcript of the speech to evaluate.');
export type EvaluateSpeechStructureInput = z.infer<typeof EvaluateSpeechStructureInputSchema>;

const EvaluateSpeechStructureOutputSchema = z.object({
  coherenceScore: z.number().describe('A score indicating the structural coherence of the speech (0-100).'),
  strengths: z.string().describe('A summary of the strengths of the speech structure.'),
  weaknesses: z.string().describe('A summary of the weaknesses of the speech structure.'),
  recommendations: z.string().describe('Actionable recommendations for improving the speech structure.'),
});
export type EvaluateSpeechStructureOutput = z.infer<typeof EvaluateSpeechStructureOutputSchema>;

export async function evaluateSpeechStructure(input: EvaluateSpeechStructureInput): Promise<EvaluateSpeechStructureOutput> {
  return evaluateSpeechStructureFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateSpeechStructurePrompt',
  input: {schema: EvaluateSpeechStructureInputSchema},
  output: {schema: EvaluateSpeechStructureOutputSchema},
  prompt: `You are an expert speech evaluator, specializing in assessing the structure and coherence of speeches.

  Evaluate the following speech transcript and provide a coherence score (0-100), a summary of strengths and weaknesses, and actionable recommendations for improvement.

  Speech Transcript: {{{$input}}}

  Ensure that the coherence score represents the logical flow and clarity of the speech.
  The strengths and weaknesses should be concise and specific to the provided speech.
  The recommendations should be practical and directly address the weaknesses identified.

  Your evaluation must be returned as a valid JSON object conforming to the EvaluateSpeechStructureOutputSchema.
  `,
});

const evaluateSpeechStructureFlow = ai.defineFlow(
  {
    name: 'evaluateSpeechStructureFlow',
    inputSchema: EvaluateSpeechStructureInputSchema,
    outputSchema: EvaluateSpeechStructureOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
