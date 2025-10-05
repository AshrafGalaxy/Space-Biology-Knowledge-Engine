'use server';

/**
 * @fileOverview Performs a detailed analysis of a single scientific publication.
 *
 * - analyzePublication - A function that orchestrates the analysis.
 * - AnalyzePublicationInput - The input type for the function.
 * - AnalyzePublicationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePublicationInputSchema = z.object({
  title: z.string().describe('The title of the publication.'),
  summary: z.string().describe('The summary of the publication.'),
});
export type AnalyzePublicationInput = z.infer<typeof AnalyzePublicationInputSchema>;

const AnalyzePublicationOutputSchema = z.object({
  scientificNovelty: z
    .string()
    .describe(
      'A short paragraph explaining what was new or groundbreaking about this study at the time it was published.'
    ),
  keyMethodologies: z
    .array(z.string())
    .describe(
      'A list of the specific experimental techniques, technologies, and primary methods used in the study.'
    ),
  potentialImpact: z
    .string()
    .describe(
      'A brief analysis of the potential or realized impact of this research on future space missions, the scientific field, or technology development.'
    ),
});
export type AnalyzePublicationOutput = z.infer<typeof AnalyzePublicationOutputSchema>;


export async function analyzePublication(
  input: AnalyzePublicationInput
): Promise<AnalyzePublicationOutput> {
  return analyzePublicationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePublicationPrompt',
  input: {schema: AnalyzePublicationInputSchema},
  output: {schema: AnalyzePublicationOutputSchema},
  prompt: `You are an expert research analyst tasked with providing a deep analysis of a scientific publication based on its title and summary.

**Publication Details:**
- **Title:** {{{title}}}
- **Summary:** {{{summary}}}

**Your Task:**
Based *only* on the provided title and summary, generate the following analysis:

1.  **Scientific Novelty:** In a short paragraph, explain what was likely new, groundbreaking, or unique about this study. What specific contribution did it make to its field?

2.  **Key Methodologies:** Identify and list the key experimental techniques, technologies, or primary methods mentioned or implied in the summary.

3.  **Potential Impact:** Briefly analyze the potential or realized impact of this research. How might it influence future space missions, advance the scientific field, or lead to new technology?

Provide your output in the requested JSON format.
`,
});

const analyzePublicationFlow = ai.defineFlow(
  {
    name: 'analyzePublicationFlow',
    inputSchema: AnalyzePublicationInputSchema,
    outputSchema: AnalyzePublicationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
