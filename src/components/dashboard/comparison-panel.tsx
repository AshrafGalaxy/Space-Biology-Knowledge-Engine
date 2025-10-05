'use client';

import { useDashboard } from '@/hooks/use-dashboard';
import { Button } from '../ui/button';
import { AlertTriangle, CheckCheck, Loader2, TestTube2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { runComparisonAnalysis } from '@/app/actions';
import { useTransition, useState } from 'react';
import type { ComparePublicationsOutput } from '@/ai/flows/compare-publications';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

export default function ComparisonPanel() {
  const { comparisonSet, clearComparison, getPublicationById } = useDashboard();
  const [isPending, startTransition] = useTransition();
  const [analysisResult, setAnalysisResult] = useState<ComparePublicationsOutput | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const selectedPublications = Array.from(comparisonSet).map(id => getPublicationById(id)).filter(p => p);

  const handleCompare = () => {
    if (selectedPublications.length < 2) return;
    startTransition(async () => {
      const result = await runComparisonAnalysis(selectedPublications as any);
      setAnalysisResult(result);
      setIsDialogOpen(true);
    });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    // Delay clearing results to allow dialog to animate out
    setTimeout(() => {
        setAnalysisResult(null);
    }, 300);
  }

  return (
    <>
    <AnimatePresence>
      {comparisonSet.size > 0 && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] md:w-auto z-50"
        >
          <div className="bg-card border rounded-lg shadow-2xl p-3 flex items-center gap-4">
            <div className="flex-shrink-0 flex items-center gap-2">
                <TestTube2 className="h-5 w-5 text-primary"/>
                <span className="font-medium text-sm text-foreground">
                    {comparisonSet.size} publication{comparisonSet.size > 1 ? 's' : ''} selected
                </span>
            </div>
            
            <div className="hidden md:flex items-center gap-2 flex-wrap max-w-md overflow-hidden">
                {selectedPublications.slice(0, 3).map(p => p && (
                    <span key={p.id} className="text-xs text-muted-foreground truncate">{p.title}</span>
                ))}
                {selectedPublications.length > 3 && (
                    <span className="text-xs text-muted-foreground">+ {selectedPublications.length - 3} more</span>
                )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                onClick={handleCompare}
                disabled={isPending || comparisonSet.size < 2}
                size="sm"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Compare'
                )}
              </Button>
              <Button onClick={clearComparison} variant="ghost" size="icon" className="h-9 w-9">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
            <DialogHeader>
                <DialogTitle className="font-headline text-2xl pr-8">Comparison Analysis</DialogTitle>
                <DialogDescription>
                    AI-generated consensus and contradiction points for the {selectedPublications.length} selected publications.
                </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-grow my-4 -mr-6">
                <div className="pr-6 space-y-8">
                    {analysisResult ? (
                        <>
                        <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                                <CheckCheck className="h-5 w-5 text-green-500" />
                                Points of Consensus
                            </h3>
                            {analysisResult.consensus.length > 0 ? (
                                <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-5">
                                    {analysisResult.consensus.map((item, i) => <li key={`con-${i}`}>{item}</li>)}
                                </ul>
                            ) : <p className="text-sm text-muted-foreground px-4 py-2">No significant consensus identified.</p>}
                        </div>

                        <Separator/>

                        <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                Points of Contradiction
                            </h3>
                            {analysisResult.contradictions.length > 0 ? (
                                <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-5">
                                    {analysisResult.contradictions.map((item, i) => <li key={`con-${i}`}>{item}</li>)}
                                </ul>
                            ) : <p className="text-sm text-muted-foreground px-4 py-2">No significant contradictions identified.</p>}
                        </div>
                        </>
                    ): (
                        <div className="text-center text-muted-foreground py-10">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                            <p className="mt-2">AI is analyzing the publications...</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </DialogContent>
    </Dialog>
    </>
  );
}
