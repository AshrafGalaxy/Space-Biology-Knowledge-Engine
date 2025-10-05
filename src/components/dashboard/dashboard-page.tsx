import { publications } from '@/lib/publications';
import { DashboardLayout } from './dashboard-layout';

export default async function DashboardPage() {
  // In a real app, this would fetch from Firestore or another database
  const allPublications = publications;
  
  // Extract all unique concepts for filtering UI
  const allConcepts = [...new Set(allPublications.flatMap(p => p.keyConcepts ?? []))].sort();

  const publicationYears = allPublications.map(p => p.publicationYear);
  const minYear = Math.min(...publicationYears);
  const maxYear = Math.max(...publicationYears);

  return <DashboardLayout 
            publications={allPublications} 
            concepts={allConcepts} 
            minYear={minYear}
            maxYear={maxYear}
          />;
}
