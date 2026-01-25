'use server';

/**
 * @fileOverview An AI agent that answers questions based on uploaded documents.
 *
 * - documentAwareQA - A function that handles the question answering process.
 * - DocumentAwareQAInput - The input type for the documentAwareQA function.
 * - DocumentAwareQAOutput - The return type for the documentAwareQA function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DocumentAwareQAInputSchema = z.object({
  question: z.string().describe('The question to answer.'),
  documentContent: z.string().describe('The content of the uploaded document.'),
});
export type DocumentAwareQAInput = z.infer<typeof DocumentAwareQAInputSchema>;

const DocumentAwareQAOutputSchema = z.object({
  answer: z.string().describe('The answer to the question based on the document content.'),
});
export type DocumentAwareQAOutput = z.infer<typeof DocumentAwareQAOutputSchema>;

export async function documentAwareQA(input: DocumentAwareQAInput): Promise<DocumentAwareQAOutput> {
  return documentAwareQAFlow(input);
}

const prompt = ai.definePrompt({
  name: 'documentAwareQAPrompt',
  input: {schema: DocumentAwareQAInputSchema},
  output: {schema: DocumentAwareQAOutputSchema},
  prompt: `You are an expert in answering questions based on the content of a document.\n\nUse the following document content to answer the question.\n\nDocument Content: {{{documentContent}}}\n\nQuestion: {{{question}}}\n\nAnswer:`,
});

const documentAwareQAFlow = ai.defineFlow(
  {
    name: 'documentAwareQAFlow',
    inputSchema: DocumentAwareQAInputSchema,
    outputSchema: DocumentAwareQAOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
