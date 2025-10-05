'use client';

import type { Publication } from '@/types';
import { DashboardProvider, useDashboard } from '@/hooks/use-dashboard.tsx';
import { Header } from './header';
import { FilterPanel } from './filter-panel';
import { PublicationList } from './publication-list';
import { KnowledgeGraph } from './knowledge-graph';
import { GapAnalysisPanel } from './gap-analysis-panel';
import PublicationDetailDialog from './publication-detail-dialog';
import { Card, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';

function DashboardView() {
  const { userRole, filteredPublications } = useDashboard();

  const roleBasedLayout = () => {
    const mainContent = (
      <ScrollArea className="h-full">
        <div className="flex-1 space-y-6 p-4 lg:p-8 pt-6">
          {userRole === 'Manager' && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-headline text-2xl mb-4">Publication Overview</h2>
                <p className="text-muted-foreground">Manager view focuses on high-level summaries and trends. The knowledge graph and deep analysis tools are streamlined for quick insights.</p>
              </CardContent>
            </Card>
          )}

          {(userRole === 'Scientist' || userRole === 'Mission Architect') && <KnowledgeGraph />}
          
          <h2 className="font-headline text-2xl">
              Filtered Publications ({filteredPublications.length})
          </h2>
          <PublicationList />
        </div>
      </ScrollArea>
    );

    const rightPanel = (
       <aside className="w-full lg:w-[400px] xl:w-[450px] border-l flex flex-col">
          <GapAnalysisPanel />
        </aside>
    );

    return (
       <div className="flex flex-1 overflow-hidden">
        <FilterPanel />
        <main className="flex-1 flex flex-col min-w-0">
          {mainContent}
        </main>
        {(userRole === 'Scientist' || userRole === 'Mission Architect') && rightPanel}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background font-body">
      <Header />
      {roleBasedLayout()}
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
