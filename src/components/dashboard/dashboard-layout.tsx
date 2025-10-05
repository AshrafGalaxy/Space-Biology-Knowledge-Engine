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
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { WandSparkles } from 'lucide-react';
import { useState } from 'react';

function DashboardView() {
  const { userRole, filteredPublications } = useDashboard();
  const [isAnalysisPanelOpen, setAnalysisPanelOpen] = useState(false);


  const roleBasedLayout = () => {
    switch (userRole) {
      case 'Scientist':
        return (
          <>
            <FilterPanel />
            <main className="flex-1 flex flex-col gap-6 overflow-y-auto p-4 lg:p-6">
              <div className="flex justify-between items-center">
                 <h2 className="font-headline text-2xl">
                    Filtered Publications ({filteredPublications.length})
                </h2>
                <Sheet open={isAnalysisPanelOpen} onOpenChange={setAnalysisPanelOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline">
                      <WandSparkles className="mr-2 h-4 w-4" />
                      AI Gap Analysis
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full md:w-[450px] sm:max-w-none flex flex-col p-0">
                    <GapAnalysisPanel onClose={() => setAnalysisPanelOpen(false)}/>
                  </SheetContent>
                </Sheet>
              </div>
              <KnowledgeGraph />
              <PublicationList />
            </main>
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
               <h2 className="font-headline text-2xl">
                Filtered Publications ({filteredPublications.length})
              </h2>
              <PublicationList />
            </main>
          </>
        );
      case 'Mission Architect':
         return (
          <>
            <FilterPanel />
            <main className="flex-1 flex flex-col gap-6 overflow-y-auto p-4 lg:p-6">
              <div className='flex justify-end'>
                 <Sheet open={isAnalysisPanelOpen} onOpenChange={setAnalysisPanelOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline">
                        <WandSparkles className="mr-2 h-4 w-4" />
                        AI Gap Analysis
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full md:w-[450px] sm:max-w-none flex flex-col p-0">
                      <GapAnalysisPanel onClose={() => setAnalysisPanelOpen(false)}/>
                    </SheetContent>
                  </Sheet>
              </div>
              <KnowledgeGraph />
            </main>
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
