'use client';

import { useDashboard } from '@/hooks/use-dashboard';
import { PublicationCard } from './publication-card';

export function PublicationList({ title }: { title: string }) {
  const { filteredPublications } = useDashboard();

  return (
    <div>
        <h2 className="font-headline text-2xl mb-4">
            {title} ({filteredPublications.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
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
    </div>
  );
}
