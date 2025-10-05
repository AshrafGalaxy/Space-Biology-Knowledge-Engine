'use server';

/**
 * @fileOverview Analyzes a new research proposal against an existing corpus of publications.
 *
 * - proposeResearch - A function that orchestrates the analysis.
 * - ProposeResearchInput - The input type for the function.
 * - ProposeResearchOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PublicationRefSchema = z.object({
  id: z.string().describe('The ID of the publication.'),
  title: z.string().describe('The title of the publication.'),
  reason: z.string().describe("A brief explanation of why this publication is relevant (e.g., supportive or contradictory).")
});

const ProposeResearchInputSchema = z.object({
  researchIdea: z.string().min(20).describe('A detailed description of the proposed research idea.'),
  publications: z.array(z.object({
    id: z.string(),
    title: z.string(),
    summary: z.string()
  })).describe("A list of existing publications to compare against.")
});
export type ProposeResearchInput = z.infer<typeof ProposeResearchInputSchema>;


const ProposeResearchOutputSchema = z.object({
  supportingPublications: z.array(PublicationRefSchema).max(3).describe('A list of up to 3 publications that most directly support the proposed idea.'),
  contradictoryPublications: z.array(PublicationRefSchema).max(2).describe('A list of up to 2 publications that may challenge or contradict the proposed idea.'),
  noveltyStatement: z.string().describe("A brief (2-3 sentence) statement on what makes the proposed research novel in the context of the provided literature."),
  suggestedNextSteps: z.array(z.string()).max(4).describe("A list of 3-4 concrete, actionable next steps for a researcher to validate or begin work on this idea."),
});
export type ProposeResearchOutput = z.infer<typeof ProposeResearchOutputSchema>;

export async function proposeResearch(
  input: ProposeResearchInput
): Promise<ProposeResearchOutput> {
  return proposeResearchFlow(input);
}


const prompt = ai.definePrompt({
  name: 'proposeResearchPrompt',
  input: {schema: ProposeResearchInputSchema},
  output: {schema: ProposeResearchOutputSchema},
  prompt: `You are an expert research strategist and scientific advisor for NASA.
Your task is to analyze a new research proposal and evaluate it against a corpus of existing publications.

**The New Research Proposal:**
"{{{researchIdea}}}"

**Existing Research Corpus:**
{{#each publications}}
- **ID:** {{{id}}}
  **Title:** {{{title}}}
  **Summary:** {{{summary}}}
---
{{/each}}

**Your Analysis Task:**
Based on the proposal and the entire corpus, provide the following structured analysis:

1.  **Supporting Publications:** Identify the top 3 publications from the corpus that are most relevant or supportive of the new proposal. For each, explain *why* it is supportive.

2.  **Contradictory Publications:** Identify up to 2 publications that might challenge, contradict, or present findings that the new proposal would need to address. For each, explain the potential conflict. If none, return an empty array.

3.  **Novelty Statement:** In 2-3 sentences, articulate what is novel about this proposal. What unique question does it ask, or what new approach does it take compared to the existing literature?

4.  **Suggested Next Steps:** Provide a list of 3-4 concrete, actionable next steps or key experiments a researcher could perform to begin validating this proposal.

Provide your output strictly in the requested JSON format.
`,
});

const proposeResearchFlow = ai.defineFlow(
  {
    name: 'proposeResearchFlow',
    inputSchema: ProposeResearchInputSchema,
    outputSchema: ProposeResearchOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
