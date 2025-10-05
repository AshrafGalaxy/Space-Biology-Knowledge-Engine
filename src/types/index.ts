export type Publication = {
  id: string;
  title: string;
  link: string;
  summary: string;
  keyConcepts: string[];
  publicationYear: number;
};

export type UserRole = 'Scientist' | 'Manager' | 'Mission Architect';

export type GapAnalysisResult = {
  synthesis: string;
  knowledgeGaps: string[];
  conflictingFindings: string[];
} | null;

export type PublicationAnalysis = {
  scientificNovelty: string;
  keyMethodologies: string[];
  potentialImpact: string;
} | null;

export type ResearchProposalAnalysis = {
  supportingPublications: { id: string, title: string, reason: string }[];
  contradictoryPublications: { id: string, title: string, reason: string }[];
  noveltyStatement: string;
  suggestedNextSteps: string[];
} | null;

export type SortingState = {
  id: string;
  desc: boolean;
};
