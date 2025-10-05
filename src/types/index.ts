export type Publication = {
  id: string;
  title: string;
  authors: string[];
  publicationDate: string;
  journal: string;
  summary: string;
  keyConcepts: string[];
  fullText: string;
  doi: string;
};

export type UserRole = 'Scientist' | 'Manager' | 'Mission Architect';

export type GapAnalysisResult = {
  knowledgeGaps: string;
  conflictingFindings: string;
} | null;
