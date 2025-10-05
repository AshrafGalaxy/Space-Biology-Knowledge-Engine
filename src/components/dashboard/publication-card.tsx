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
import { useDashboard } from '@/hooks/use-dashboard.tsx';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';

interface PublicationCardProps {
  publication: Publication;
}

export function PublicationCard({ publication }: PublicationCardProps) {
  const { setSelectedPublicationId } = useDashboard();
  
  return (
    <Card 
      className="flex flex-col h-full bg-secondary/30 hover:bg-secondary/60 hover:shadow-primary/10 hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer group"
      onClick={() => setSelectedPublicationId(publication.id)}
    >
      <CardHeader>
        <CardTitle className="text-base font-headline leading-snug group-hover:text-primary transition-colors">
          {publication.title}
        </CardTitle>
        <CardDescription className="text-xs">
          {publication.authors.slice(0,2).join(', ')}{publication.authors.length > 2 ? ' et al.' : ''} &bull; {publication.publicationDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {publication.summary}
        </p>
      </CardContent>
      <CardFooter className="flex-wrap gap-2 pt-4">
        <div className="flex-grow flex flex-wrap gap-2">
          {publication.keyConcepts.slice(0, 3).map((concept) => (
            <Badge key={concept} variant="secondary">{concept}</Badge>
          ))}
          {publication.keyConcepts.length > 3 && (
              <Badge variant="outline">+{publication.keyConcepts.length - 3} more</Badge>
          )}
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
      </CardFooter>
    </Card>
  );
}
