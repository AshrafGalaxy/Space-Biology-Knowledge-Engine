'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useDashboard } from '@/hooks/use-dashboard';
import { TrendingUp } from 'lucide-react';

export default function ResearchTimeline() {
  const { filteredPublications } = useDashboard();

  const timelineData = useMemo(() => {
    if (!filteredPublications.length) return [];

    const countsByYear: { [year: number]: number } = {};
    filteredPublications.forEach(pub => {
      countsByYear[pub.publicationYear] = (countsByYear[pub.publicationYear] || 0) + 1;
    });

    const years = Object.keys(countsByYear).map(Number);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    const data = [];
    for (let year = minYear; year <= maxYear; year++) {
      data.push({
        year: year.toString(),
        publications: countsByYear[year] || 0,
      });
    }

    return data;
  }, [filteredPublications]);

  const chartConfig = {
    publications: {
      label: 'Publications',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2">
            <TrendingUp className="text-primary"/>
            Research Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer>
            <BarChart data={timelineData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
                width={30}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent
                    labelFormatter={(label) => `Year: ${label}`}
                />}
              />
              <Bar dataKey="publications" fill="var(--color-publications)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
