'use client';

import { useState, useTransition } from 'react';
import { runResearchProposal } from '@/app/actions';
import type { ProposeResearchOutput } from '@/ai/flows/propose-research';
import { useDashboard } from '@/hooks/use-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { WandSparkles, Loader2, Lightbulb, TestTube, AlertTriangle, ArrowRight, CornerRightDown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Separator } from '../ui/separator';

export default function ResearchProposalPanel() {
    const { publications, setSelectedPublicationId, userRole } = useDashboard();
    const [idea, setIdea] = useState('');
    const [analysisResult, setAnalysisResult] = useState<ProposeResearchOutput | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleAnalyze = () => {
        if (!idea || idea.length < 20) return;
        startTransition(async () => {
            setAnalysisResult(null);
            const publicationSummaries = publications.map(({ id, title, summary }) => ({ id, title, summary }));
            const result = await runResearchProposal({ researchIdea: idea, publications: publicationSummaries });
            setAnalysisResult(result);
        });
    };

    if (userRole === 'Manager') return null;

    return (
        <Card className="bg-secondary/30">
            <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                    <Lightbulb className="text-primary" />
                    Exploratory Research Assistant
                </CardTitle>
                <CardDescription>
                    Propose a new research idea and the AI will analyze its novelty and relationship to the existing literature.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Textarea
                        placeholder="Describe your research idea here. Be as detailed as possible for the best results (min. 20 characters)."
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        className="bg-background"
                        rows={4}
                    />
                </div>
                <Button onClick={handleAnalyze} disabled={isPending || idea.length < 20} className="w-full">
                    {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <WandSparkles className="mr-2 h-4 w-4" />
                    )}
                    Analyze Proposal
                </Button>

                {isPending && (
                    <div className="text-center text-muted-foreground py-6">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                        <p className="mt-2 text-sm">AI is analyzing your proposal against {publications.length} publications...</p>
                    </div>
                )}
                
                {analysisResult && !isPending && (
                    <div className="space-y-6 pt-4">
                        <Separator/>
                        <div className="space-y-2">
                             <h3 className="font-semibold flex items-center gap-2 text-foreground"><Lightbulb className="h-4 w-4 text-amber-400"/> Novelty Statement</h3>
                            <p className="text-sm text-muted-foreground">{analysisResult.noveltyStatement}</p>
                        </div>
                        
                        <div className="space-y-3">
                            <h3 className="font-semibold flex items-center gap-2 text-foreground"><TestTube className="h-4 w-4 text-green-400"/> Suggested Next Steps</h3>
                            <ul className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                                {analysisResult.suggestedNextSteps.map((step, i) => (
                                    <li key={`step-${i}`}>{step}</li>
                                ))}
                            </ul>
                        </div>

                        {analysisResult.supportingPublications.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2 text-foreground"><ArrowRight className="h-4 w-4 text-blue-400"/> Supporting Research</h3>
                                <div className="space-y-3">
                                {analysisResult.supportingPublications.map(pub => (
                                    <div key={pub.id} className="p-3 bg-background/50 rounded-md">
                                        <p 
                                            className="font-medium text-sm text-foreground hover:underline cursor-pointer"
                                            onClick={() => setSelectedPublicationId(pub.id)}
                                        >{pub.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1"><CornerRightDown className="inline h-3 w-3 mr-1"/>{pub.reason}</p>
                                    </div>
                                ))}
                                </div>
                            </div>
                        )}
                        
                        {analysisResult.contradictoryPublications.length > 0 && (
                             <div className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2 text-foreground"><AlertTriangle className="h-4 w-4 text-red-400"/> Contradictory Research</h3>
                                <div className="space-y-3">
                                {analysisResult.contradictoryPublications.map(pub => (
                                    <div key={pub.id} className="p-3 bg-background/50 rounded-md">
                                        <p 
                                            className="font-medium text-sm text-foreground hover:underline cursor-pointer"
                                            onClick={() => setSelectedPublicationId(pub.id)}
                                        >{pub.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1"><CornerRightDown className="inline h-3 w-3 mr-1"/>{pub.reason}</p>
                                    </div>
                                ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
