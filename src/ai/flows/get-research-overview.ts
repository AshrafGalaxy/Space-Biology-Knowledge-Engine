'use server';

/**
 * @fileOverview Generates a high-level strategic overview of a collection of publications.
 *
 * - getResearchOverview - A function that orchestrates the analysis.
 * - GetResearchOverviewInput - The input type for the function.
 * - GetResearchOverviewOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PublicationSummarySchema = z.object({
  title: z.string().describe('The title of the publication.'),
  summary: z.string().describe('The summary of the publication.'),
});

const GetResearchOverviewInputSchema = z.object({
  publications: z
    .array(PublicationSummarySchema)
    .describe('An array of publication summaries to be analyzed.'),
});
export type GetResearchOverviewInput = z.infer<typeof GetResearchOverviewInputSchema>;

const GetResearchOverviewOutputSchema = z.object({
  dominantThemes: z
    .array(z.object({
        theme: z.string().describe("The name of the dominant research theme."),
        description: z.string().describe("A brief (1-2 sentence) description of why this theme is dominant.")
    }))
    .min(3).max(4)
    .describe(
      'A list of the 3-4 most dominant research themes found in the provided publications.'
    ),
  emergingTrends: z
    .array(z.object({
        trend: z.string().describe("The name of the emerging research trend."),
        description: z.string().describe("A brief (1-2 sentence) description of this emerging trend and why it's notable.")
    }))
    .min(1).max(2)
    .describe(
      'A list of 1-2 emerging or novel areas of research that appear to be gaining traction.'
    ),
  areasOfDebate: z
     .array(z.object({
        topic: z.string().describe("The topic of debate or contradiction."),
        description: z.string().describe("A brief (1-2 sentence) description of the conflicting findings.")
    }))
    .min(1).max(2)
    .describe(
      'A list of 1-2 key contradictions or areas of high debate that a manager should be aware of.'
    ),
});
export type GetResearchOverviewOutput = z.infer<typeof GetResearchOverviewOutputSchema>;

export async function getResearchOverview(
  input: GetResearchOverviewInput
): Promise<GetResearchOverviewOutput> {
  return getResearchOverviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getResearchOverviewPrompt',
  input: {schema: GetResearchOverviewInputSchema},
  output: {schema: GetResearchOverviewOutputSchema},
  prompt: `You are a senior research analyst for NASA's Biological and Physical Sciences Division.
Your task is to provide a high-level strategic briefing based on the summaries of a large collection of publications.
Do not cite individual papers. Your analysis should be a meta-level synthesis of the entire corpus.

**Analysis Task:**
Based on all the provided publications, generate the following insights:

1.  **Dominant Research Themes:** Identify the 3 or 4 most prominent, well-established themes that appear consistently across many publications. For each theme, provide a 1-2 sentence description of its significance.

2.  **Emerging Trends:** Identify 1 or 2 novel or niche research areas that are beginning to appear more recently or represent a new direction. For each trend, briefly describe what it is and why it's notable.

3.  **Key Areas of Debate:** Identify 1 or 2 significant topics where you see conflicting findings or high potential for scientific debate. This is not about 'gaps' but about 'disagreements' implied by the collection of summaries. For each, describe the topic and the nature of the contradiction.

Provide your output strictly in the requested JSON format.

**Publications:**
{{#each publications}}
- {{{title}}}: {{{summary}}}
---
{{/each}}
  `,
});

const getResearchOverviewFlow = ai.defineFlow(
  {
    name: 'getResearchOverviewFlow',
    inputSchema: GetResearchOverviewInputSchema,
    outputSchema: GetResearchOverviewOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
