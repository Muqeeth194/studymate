'use server';

/**
 * @fileOverview Adaptive quiz generation flow.
 *
 * This flow generates quizzes that adapt to the user's performance.
 * - generateAdaptiveQuiz - The main function to generate adaptive quizzes.
 * - AdaptiveQuizInput - The input type for the generateAdaptiveQuiz function.
 * - AdaptiveQuizOutput - The output type for the generateAdaptiveQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptiveQuizInputSchema = z.object({
  topic: z.string().describe('The topic of the quiz.'),
  userLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('The user\u2019s skill level.'),
  context: z.string().optional().describe('Additional context for the quiz, such as specific document sections.'),
});
export type AdaptiveQuizInput = z.infer<typeof AdaptiveQuizInputSchema>;

const AdaptiveQuizOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      options: z.array(z.string()).describe('The possible answer options.'),
      correctAnswer: z.string().describe('The correct answer to the question.'),
      explanation: z.string().describe('An explanation of the correct answer.'),
    })
  ).describe('An array of quiz questions.'),
});
export type AdaptiveQuizOutput = z.infer<typeof AdaptiveQuizOutputSchema>;

export async function generateAdaptiveQuiz(input: AdaptiveQuizInput): Promise<AdaptiveQuizOutput> {
  return adaptiveQuizFlow(input);
}

const adaptiveQuizPrompt = ai.definePrompt({
  name: 'adaptiveQuizPrompt',
  input: {schema: AdaptiveQuizInputSchema},
  output: {schema: AdaptiveQuizOutputSchema},
  prompt: `You are an expert quiz generator that creates quizzes tailored to the user's skill level.

Generate a quiz with 5 questions based on the following topic and context.

Topic: {{{topic}}}
User Level: {{{userLevel}}}

{{#if context}}
Context: {{{context}}}
{{/if}}

Each question should have 4 answer options, with one correct answer.
Provide an explanation for each correct answer.

Output the quiz as a JSON object with a 'questions' array. Each question object should include the question, options, correctAnswer and explanation.

Follow the schema descriptions closely.`,
});

const adaptiveQuizFlow = ai.defineFlow(
  {
    name: 'adaptiveQuizFlow',
    inputSchema: AdaptiveQuizInputSchema,
    outputSchema: AdaptiveQuizOutputSchema,
  },
  async input => {
    const {output} = await adaptiveQuizPrompt(input);
    return output!;
  }
);
