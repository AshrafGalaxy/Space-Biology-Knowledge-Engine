'use server';

/**
 * @fileOverview A NASA bioscience publication summarization AI agent.
 *
 * - summarizePublication - A function that handles the summarization process.
 * - SummarizePublicationInput - The input type for the summarizePublication function.
 * - SummarizePublicationOutput - The return type for the summarizePublication function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePublicationInputSchema = z.object({
  content: z
    .string()
    .describe("The full content of the NASA bioscience publication."),
});
export type SummarizePublicationInput = z.infer<typeof SummarizePublicationInputSchema>;

const SummarizePublicationOutputSchema = z.object({
  summary: z.string().describe('A concise and informative summary of the publication.'),
});
export type SummarizePublicationOutput = z.infer<typeof SummarizePublicationOutputSchema>;

export async function summarizePublication(input: SummarizePublicationInput): Promise<SummarizePublicationOutput> {
  return summarizePublicationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePublicationPrompt',
  input: {schema: SummarizePublicationInputSchema},
  output: {schema: SummarizePublicationOutputSchema},
  prompt: `You are an expert in summarizing NASA bioscience publications.

  Given the full content of a publication, your task is to generate a concise and informative summary that captures the core content and key findings.

  Content: {{{content}}}`,
});

const summarizePublicationFlow = ai.defineFlow(
  {
    name: 'summarizePublicationFlow',
    inputSchema: SummarizePublicationInputSchema,
    outputSchema: SummarizePublicationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
