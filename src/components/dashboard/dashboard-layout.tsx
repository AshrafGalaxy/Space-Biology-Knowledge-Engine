'use client';

import { useDashboard, DashboardProvider } from '@/hooks/use-dashboard.tsx';
import { Header } from './header';
import { FilterPanel } from './filter-panel';
import { PublicationList } from './publication-list';
import { KnowledgeGraph } from './knowledge-graph';
import { GapAnalysisPanel } from './gap-analysis-panel';
import PublicationDetailDialog from './publication-detail-dialog';
import { Card, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { useState } from 'react';

function DashboardView() {
  const { userRole, isFiltered } = useDashboard();
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const MainContent = () => (
    <div className="flex-1 space-y-6 p-4 lg:p-8 pt-6">
      {userRole === 'Manager' && (
        <Card>
          <CardContent className="p-6">
            <h2 className="font-headline text-2xl mb-4">Publication Overview</h2>
            <p className="text-muted-foreground">Manager view focuses on high-level summaries and trends. The knowledge graph and deep analysis tools are streamlined for quick insights.</p>
          </CardContent>
        </Card>
      )}

      {(userRole === 'Scientist' || userRole === 'Mission Architect') && (
        <KnowledgeGraph />
      )}
      
      <PublicationList title={isFiltered ? 'Filtered Publications' : 'All Publications'} />
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-background font-body">
      <Header onFilterToggle={() => setIsFilterPanelOpen(true)} />
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Desktop Left Panel */}
        <div className="hidden lg:flex lg:w-80 border-r flex-shrink-0">
          <FilterPanel />
        </div>

        {/* Mobile Filter Panel in a Sheet */}
        <Sheet open={isFilterPanelOpen} onOpenChange={setIsFilterPanelOpen}>
          <SheetContent side="left" className="lg:hidden p-0 w-80">
             <SheetHeader className="sr-only">
              <SheetTitle>Filter and Explore Concepts</SheetTitle>
            </SheetHeader>
            <FilterPanel />
          </SheetContent>
        </Sheet>
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
            {/* Desktop: Two-column layout */}
            <div className="hidden lg:flex flex-1 overflow-hidden">
                <ScrollArea className="flex-1">
                    <MainContent />
                </ScrollArea>
                {(userRole === 'Scientist' || userRole === 'Mission Architect') && (
                    <aside className="w-96 border-l flex-shrink-0">
                        <ScrollArea className="h-full">
                            <GapAnalysisPanel />
                        </ScrollArea>
                    </aside>
                )}
            </div>

            {/* Mobile: Single-column layout */}
            <div className="lg:hidden flex-1">
                <ScrollArea className="h-full">
                    <MainContent />
                    {(userRole === 'Scientist' || userRole === 'Mission Architect') && (
                       <div className="p-4 lg:p-8 pt-6 border-t">
                         <GapAnalysisPanel />
                       </div>
                    )}
                </ScrollArea>
            </div>
        </main>
      </div>
      <PublicationDetailDialog />
    </div>
  );
}

export function DashboardLayout({ 
  publications,
  concepts 
}: { 
  publications: any[],
  concepts: string[],
}) {
  return (
    <DashboardProvider publications={publications} concepts={concepts}>
      <DashboardView />
    </DashboardProvider>
  );
}
