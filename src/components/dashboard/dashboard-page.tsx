import { publications } from '@/lib/publications';
import { DashboardLayout } from './dashboard-layout';

export default async function DashboardPage() {
  // In a real app, this would fetch from Firestore or another database
  const allPublications = publications;
  
  // Extract all unique concepts for filtering UI
  const allConcepts = [...new Set(allPublications.flatMap(p => p.keyConcepts ?? []))].sort();

  return <DashboardLayout publications={allPublications} concepts={allConcepts} />;
}
