'use server';
/**
 * @fileOverview Generates a personalized learning roadmap based on user preferences and uploaded documents.
 *
 * - generatePersonalizedRoadmap - A function that generates the learning roadmap.
 * - PersonalizedRoadmapInput - The input type for the generatePersonalizedRoadmap function.
 * - PersonalizedRoadmapOutput - The return type for the generatePersonalizedRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRoadmapInputSchema = z.object({
  topic: z.string().describe('The topic the user wants to learn about.'),
  skillLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('The user\'s skill level.'),
  timeCommitment: z.number().min(1).max(40).describe('The number of hours per week the user can commit to learning.'),
  targetDate: z.string().describe('The date the user wants to complete learning by.'),
  learningStyle: z
    .enum(['Visual', 'Reading', 'Hands-on', 'Mixed'])
    .describe('The user\'s preferred learning style.'),
  goals: z.string().describe('The user\'s learning goals.'),
  documentDataUri: z
    .string()
    .optional()
    .describe(
      'Optional: A study material as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // TODO: add length constratint
    ),
});
export type PersonalizedRoadmapInput = z.infer<typeof PersonalizedRoadmapInputSchema>;

const PersonalizedRoadmapOutputSchema = z.object({
  roadmap: z.string().describe('A JSON string representing the week-by-week learning roadmap.'),
});
export type PersonalizedRoadmapOutput = z.infer<typeof PersonalizedRoadmapOutputSchema>;

export async function generatePersonalizedRoadmap(
  input: PersonalizedRoadmapInput
): Promise<PersonalizedRoadmapOutput> {
  return personalizedRoadmapFlow(input);
}

const personalizedRoadmapPrompt = ai.definePrompt({
  name: 'personalizedRoadmapPrompt',
  input: {schema: PersonalizedRoadmapInputSchema},
  output: {schema: PersonalizedRoadmapOutputSchema},
  prompt: `You are an expert learning path designer.

User Preferences:
- Topic: {{{topic}}}
- Level: {{{skillLevel}}}
- Hours/week: {{{timeCommitment}}}
- Target: {{{targetDate}}}
- Style: {{{learningStyle}}}
- Goals: {{{goals}}}

{{#if documentDataUri}}
Document Context:
- Document: {{media url=documentDataUri}}
{{/if}}

Task: Generate a week-by-week learning roadmap as JSON with:
- Weeks array (title, topics, hours, dates)
- Milestones
- Practice exercises
- Quiz checkpoints

Output the result as JSON.`, // TODO: add a way to specify JSON output constraints
});

const personalizedRoadmapFlow = ai.defineFlow(
  {
    name: 'personalizedRoadmapFlow',
    inputSchema: PersonalizedRoadmapInputSchema,
    outputSchema: PersonalizedRoadmapOutputSchema,
  },
  async input => {
    const {output} = await personalizedRoadmapPrompt(input);
    return output!;
  }
);
