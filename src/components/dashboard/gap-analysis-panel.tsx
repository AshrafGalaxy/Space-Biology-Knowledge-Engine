'use client';

import { useDashboard } from '@/hooks/use-dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { runGapAnalysis } from '@/app/actions';
import { useTransition } from 'react';
import { Lightbulb, AlertTriangle, Loader2, WandSparkles } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

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
    <aside className="w-full md:w-96 lg:w-[450px] border-l flex flex-col bg-card/50">
      <div className="p-4 border-b">
        <h2 className="font-headline text-lg font-semibold flex items-center gap-2">
            <WandSparkles className="w-5 h-5 text-primary" />
            AI Gap Analysis
        </h2>
      </div>
      <div className="flex-1 p-4 flex flex-col gap-4 min-h-0">
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

        <Separator />
        
        <ScrollArea className="flex-1">
          <div className="space-y-6 pr-2">
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

                <Card className='bg-background/40'>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <Lightbulb className="w-5 h-5 text-accent" />
                      Knowledge Gaps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysisResult.knowledgeGaps.length > 0 ? (
                        <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-4">
                            {analysisResult.knowledgeGaps.map((gap, i) => <li key={`gap-${i}`}>{gap}</li>)}
                        </ul>
                    ) : <p className="text-sm text-muted-foreground">No specific knowledge gaps identified.</p>}
                  </CardContent>
                </Card>

                <Card className='bg-background/40'>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      Conflicting Findings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                     {analysisResult.conflictingFindings.length > 0 ? (
                        <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-4">
                            {analysisResult.conflictingFindings.map((conflict, i) => <li key={`conflict-${i}`}>{conflict}</li>)}
                        </ul>
                    ) : <p className="text-sm text-muted-foreground">No conflicting findings identified.</p>}
                  </CardContent>
                </Card>
              </>
            ) : (
                !isPending && (
                    <div className="text-center text-muted-foreground py-10">
                        <p>Analysis results will appear here.</p>
                    </div>
                )
            )}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
