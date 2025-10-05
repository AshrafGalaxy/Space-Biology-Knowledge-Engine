'use client';

import { useDashboard } from '@/hooks/use-dashboard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { ExternalLink, Users, Calendar, Book } from 'lucide-react';

export default function PublicationDetailDialog() {
  const { selectedPublication, setSelectedPublicationId } = useDashboard();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedPublicationId(null);
    }
  };

  if (!selectedPublication) return null;

  return (
    <Dialog open={!!selectedPublication} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl pr-8">{selectedPublication.title}</DialogTitle>
          <DialogDescription className="space-y-2 pt-2">
             <div className="flex items-center text-xs text-muted-foreground gap-4">
                <span className="flex items-center gap-1.5"><Users size={14} /> {selectedPublication.authors.join(', ')}</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} /> {selectedPublication.publicationDate}</span>
                <span className="flex items-center gap-1.5"><Book size={14} /> {selectedPublication.journal}</span>
             </div>
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow my-4">
            <div className="pr-6 space-y-6">
                <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Summary</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{selectedPublication.summary}</p>
                </div>
                
                <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Key Concepts</h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedPublication.keyConcepts.map((concept) => (
                            <Badge key={concept} variant="secondary">{concept}</Badge>
                        ))}
                    </div>
                </div>
            </div>
        </ScrollArea>
        <div className="mt-auto flex-shrink-0 pt-4">
             <a
                href={`https://doi.org/${selectedPublication.doi}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Publication
                </Button>
            </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
