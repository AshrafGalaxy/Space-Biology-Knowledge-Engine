'use server';

/**
 * @fileOverview Identifies potential knowledge gaps and conflicting findings based on summarized publication content.
 *
 * - identifyKnowledgeGaps - A function that identifies knowledge gaps and conflicting findings.
 * - IdentifyKnowledgeGapsInput - The input type for the identifyKnowledgeGaps function.
 * - IdentifyKnowledgeGapsOutput - The return type for the identifyKnowledgeGgaps function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PublicationDetailSchema = z.object({
  title: z.string().describe('The title of the publication.'),
  summary: z.string().describe('The summary of the publication.'),
  keyConcepts: z.array(z.string()).describe('A list of key concepts from the publication.'),
});

const IdentifyKnowledgeGapsInputSchema = z.object({
  publications: z
    .array(PublicationDetailSchema)
    .describe('An array of publication details to be analyzed.'),
});
export type IdentifyKnowledgeGapsInput = z.infer<typeof IdentifyKnowledgeGapsInputSchema>;

const IdentifyKnowledgeGapsOutputSchema = z.object({
  synthesis: z.string().describe('A high-level synthesis of the analyzed publications.'),
  knowledgeGaps: z
    .array(z.string())
    .describe('A list of specific, actionable knowledge gaps identified from the publications.'),
  conflictingFindings: z
    .array(z.string())
    .describe('A list of specific conflicting findings or contradictions between the publications.'),
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
  prompt: `You are an expert research analyst specializing in synthesizing scientific literature and identifying future research directions.

  Analyze the following publications to identify thematic connections, potential knowledge gaps, and conflicting findings.

  **Publications:**
  {{#each publications}}
  - **Title:** {{{title}}}
    **Summary:** {{{summary}}}
    **Key Concepts:** {{#each keyConcepts}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  ---
  {{/each}}

  **Analysis Task:**

  1.  **Synthesis:** Provide a brief, high-level synthesis of the main themes and research areas covered by these publications.
  2.  **Knowledge Gaps:** Identify specific, actionable areas where research is thin or missing. What questions are left unanswered? What are the logical next steps for research in this area? Frame these as a list of distinct points.
  3.  **Conflicting Findings:** Pinpoint any direct or indirect contradictions between the findings or conclusions of the publications. Highlight where the research presents conflicting evidence. Frame these as a list of distinct points.
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
