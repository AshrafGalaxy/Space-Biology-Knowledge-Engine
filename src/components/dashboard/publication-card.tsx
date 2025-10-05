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
import { ArrowRight, CheckSquare, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

interface PublicationCardProps {
  publication: Publication;
}

export function PublicationCard({ publication }: PublicationCardProps) {
  const { setSelectedPublicationId, comparisonSet, toggleComparison } = useDashboard();
  const isSelectedForCompare = comparisonSet.has(publication.id);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent dialog from opening if the click was on the checkbox or its label
    const target = e.target as HTMLElement;
    if (target.closest('.compare-checkbox-area')) {
      return;
    }
    setSelectedPublicationId(publication.id);
  };
  
  return (
    <Card 
      className={cn(
        "flex flex-col h-full bg-secondary/30 transition-all duration-200 group relative",
        isSelectedForCompare 
          ? "border-primary/80 shadow-primary/20 shadow-lg" 
          : "hover:bg-secondary/60 hover:shadow-primary/10 hover:shadow-lg hover:border-primary/50"
      )}
    >
      <div 
          className="absolute top-3 right-3 z-10 compare-checkbox-area flex items-center space-x-2"
          onClick={(e) => {
              e.stopPropagation();
              toggleComparison(publication.id);
          }}
      >
          <Checkbox
              id={`compare-${publication.id}`}
              checked={isSelectedForCompare}
              aria-label="Select for comparison"
              className="h-5 w-5"
          />
          <Label htmlFor={`compare-${publication.id}`} className="text-xs text-muted-foreground font-normal sr-only">
              Compare
          </Label>
      </div>

      <div onClick={handleCardClick} className="cursor-pointer h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-base font-headline leading-snug group-hover:text-primary transition-colors pr-10">
            {publication.title}
          </CardTitle>
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
      </div>
    </Card>
  );
}
