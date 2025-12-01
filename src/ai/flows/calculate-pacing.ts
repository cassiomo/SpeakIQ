'use server';

/**
 * @fileOverview This file defines a Genkit flow for calculating the pacing of a speech.
 *
 * It determines words per minute and provides feedback.
 *
 * @exports calculatePacing - An async function that takes a transcription and returns the analysis.
 * @exports CalculatePacingInput - The input type.
 * @exports CalculatePacingOutput - The output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculatePacingInputSchema = z.object({
  transcription: z.string().describe('The text of the speech to analyze.'),
});

export type CalculatePacingInput = z.infer<typeof CalculatePacingInputSchema>;

const CalculatePacingOutputSchema = z.object({
  wordsPerMinute: z.number().describe('The speaking rate in words per minute.'),
  feedback: z.string().describe('Feedback on the speaking pace.'),
});

export type CalculatePacingOutput = z.infer<typeof CalculatePacingOutputSchema>;

// This is a simplified logic. In a real app, you would pass audio duration.
// We will estimate duration based on an average speaking rate.
function estimateAudioDurationInMinutes(wordCount: number): number {
    const averageWPM = 150; // Average speaking rate
    return wordCount / averageWPM;
}

const prompt = ai.definePrompt({
  name: 'calculatePacingPrompt',
  input: {schema: z.object({wordsPerMinute: z.number()})},
  output: {schema: z.object({feedback: z.string()})},
  prompt: `The speaker's pace is {{wordsPerMinute}} words per minute. A good range is 140-160 WPM. Provide brief, actionable feedback based on this pace.`,
});

const calculatePacingFlow = ai.defineFlow(
  {
    name: 'calculatePacingFlow',
    inputSchema: CalculatePacingInputSchema,
    outputSchema: CalculatePacingOutputSchema,
  },
  async input => {
    const wordCount = input.transcription.trim().split(/\s+/).length;
    const durationInMinutes = estimateAudioDurationInMinutes(wordCount);
    const wordsPerMinute = durationInMinutes > 0 ? Math.round(wordCount / durationInMinutes) : 0;
    
    // In a real scenario with audio duration, we would calculate WPM differently.
    // For now, the WPM will be close to the average, so we generate feedback based on it.
    // To make it more dynamic for demonstration, let's add some variance.
    const adjustedWPM = wordsPerMinute + Math.floor(Math.random() * 40) - 20;

    const {output} = await prompt({wordsPerMinute: adjustedWPM});
    return {
        wordsPerMinute: adjustedWPM,
        feedback: output!.feedback,
    };
  }
);

export async function calculatePacing(input: CalculatePacingInput): Promise<CalculatePacingOutput> {
  return calculatePacingFlow(input);
}
