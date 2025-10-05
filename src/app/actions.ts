'use server';

import { identifyKnowledgeGaps } from '@/ai/flows/identify-knowledge-gaps';
import type { IdentifyKnowledgeGapsOutput } from '@/ai/flows/identify-knowledge-gaps';

export async function runGapAnalysis(summaries: string[]): Promise<IdentifyKnowledgeGapsOutput> {
  if (summaries.length === 0) {
    return {
      knowledgeGaps: "Not enough data to perform analysis. Please select at least one publication.",
      conflictingFindings: "Not enough data to perform analysis. Please select at least one publication."
    };
  }
  
  try {
    const result = await identifyKnowledgeGaps({ publicationSummaries: summaries });
    return result;
  } catch (error) {
    console.error("Error in gap analysis action:", error);
    return {
      knowledgeGaps: "An error occurred while analyzing knowledge gaps.",
      conflictingFindings: "An error occurred while analyzing conflicting findings."
    };
  }
}
