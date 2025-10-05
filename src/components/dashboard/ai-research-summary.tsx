'use client';

import { useEffect, useState } from 'react';
import { useDashboard } from '@/hooks/use-dashboard';
import { runResearchOverview } from '@/app/actions';
import type { GetResearchOverviewOutput } from '@/ai/flows/get-research-overview';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Brain, Lightbulb, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export default function AiResearchSummary() {
    const { filteredPublications } = useDashboard();
    const [overview, setOverview] = useState<GetResearchOverviewOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOverview = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Pass only title and summary to the action
                const publicationSummaries = filteredPublications.map(({ title, summary }) => ({ title, summary }));
                const result = await runResearchOverview(publicationSummaries);
                
                // Check if the result indicates an error from the backend action
                if (result.dominantThemes[0]?.theme === 'Error') {
                    throw new Error(result.dominantThemes[0].description);
                }

                setOverview(result);
            } catch (e: any) {
                console.error("Failed to fetch research overview:", e);
                setError(e.message || "An unknown error occurred while generating the overview.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOverview();
    }, [filteredPublications]);

    if (isLoading) {
        return (
            <Card className="bg-secondary/30">
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center gap-2">
                        <Brain className="text-primary"/>
                        AI Strategic Briefing
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-16 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p>AI is generating a high-level strategic overview...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Failed to Generate Briefing</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    if (!overview) {
        return null; // Should be handled by loading/error states
    }

    return (
        <Card className="bg-secondary/30 border-primary/50 shadow-lg shadow-primary/10">
            <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                    <Brain className="text-primary"/>
                    AI Strategic Briefing
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Dominant Themes */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                           <TrendingUp className="h-5 w-5 text-green-400"/>
                           Dominant Themes
                        </h3>
                        <div className="space-y-3">
                        {overview.dominantThemes.map((item, index) => (
                            <div key={`theme-${index}`} className="p-3 bg-background/50 rounded-md">
                                <p className="font-medium text-foreground">{item.theme}</p>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                    {/* Emerging Trends */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                           <Lightbulb className="h-5 w-5 text-amber-400"/>
                           Emerging Trends
                        </h3>
                        <div className="space-y-3">
                        {overview.emergingTrends.map((item, index) => (
                            <div key={`trend-${index}`} className="p-3 bg-background/50 rounded-md">
                                <p className="font-medium text-foreground">{item.trend}</p>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                    {/* Areas of Debate */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                           <AlertTriangle className="h-5 w-5 text-red-400"/>
                           Areas of Debate
                        </h3>
                         <div className="space-y-3">
                        {overview.areasOfDebate.map((item, index) => (
                           <div key={`debate-${index}`} className="p-3 bg-background/50 rounded-md">
                                <p className="font-medium text-foreground">{item.topic}</p>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
