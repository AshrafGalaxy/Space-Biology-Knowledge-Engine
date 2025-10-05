'use client';

import { useDashboard } from '@/hooks/use-dashboard';
import { PublicationCard } from './publication-card';
import { ScrollArea } from '../ui/scroll-area';

export function PublicationList() {
  const { filteredPublications } = useDashboard();

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 pr-1">
        {filteredPublications.length > 0 ? (
          filteredPublications.map((pub) => (
            <PublicationCard key={pub.id} publication={pub} />
          ))
        ) : (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <p className="font-semibold">No publications found.</p>
            <p className="text-sm">Try adjusting your search or filter criteria.</p>
          </div>
        )}
        </div>
      </ScrollArea>
    </div>
  );
}
