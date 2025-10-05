'use server';

/**
 * @fileOverview Identifies potential knowledge gaps and conflicting findings based on summarized publication content.
 *
 * - identifyKnowledgeGaps - A function that identifies knowledge gaps and conflicting findings.
 * - IdentifyKnowledgeGapsInput - The input type for the identifyKnowledgeGaps function.
 * - IdentifyKnowledgeGapsOutput - The return type for the identifyKnowledgeGaps function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyKnowledgeGapsInputSchema = z.object({
  publicationSummaries: z
    .array(z.string())
    .describe('An array of summarized content from publications.'),
});
export type IdentifyKnowledgeGapsInput = z.infer<typeof IdentifyKnowledgeGapsInputSchema>;

const IdentifyKnowledgeGapsOutputSchema = z.object({
  knowledgeGaps: z
    .string()
    .describe('A summary of potential knowledge gaps identified.'),
  conflictingFindings: z
    .string()
    .describe('A summary of conflicting findings identified.'),
});
export type IdentifyKnowledgeGapsOutput = z.infer<typeof IdentifyKnowledgeGapsOutputSchema>;

export async function identifyKnowledgeGaps(
  input: IdentifyKnowledgeGapsInput
): Promise<IdentifyKnowledgeGapsOutput> {
  return identifyKnowledgeGapsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyKnowledgeGapsPrompt',
  input: {schema: IdentifyKnowledgeGapsInputSchema},
  output: {schema: IdentifyKnowledgeGapsOutputSchema},
  prompt: `You are an AI assistant that identifies knowledge gaps and conflicting findings from a set of publication summaries.

  Analyze the following publication summaries to identify potential knowledge gaps and conflicting findings. Provide a summary of each.

  Publication Summaries:
  {{#each publicationSummaries}}
  - {{{this}}}
  {{/each}}

  Knowledge Gaps: (Provide a detailed summary of any knowledge gaps identified)

  Conflicting Findings: (Provide a detailed summary of any conflicting findings identified)
  `,
});

const identifyKnowledgeGapsFlow = ai.defineFlow(
  {
    name: 'identifyKnowledgeGapsFlow',
    inputSchema: IdentifyKnowledgeGapsInputSchema,
    outputSchema: IdentifyKnowledgeGapsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
