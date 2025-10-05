'use server';

import { identifyKnowledgeGaps } from '@/ai/flows/identify-knowledge-gaps';
import type { IdentifyKnowledgeGapsOutput } from '@/ai/flows/identify-knowledge-gaps';
import { comparePublications } from '@/ai/flows/compare-publications';
import type { ComparePublicationsOutput } from '@/ai/flows/compare-publications';
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


export async function runComparisonAnalysis(publications: Publication[]): Promise<ComparePublicationsOutput> {
  if (publications.length < 2) {
    return {
      consensus: ["Not enough publications to compare. Please select at least two."],
      contradictions: []
    };
  }
  
  try {
    const result = await comparePublications({ publications });
    return result;
  } catch (error) {
    console.error("Error in comparison analysis action:", error);
    return {
      consensus: ["Could not analyze for consensus due to a server error."],
      contradictions: ["Could not analyze for contradictions due to a server error."]
    };
  }
}
