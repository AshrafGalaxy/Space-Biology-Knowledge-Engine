import { Header } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Lightbulb, Search, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-body text-foreground">
      <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <h1 className="font-headline text-xl md:text-2xl font-bold tracking-tighter text-foreground">
              About SpaceBio Explorer
            </h1>
          </Link>
        </div>
        <Link href="/">
          <Button>Back to Dashboard</Button>
        </Link>
      </header>
      <main className="flex-1 p-4 md:p-8 lg:p-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <section>
            <h2 className="font-headline text-3xl font-bold mb-4">Dashboard Features</h2>
            <p className="text-muted-foreground text-lg">
              This AI-powered dashboard is designed to help researchers, managers, and mission architects explore a vast library of NASA bioscience publications. Below is an explanation of the key features.
            </p>
          </section>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <BrainCircuit className="w-6 h-6 text-primary" />
                <span>Interactive Knowledge Graph</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>The Knowledge Graph provides a dynamic, 3D visualization of the key concepts extracted from the publications. It helps you discover connections and trends in the research data.</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>How it works:</strong> It scans all currently filtered publications, identifies their key concepts, and represents each unique concept as a clickable sphere (a node).</li>
                <li><strong>Interactivity:</strong> Clicking a node filters the publication list to show only articles containing that concept. Active concepts are highlighted and enlarged. Hovering over a node provides visual and auditory feedback.</li>
                <li><strong>Purpose:</strong> It offers an intuitive way to navigate the thematic landscape of the research and narrow down your focus based on interconnected ideas.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Search className="w-6 h-6 text-primary" />
                <span>Filtering and Search</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>The side panel on the left allows you to precisely refine the list of publications.</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Search Bar:</strong> Quickly find publications by typing keywords. The search looks through titles and summaries.</li>
                <li><strong>Key Concepts Filter:</strong> Select one or more concepts from the list to see only publications that include all of your selected concepts. This is directly linked to the Knowledge Graph.</li>
                <li><strong>Clear Filters:</strong> A button at the bottom allows you to reset all search and filter criteria with a single click.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Lightbulb className="w-6 h-6 text-primary" />
                <span>AI-Powered Gap Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>The panel on the right (available to Scientists and Mission Architects) leverages a powerful AI model to analyze the currently filtered publications and provide high-level insights.</p>
               <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>How it works:</strong> When you click the "Analyze for Gaps" button, the summaries of the filtered publications are sent to a Genkit AI flow. The AI reads through them to identify common themes, contradictions, and unexplored areas.</li>
                <li><strong>Knowledge Gaps:</strong> The AI points out areas where the current research is thin, suggesting potential avenues for future studies.</li>
                <li><strong>Conflicting Findings:</strong> The AI highlights instances where different publications present contradictory results, which is crucial for critical analysis and planning new experiments.</li>
              </ul>
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                <span>Role-Based Views</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>The dashboard tailors its layout and features based on the selected user role to provide the most relevant tools for different needs.</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Scientist:</strong> Has access to all features, including the deep-dive tools like the Knowledge Graph and Gap Analysis.</li>
                <li><strong>Manager:</strong> Sees a more streamlined view focused on high-level overviews and publication lists, with the more complex analysis tools hidden for clarity.</li>
                <li><strong>Mission Architect:</strong> Focuses on the Knowledge Graph and Gap Analysis to identify strategic research directions and opportunities.</li>
              </ul>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
