'use server';

/**
 * @fileOverview Converts speech to text using Genkit.
 *
 * - speechToTextTranscription - A function that handles the speech-to-text transcription process.
 * - SpeechToTextTranscriptionInput - The input type for the speechToTextTranscription function.
 * - SpeechToTextTranscriptionOutput - The return type for the speechToTextTranscription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SpeechToTextTranscriptionInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "Audio data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type SpeechToTextTranscriptionInput = z.infer<typeof SpeechToTextTranscriptionInputSchema>;

const SpeechToTextTranscriptionOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the audio.'),
});

export type SpeechToTextTranscriptionOutput = z.infer<typeof SpeechToTextTranscriptionOutputSchema>;

export async function speechToTextTranscription(
  input: SpeechToTextTranscriptionInput
): Promise<SpeechToTextTranscriptionOutput> {
  return speechToTextTranscriptionFlow(input);
}

const speechToTextTranscriptionPrompt = ai.definePrompt({
  name: 'speechToTextTranscriptionPrompt',
  input: {schema: SpeechToTextTranscriptionInputSchema},
  output: {schema: SpeechToTextTranscriptionOutputSchema},
  prompt: `Transcribe the following audio to text:

  {{media url=audioDataUri}}`,
});

const speechToTextTranscriptionFlow = ai.defineFlow(
  {
    name: 'speechToTextTranscriptionFlow',
    inputSchema: SpeechToTextTranscriptionInputSchema,
    outputSchema: SpeechToTextTranscriptionOutputSchema,
  },
  async input => {
    const {output} = await speechToTextTranscriptionPrompt(input);
    return output!;
  }
);
