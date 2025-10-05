'use server';

import { identifyKnowledgeGaps } from '@/ai/flows/identify-knowledge-gaps';
import type { IdentifyKnowledgeGapsOutput } from '@/ai/flows/identify-knowledge-gaps';
import type { Publication } from '@/types';

export async function runGapAnalysis(publications: Publication[]): Promise<IdentifyKnowledgeGapsOutput> {
  if (publications.length === 0) {
    return {
      synthesis: "Not enough data to perform analysis. Please select at least one publication.",
      knowledgeGaps: [],
      conflictingFindings: []
    };
  }
  
  try {
    const result = await identifyKnowledgeGaps({ publications });
    return result;
  } catch (error) {
    console.error("Error in gap analysis action:", error);
    return {
      synthesis: "An error occurred during analysis.",
      knowledgeGaps: ["Could not analyze knowledge gaps due to a server error."],
      conflictingFindings: ["Could not analyze conflicting findings due to a server error."]
    };
  }
}
