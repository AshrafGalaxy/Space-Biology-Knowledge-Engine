'use client';

import { useDashboard } from '@/hooks/use-dashboard.tsx';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Search, BrainCircuit, X, Calendar } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';

export function FilterPanel() {
  const { 
    concepts, 
    activeConcepts, 
    toggleConcept, 
    searchTerm, 
    setSearchTerm, 
    clearFilters, 
    yearRange,
    setYearRange,
    minYear,
    maxYear,
    isFiltered
  } = useDashboard();

  return (
    <aside className="w-full md:w-72 lg:w-80 border-r flex flex-col bg-background/30 h-full">
      <div className="p-4 border-b flex-shrink-0">
        <h2 className="font-headline text-lg font-semibold flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-primary" />
          Explore & Filter
        </h2>
      </div>
      
      <ScrollArea className="flex-grow">
        <div className="p-4 space-y-6">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search publications..."
                className="pl-10 bg-muted/40 focus:bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
              <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Publication Year
                  </Label>
                   <Badge variant="secondary" className="font-normal">{yearRange[0]} - {yearRange[1]}</Badge>
              </div>
               <Slider
                  min={minYear}
                  max={maxYear}
                  step={1}
                  value={[yearRange[0], yearRange[1]]}
                  onValueChange={(newRange) => setYearRange([newRange[0], newRange[1]])}
                  className="w-full"
              />
          </div>

          <div>
              <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-medium">Key Concepts</Label>
                  {activeConcepts.size > 0 && (
                      <Badge variant="secondary" className="font-normal">{activeConcepts.size} selected</Badge>
                  )}
              </div>
            <div className="h-96 rounded-md border p-4 space-y-3">
              <ScrollArea className="h-full">
                {concepts.map((concept) => (
                  <div key={concept} className="flex items-center space-x-2 mb-2 last:mb-0">
                    <Checkbox
                      id={concept}
                      checked={activeConcepts.has(concept)}
                      onCheckedChange={() => toggleConcept(concept)}
                      disabled={!activeConcepts.has(concept) && activeConcepts.size >= 3}
                    />
                    <Label 
                      htmlFor={concept} 
                      className="font-normal cursor-pointer text-sm leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {concept}
                    </Label>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>
        </div>
      </ScrollArea>

       <div className="mt-auto p-4 border-t flex-shrink-0">
        <Button onClick={clearFilters} variant="outline" className="w-full" disabled={!isFiltered}>
            <X className="mr-2 h-4 w-4" /> Clear All Filters
        </Button>
      </div>
    </aside>
  );
}
