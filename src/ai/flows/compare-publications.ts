'use server';

/**
 * @fileOverview Compares a set of publications to find points of consensus and contradiction.
 *
 * - comparePublications - A function that orchestrates the comparison.
 * - ComparePublicationsInput - The input type for the function.
 * - ComparePublicationsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PublicationComparisonItemSchema = z.object({
  id: z.string().describe('The unique ID of the publication.'),
  title: z.string().describe('The title of the publication.'),
  summary: z.string().describe('The summary of the publication.'),
});

const ComparePublicationsInputSchema = z.object({
  publications: z
    .array(PublicationComparisonItemSchema)
    .min(2)
    .max(5)
    .describe('An array of 2 to 5 publications to be compared.'),
});
export type ComparePublicationsInput = z.infer<typeof ComparePublicationsInputSchema>;

const ComparePublicationsOutputSchema = z.object({
  consensus: z
    .array(z.string())
    .describe(
      'A list of specific findings, methods, or conclusions that the publications agree on.'
    ),
  contradictions: z
    .array(z.string())
    .describe(
      'A list of specific points where the publications present conflicting or contradictory evidence or conclusions.'
    ),
});
export type ComparePublicationsOutput = z.infer<typeof ComparePublicationsOutputSchema>;

export async function comparePublications(
  input: ComparePublicationsInput
): Promise<ComparePublicationsOutput> {
  return comparePublicationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'comparePublicationsPrompt',
  input: {schema: ComparePublicationsInputSchema},
  output: {schema: ComparePublicationsOutputSchema},
  prompt: `You are an expert research analyst with a specialization in synthesizing scientific literature.
Your task is to carefully analyze the summaries of the following publications and identify clear points of consensus and contradiction.

**Publications to Analyze:**
{{#each publications}}
- **Publication ID:** {{{id}}}
  **Title:** {{{title}}}
  **Summary:** {{{summary}}}
---
{{/each}}

**Analysis Task:**

1.  **Find Consensus:** Identify specific findings, methodologies, or conclusions where these papers are in clear agreement. The consensus must be explicitly supported by the text of at least two of the publications. List each point of consensus as a separate string.

2.  **Find Contradictions:** Identify specific points where the papers present conflicting, contradictory, or opposing evidence or conclusions. Do not list knowledge gaps; focus only on direct disagreements. List each contradiction as a separate string.

Provide your output in the requested JSON format. If no consensus or contradictions are found, return an empty array for the respective field.
  `,
});

const comparePublicationsFlow = ai.defineFlow(
  {
    name: 'comparePublicationsFlow',
    inputSchema: ComparePublicationsInputSchema,
    outputSchema: ComparePublicationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
