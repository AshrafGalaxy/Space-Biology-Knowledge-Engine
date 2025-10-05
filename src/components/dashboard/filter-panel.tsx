'use client';

import { useDashboard } from '@/hooks/use-dashboard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Search, BrainCircuit, X } from 'lucide-react';
import { Badge } from '../ui/badge';

export function FilterPanel() {
  const { concepts, activeConcepts, toggleConcept, searchTerm, setSearchTerm, clearFilters } = useDashboard();

  return (
    <aside className="w-full md:w-80 lg:w-96 border-r flex flex-col bg-card/50">
      <div className="p-4 border-b">
        <h2 className="font-headline text-lg font-semibold flex items-center gap-2">
          <BrainCircuit className="w-5 h-5" />
          Explore Concepts
        </h2>
      </div>
      
      <div className="p-4 space-y-6">
        <div>
          <Label htmlFor="search" className="text-sm font-medium">Semantic Search</Label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="e.g., 'immune response in microgravity'"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div>
            <div className="flex justify-between items-center mb-2">
                <Label className="text-sm font-medium">Filter by Key Concepts</Label>
                {activeConcepts.size > 0 && (
                    <Badge variant="secondary" className="font-normal">{activeConcepts.size} selected</Badge>
                )}
            </div>
          <ScrollArea className="h-96 rounded-md border">
            <div className="p-4">
              {concepts.map((concept) => (
                <div key={concept} className="flex items-center space-x-2 mb-3">
                  <Checkbox
                    id={concept}
                    checked={activeConcepts.has(concept)}
                    onCheckedChange={() => toggleConcept(concept)}
                  />
                  <Label htmlFor={concept} className="font-normal cursor-pointer text-sm">
                    {concept}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
       <div className="mt-auto p-4 border-t">
        <Button onClick={clearFilters} variant="outline" className="w-full" disabled={!searchTerm && activeConcepts.size === 0}>
            <X className="mr-2 h-4 w-4" /> Clear Filters
        </Button>
      </div>
    </aside>
  );
}
