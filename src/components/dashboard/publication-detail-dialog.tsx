
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
import { ExternalLink, WandSparkles, TestTube, Target, Lightbulb, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { runPublicationAnalysis } from '@/app/actions';
import type { PublicationAnalysis } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Separator } from '../ui/separator';

export default function PublicationDetailDialog() {
  const { selectedPublication, setSelectedPublicationId, filterByConcept } = useDashboard();
  const [analysis, setAnalysis] = useState<PublicationAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisTriggered, setAnalysisTriggered] = useState(false);

  useEffect(() => {
    // Reset state when the publication changes
    if (selectedPublication) {
      setAnalysis(null);
      setAnalysisTriggered(false);
      setIsLoading(false);
    }
  }, [selectedPublication]);
  
  const handleAnalysisClick = async () => {
    if (!selectedPublication) return;
    setIsLoading(true);
    setAnalysisTriggered(true);
    const result = await runPublicationAnalysis(selectedPublication);
    setAnalysis(result);
    setIsLoading(false);
  };


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
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow my-4 -mr-6">
            <div className="pr-6 space-y-6">
                <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Summary</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{selectedPublication.summary}</p>
                </div>
                
                <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Key Concepts</h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedPublication.keyConcepts.map((concept) => (
                            <Button 
                              key={concept} 
                              variant="secondary" 
                              size="sm"
                              className="h-auto"
                              onClick={() => filterByConcept(concept)}
                            >
                              {concept}
                            </Button>
                        ))}
                    </div>
                </div>

                <Separator />
                
                <div className="space-y-4">
                    <h2 className="font-semibold text-foreground flex items-center gap-2">
                        <WandSparkles className="h-5 w-5 text-primary" />
                        AI-Powered Analysis
                    </h2>
                    {!analysisTriggered && (
                       <Button onClick={handleAnalysisClick} disabled={isLoading}>
                         {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                         ) : (
                            <WandSparkles className="mr-2 h-4 w-4" />
                         )}
                         Analyze Publication
                       </Button>
                    )}
                    {isLoading && (
                         <div className="flex items-center justify-center py-8 text-muted-foreground">
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            <span>AI is analyzing the publication...</span>
                        </div>
                    )}
                    {analysis && !isLoading && (
                        <Accordion type="multiple" defaultValue={['novelty', 'methods', 'impact']} className="w-full">
                            <AccordionItem value="novelty">
                                <AccordionTrigger className="text-base">
                                    <div className="flex items-center gap-2">
                                        <Lightbulb className="h-5 w-5"/>
                                        Scientific Novelty
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {analysis.scientificNovelty}
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="methods">
                                <AccordionTrigger className="text-base">
                                    <div className="flex items-center gap-2">
                                        <TestTube className="h-5 w-5"/>
                                        Key Methodologies
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                        {analysis.keyMethodologies.map((method, i) => (
                                            <li key={i}>{method}</li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="impact">
                                <AccordionTrigger className="text-base">
                                     <div className="flex items-center gap-2">
                                        <Target className="h-5 w-5"/>
                                        Potential Impact
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {analysis.potentialImpact}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )}
                </div>
            </div>
        </ScrollArea>
        <div className="mt-auto flex-shrink-0 pt-4">
             <a
                href={selectedPublication.link}
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
