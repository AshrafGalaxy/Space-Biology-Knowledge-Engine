'use client';

import { useDashboard, DashboardProvider } from '@/hooks/use-dashboard.tsx';
import { Header } from './header';
import { FilterPanel } from './filter-panel';
import { PublicationList } from './publication-list';
import { KnowledgeGraph } from './knowledge-graph';
import { GapAnalysisPanel } from './gap-analysis-panel';
import PublicationDetailDialog from './publication-detail-dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { useState } from 'react';
import ResearchTimeline from './research-timeline';
import ComparisonPanel from './comparison-panel';
import { Card } from '../ui/card';

function DashboardView() {
  const { userRole, isFiltered } = useDashboard();
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

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
          <SheetContent side="left" className="lg:hidden p-0 w-80 flex flex-col">
             <SheetHeader className="p-4 border-b">
               <SheetTitle className="text-lg font-semibold">Filter and Explore</SheetTitle>
            </SheetHeader>
            <FilterPanel />
          </SheetContent>
        </Sheet>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-4 lg:p-8 pt-6">
            {(userRole === 'Scientist' || userRole === 'Mission Architect') && (
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <KnowledgeGraph />
                  <Card>
                    <GapAnalysisPanel />
                  </Card>
                </div>
            )}

            <ResearchTimeline />
            <PublicationList title={isFiltered ? 'Filtered Publications' : 'All Publications'} />
          </div>
        </main>
      </div>
      <PublicationDetailDialog />
      <ComparisonPanel />
    </div>
  );
}

export function DashboardLayout({ 
  publications,
  concepts,
  minYear,
  maxYear,
}: { 
  publications: any[],
  concepts: string[],
  minYear: number,
  maxYear: number,
}) {
  return (
    <DashboardProvider 
      publications={publications} 
      concepts={concepts}
      minYear={minYear}
      maxYear={maxYear}
    >
      <DashboardView />
    </DashboardProvider>
  );
}
