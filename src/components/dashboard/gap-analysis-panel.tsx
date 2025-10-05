'use client';

import { useDashboard } from '@/hooks/use-dashboard';
import { Button } from '@/components/ui/button';
import { runGapAnalysis } from '@/app/actions';
import { useTransition } from 'react';
import { Lightbulb, AlertTriangle, Loader2, WandSparkles } from 'lucide-react';
import { Separator } from '../ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function GapAnalysisPanel() {
  const { filteredPublications, analysisResult, setAnalysisResult, userRole } = useDashboard();
  const [isPending, startTransition] = useTransition();

  const handleAnalysis = () => {
    startTransition(async () => {
      const result = await runGapAnalysis(filteredPublications);
      setAnalysisResult(result);
    });
  };

  if (userRole === 'Manager') return null;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-headline text-lg font-semibold flex items-center gap-2">
            <WandSparkles className="w-5 h-5 text-primary" />
            AI Gap Analysis
        </h2>
      </div>
      <div className="p-4 flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Based on the <strong>{filteredPublications.length}</strong> currently filtered publications, the AI can identify potential knowledge gaps and conflicting findings.
        </p>
        <Button onClick={handleAnalysis} disabled={isPending || filteredPublications.length < 2}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze for Gaps'
          )}
        </Button>
        {filteredPublications.length < 2 && !isPending && (
          <p className="text-xs text-center text-muted-foreground">Select at least two publications to perform analysis.</p>
        )}
      </div>

      <Separator />
      
      <div className="flex-1 p-4 min-h-0">
        <div className="space-y-4 pr-2 h-full">
          {isPending && !analysisResult && (
               <div className="text-center text-muted-foreground py-10">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  <p className="mt-2">AI is analyzing the data...</p>
            </div>
          )}
          {analysisResult ? (
            <>
               <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Synthesis</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysisResult.synthesis}</p>
              </div>

              <Separator/>

              <Accordion type="multiple" defaultValue={['gaps', 'conflicts']} className="w-full">
                <AccordionItem value="gaps">
                  <AccordionTrigger>
                      <div className="flex items-center gap-2 text-base font-semibold">
                          <Lightbulb className="w-5 h-5 text-accent" />
                          Knowledge Gaps ({analysisResult.knowledgeGaps.length})
                      </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {analysisResult.knowledgeGaps.length > 0 ? (
                        <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-5 mt-2">
                            {analysisResult.knowledgeGaps.map((gap, i) => <li key={`gap-${i}`}>{gap}</li>)}
                        </ul>
                    ) : <p className="text-sm text-muted-foreground px-4 py-2">No specific knowledge gaps identified.</p>}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="conflicts">
                  <AccordionTrigger>
                      <div className="flex items-center gap-2 text-base font-semibold">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                          Conflicting Findings ({analysisResult.conflictingFindings.length})
                      </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {analysisResult.conflictingFindings.length > 0 ? (
                        <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-5 mt-2">
                            {analysisResult.conflictingFindings.map((conflict, i) => <li key={`conflict-${i}`}>{conflict}</li>)}
                        </ul>
                    ) : <p className="text-sm text-muted-foreground px-4 py-2">No conflicting findings identified.</p>}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </>
          ) : (
              !isPending && (
                  <div className="text-center text-muted-foreground py-10">
                      <p>Analysis results will appear here.</p>
                  </div>
              )
          )}
        </div>
      </div>
    </div>
  );
}
