'use server';

/**
 * @fileOverview Enables voice-based Q&A and spoken explanations using Whisper API for transcription and ElevenLabs for text-to-speech.
 *
 * - voiceBasedLearning - A function that handles the voice-based learning process.
 * - VoiceBasedLearningInput - The input type for the voiceBasedLearning function.
 * - VoiceBasedLearningOutput - The return type for the voiceBasedLearning function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceBasedLearningInputSchema = z.object({
  query: z.string().describe('The user query to be answered.'),
  documentContext: z.string().optional().describe('Relevant document sections for RAG.'),
});
export type VoiceBasedLearningInput = z.infer<typeof VoiceBasedLearningInputSchema>;

const VoiceBasedLearningOutputSchema = z.object({
  spokenExplanation: z.string().describe('The spoken explanation of the answer.'),
  textExplanation: z.string().describe('The text explanation of the answer.'),
});
export type VoiceBasedLearningOutput = z.infer<typeof VoiceBasedLearningOutputSchema>;

export async function voiceBasedLearning(input: VoiceBasedLearningInput): Promise<VoiceBasedLearningOutput> {
  return voiceBasedLearningFlow(input);
}

const voiceBasedLearningPrompt = ai.definePrompt({
  name: 'voiceBasedLearningPrompt',
  input: {schema: VoiceBasedLearningInputSchema},
  output: {schema: VoiceBasedLearningOutputSchema},
  prompt: `You are a helpful AI assistant providing explanations to the user's questions.

  Context: {{{documentContext}}}
  
  Question: {{{query}}}
  
  Provide a concise text explanation and a spoken explanation of the answer.`,
});

const voiceBasedLearningFlow = ai.defineFlow(
  {
    name: 'voiceBasedLearningFlow',
    inputSchema: VoiceBasedLearningInputSchema,
    outputSchema: VoiceBasedLearningOutputSchema,
  },
  async input => {
    const {output} = await voiceBasedLearningPrompt(input);
    return output!;
  }
);
