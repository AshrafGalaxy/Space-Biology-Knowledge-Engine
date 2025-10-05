'use client';

import { useDashboard } from '@/hooks/use-dashboard.tsx';
import { PublicationDataTable } from './publication-data-table';
import { PublicationCard } from './publication-card';
import { Button } from '../ui/button';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PublicationList({ title }: { title: string }) {
  const { filteredPublications, viewMode, setViewMode } = useDashboard();

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="font-headline text-2xl">
                {title} ({filteredPublications.length})
            </h2>
            <div className="flex items-center gap-1">
                <Button 
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                    size="icon" 
                    onClick={() => setViewMode('grid')}
                    className={cn(viewMode === 'grid' && 'text-primary')}
                >
                    <LayoutGrid className="h-5 w-5" />
                </Button>
                <Button 
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                    size="icon" 
                    onClick={() => setViewMode('list')}
                    className={cn(viewMode === 'list' && 'text-primary')}
                >
                    <List className="h-5 w-5" />
                </Button>
            </div>
        </div>

        {filteredPublications.length > 0 ? (
            viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPublications.map((publication) => (
                        <PublicationCard key={publication.id} publication={publication} />
                    ))}
                </div>
            ) : (
                <PublicationDataTable data={filteredPublications} />
            )
        ) : (
          <div className="col-span-full text-center py-16 text-muted-foreground border rounded-lg">
            <p className="font-semibold">No publications found.</p>
            <p className="text-sm">Try adjusting your search or filter criteria.</p>
          </div>
        )}
    </div>
  );
}
