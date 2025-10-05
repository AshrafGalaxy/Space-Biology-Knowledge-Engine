import { publications } from '@/lib/publications';
import { DashboardLayout } from './dashboard-layout';
import { extractKeyConcepts } from '@/ai/flows/extract-key-concepts';
import { summarizePublication } from '@/ai/flows/summarize-publication';

export default async function DashboardPage() {
  // In a real app, this would fetch from Firestore or another database
  const allPublications = publications;

  // Augment publications with AI data if summary is a placeholder
  const augmentedPublications = await Promise.all(
    allPublications.map(async (p) => {
      // Use a combination of title and original summary for better context
      const contentForAI = `${p.title}\n\n${p.summary}`;
      
      const [summaryResult, conceptsResult] = await Promise.all([
        summarizePublication({ content: contentForAI }),
        extractKeyConcepts({ publicationText: contentForAI })
      ]);

      return {
        ...p,
        summary: summaryResult.summary,
        keyConcepts: conceptsResult.keyConcepts,
      };
    })
  );
  
  // Extract all unique concepts for filtering UI
  const allConcepts = [...new Set(augmentedPublications.flatMap(p => p.keyConcepts ?? []))].sort();

  return <DashboardLayout publications={augmentedPublications} concepts={allConcepts} />;
}
