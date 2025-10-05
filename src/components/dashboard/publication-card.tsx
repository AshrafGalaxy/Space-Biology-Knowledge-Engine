'use client';

import type { Publication } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboard } from '@/hooks/use-dashboard';
import { Button } from '../ui/button';

interface PublicationCardProps {
  publication: Publication;
}

export function PublicationCard({ publication }: PublicationCardProps) {
  const { setSelectedPublicationId } = useDashboard();
  
  return (
    <Card className="flex flex-col h-full hover:shadow-lg hover:border-accent transition-all duration-200 cursor-pointer" onClick={() => setSelectedPublicationId(publication.id)}>
      <CardHeader>
        <CardTitle className="text-lg font-headline leading-snug">{publication.title}</CardTitle>
        <CardDescription>
          {publication.authors.join(', ')} &bull; {publication.publicationDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {publication.summary}
        </p>
      </CardContent>
      <CardFooter className="flex-wrap gap-2">
        {publication.keyConcepts.slice(0, 3).map((concept) => (
          <Badge key={concept} variant="secondary">{concept}</Badge>
        ))}
        {publication.keyConcepts.length > 3 && (
            <Badge variant="outline">+{publication.keyConcepts.length - 3} more</Badge>
        )}
      </CardFooter>
    </Card>
  );
}
