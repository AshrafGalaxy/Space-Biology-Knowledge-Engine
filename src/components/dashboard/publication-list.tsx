'use client';

import { useDashboard } from '@/hooks/use-dashboard';
import { PublicationDataTable } from './publication-data-table';

export function PublicationList({ title }: { title: string }) {
  const { filteredPublications } = useDashboard();

  return (
    <div>
        <h2 className="font-headline text-2xl mb-4">
            {title} ({filteredPublications.length})
        </h2>
        {filteredPublications.length > 0 ? (
          <PublicationDataTable data={filteredPublications} />
        ) : (
          <div className="col-span-full text-center py-16 text-muted-foreground border rounded-lg">
            <p className="font-semibold">No publications found.</p>
            <p className="text-sm">Try adjusting your search or filter criteria.</p>
          </div>
        )}
    </div>
  );
}
