'use server';

import { identifyKnowledgeGaps } from '@/ai/flows/identify-knowledge-gaps';
import type { IdentifyKnowledgeGapsOutput } from '@/ai/flows/identify-knowledge-gaps';
import { comparePublications } from '@/ai/flows/compare-publications';
import type { ComparePublicationsOutput } from '@/ai/flows/compare-publications';
import { analyzePublication } from '@/ai/flows/analyze-publication';
import type { AnalyzePublicationOutput } from '@/ai/flows/analyze-publication';
import { getResearchOverview } from '@/ai/flows/get-research-overview';
import type { GetResearchOverviewOutput } from '@/ai/flows/get-research-overview';
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

export async function runPublicationAnalysis(publication: Publication): Promise<AnalyzePublicationOutput> {
    if (!publication) {
        throw new Error("Publication data is required for analysis.");
    }

    try {
        const result = await analyzePublication({
            title: publication.title,
            summary: publication.summary,
        });
        return result;
    } catch (error) {
        console.error("Error in publication analysis action:", error);
        // Return a structured error response that the client can handle
        return {
            scientificNovelty: "An error occurred while analyzing scientific novelty.",
            keyMethodologies: ["Could not extract methodologies due to a server error."],
            potentialImpact: "An error occurred while analyzing potential impact."
        };
    }
}

export async function runResearchOverview(publications: Pick<Publication, 'title' | 'summary'>[]): Promise<GetResearchOverviewOutput> {
    if (publications.length < 10) { // Arbitrary threshold for a meaningful overview
        throw new Error("Not enough publication data to generate a meaningful overview.");
    }
    
    try {
        const result = await getResearchOverview({ publications });
        return result;
    } catch (error) {
        console.error("Error in research overview action:", error);
        return {
            dominantThemes: [{ theme: "Error", description: "Could not analyze dominant themes due to a server error."}],
            emergingTrends: [{ trend: "Error", description: "Could not analyze emerging trends due to a server error."}],
            areasOfDebate: [{ topic: "Error", description: "Could not analyze areas of debate due to a server error."}],
        };
    }
}
