'use client';

import type { Publication } from '@/types';
import { DashboardProvider, useDashboard } from '@/hooks/use-dashboard';
import { Header } from './header';
import { FilterPanel } from './filter-panel';
import { PublicationList } from './publication-list';
import { KnowledgeGraph } from './knowledge-graph';
import { GapAnalysisPanel } from './gap-analysis-panel';
import PublicationDetailDialog from './publication-detail-dialog';
import { Card, CardContent } from '../ui/card';

function DashboardView() {
  const { userRole } = useDashboard();

  const roleBasedLayout = () => {
    switch (userRole) {
      case 'Scientist':
        return (
          <>
            <FilterPanel />
            <main className="flex-1 flex flex-col gap-6 overflow-y-auto p-4 lg:p-6">
              <KnowledgeGraph />
              <PublicationList />
            </main>
            <GapAnalysisPanel />
          </>
        );
      case 'Manager':
        return (
          <>
            <FilterPanel />
            <main className="flex-1 flex flex-col gap-6 overflow-y-auto p-4 lg:p-6">
               <Card>
                <CardContent className="p-6">
                  <h2 className="font-headline text-2xl mb-4">Publication Overview</h2>
                  <p className="text-muted-foreground">Manager view focuses on high-level summaries and trends. The knowledge graph and deep analysis tools are streamlined for quick insights.</p>
                </CardContent>
              </Card>
              <PublicationList />
            </main>
          </>
        );
      case 'Mission Architect':
        return (
          <>
            <FilterPanel />
            <main className="flex-1 flex flex-col gap-6 overflow-y-auto p-4 lg:p-6">
              <KnowledgeGraph />
            </main>
            <GapAnalysisPanel />
          </>
        );
      default:
        return <PublicationList />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background font-body">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {roleBasedLayout()}
      </div>
      <PublicationDetailDialog />
    </div>
  );
}

export function DashboardLayout({ 
  publications,
  concepts 
}: { 
  publications: Publication[],
  concepts: string[],
}) {
  return (
    <DashboardProvider publications={publications} concepts={concepts}>
      <DashboardView />
    </DashboardProvider>
  );
}
