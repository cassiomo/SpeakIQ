'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing filler words in a speech.
 *
 * It identifies and counts filler words like 'um', 'ah', and 'like' in a given text.
 *
 * @exports analyzeFillerWords - An async function that takes speech text as input and returns the analysis result.
 * @exports AnalyzeFillerWordsInput - The input type for the analyzeFillerWords function (speech text).
 * @exports AnalyzeFillerWordsOutput - The output type for the analyzeFillerWords function (filler word counts).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the flow
const AnalyzeFillerWordsInputSchema = z.object({
  speechText: z.string().describe('The text of the speech to analyze.'),
});

export type AnalyzeFillerWordsInput = z.infer<typeof AnalyzeFillerWordsInputSchema>;

// Define the output schema for the flow
const AnalyzeFillerWordsOutputSchema = z.object({
  umCount: z.number().describe('The number of times \"um\" was used.'),
  ahCount: z.number().describe('The number of times \"ah\" was used.'),
  likeCount: z.number().describe('The number of times \"like\" was used.'),
  otherFillerWords: z.any().describe('A JSON string representing a dictionary of other filler words and their counts, e.g., \'{"so": 2, "right": 5}\'.'),
});

export type AnalyzeFillerWordsOutput = z.infer<typeof AnalyzeFillerWordsOutputSchema>;

// Define the prompt for the flow
const analyzeFillerWordsPrompt = ai.definePrompt({
  name: 'analyzeFillerWordsPrompt',
  input: {schema: AnalyzeFillerWordsInputSchema},
  output: {schema: AnalyzeFillerWordsOutputSchema},
  prompt: `Analyze the following speech text for filler words. Count the occurrences of \"um,\" \"ah,\" and \"like.\" Also, identify and count any other filler words used.

Speech Text: {{{speechText}}}

Return the counts in JSON format. For other filler words, provide a JSON string where keys are the filler words and values are their counts.`,
});

// Define the Genkit flow
const analyzeFillerWordsFlow = ai.defineFlow(
  {
    name: 'analyzeFillerWordsFlow',
    inputSchema: AnalyzeFillerWordsInputSchema,
    outputSchema: AnalyzeFillerWordsOutputSchema,
  },
  async input => {
    const {output} = await analyzeFillerWordsPrompt(input);
    if (typeof output!.otherFillerWords === 'string') {
        try {
            output!.otherFillerWords = JSON.parse(output!.otherFillerWords);
        } catch (e) {
            console.error("Failed to parse otherFillerWords string:", e);
            // If parsing fails, set it to an empty object to avoid downstream errors.
            output!.otherFillerWords = {};
        }
    } else if (typeof output!.otherFillerWords !== 'object' || output!.otherFillerWords === null) {
        // If it's not a string or a valid object, default to an empty object.
        output!.otherFillerWords = {};
    }
    return output!;
  }
);

/**
 * Analyzes the given speech text for filler words and returns the counts.
 * @param input - The input object containing the speech text.
 * @returns A promise that resolves to an object containing the filler word counts.
 */
export async function analyzeFillerWords(input: AnalyzeFillerWordsInput): Promise<AnalyzeFillerWordsOutput> {
  return analyzeFillerWordsFlow(input);
}
