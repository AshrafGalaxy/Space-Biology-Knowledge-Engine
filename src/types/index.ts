export type Publication = {
  id: string;
  title: string;
  link: string;
  summary: string;
  keyConcepts: string[];
};

export type UserRole = 'Scientist' | 'Manager' | 'Mission Architect';

export type GapAnalysisResult = {
  knowledgeGaps: string;
  conflictingFindings: string;
} | null;
