'use server';

/**
 * @fileOverview A flow for extracting key concepts from NASA bioscience publications.
 *
 * - extractKeyConcepts - A function that handles the extraction of key concepts from a publication.
 * - ExtractKeyConceptsInput - The input type for the extractKeyConcepts function.
 * - ExtractKeyConceptsOutput - The return type for the extractKeyConcepts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractKeyConceptsInputSchema = z.object({
  publicationText: z.string().describe('The full text content of the NASA bioscience publication.'),
});
export type ExtractKeyConceptsInput = z.infer<typeof ExtractKeyConceptsInputSchema>;

const ExtractKeyConceptsOutputSchema = z.object({
  keyConcepts: z.array(
    z.string().describe('A key concept extracted from the publication.')
  ).describe('An array of key concepts identified in the publication.'),
});
export type ExtractKeyConceptsOutput = z.infer<typeof ExtractKeyConceptsOutputSchema>;

export async function extractKeyConcepts(input: ExtractKeyConceptsInput): Promise<ExtractKeyConceptsOutput> {
  return extractKeyConceptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractKeyConceptsPrompt',
  input: {schema: ExtractKeyConceptsInputSchema},
  output: {schema: ExtractKeyConceptsOutputSchema},
  prompt: `You are an expert in analyzing scientific publications, especially in the field of bioscience.
  Your task is to identify and extract the key concepts from the given NASA bioscience publication text.
  Provide the key concepts as a list of strings.

  Publication Text: {{{publicationText}}}
  \n  Key Concepts:`, 
});

const extractKeyConceptsFlow = ai.defineFlow(
  {
    name: 'extractKeyConceptsFlow',
    inputSchema: ExtractKeyConceptsInputSchema,
    outputSchema: ExtractKeyConceptsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
