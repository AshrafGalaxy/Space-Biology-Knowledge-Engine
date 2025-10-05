'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDashboard } from '@/hooks/use-dashboard';
import type { Publication, SortingState } from '@/types';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { ArrowUpDown } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface DataTableProps {
  data: Publication[];
}

export function PublicationDataTable({ data }: DataTableProps) {
  const { 
    setSelectedPublicationId, 
    toggleComparison, 
    comparisonSet,
    sorting,
    setSorting,
  } = useDashboard();

  const handleSort = (columnId: string) => {
    const isDesc = sorting.id === columnId && sorting.desc;
    setSorting({ id: columnId, desc: !isDesc });
  };

  const getSortIcon = (columnId: string) => {
    if (sorting.id !== columnId) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />;
    }
    return sorting.desc ? (
      <ArrowUpDown className="ml-2 h-4 w-4" />
    ) : (
      <ArrowUpDown className="ml-2 h-4 w-4" /> // Icons can be different for asc/desc if needed
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
                <span className="sr-only">Compare</span>
            </TableHead>
            <TableHead>
                <Button variant="ghost" onClick={() => handleSort('title')}>
                    Title
                    {getSortIcon('title')}
                </Button>
            </TableHead>
            <TableHead className="hidden lg:table-cell w-[250px]">Key Concepts</TableHead>
            <TableHead className="w-[120px]">
                 <Button variant="ghost" onClick={() => handleSort('publicationYear')}>
                    Year
                    {getSortIcon('publicationYear')}
                </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow 
                key={row.id} 
                data-state={comparisonSet.has(row.id) ? 'selected' : ''}
                className="group"
            >
              <TableCell>
                <Checkbox
                  checked={comparisonSet.has(row.id)}
                  onCheckedChange={() => toggleComparison(row.id)}
                  aria-label="Select row for comparison"
                />
              </TableCell>
              <TableCell 
                className="font-medium max-w-sm xl:max-w-md 2xl:max-w-xl truncate cursor-pointer group-hover:text-primary"
                onClick={() => setSelectedPublicationId(row.id)}
              >
                {row.title}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex flex-wrap gap-1">
                    {row.keyConcepts.slice(0, 2).map((concept) => (
                        <Badge key={concept} variant="secondary" className="font-normal">{concept}</Badge>
                    ))}
                    {row.keyConcepts.length > 2 && (
                        <Badge variant="outline">+{row.keyConcepts.length - 2}</Badge>
                    )}
                </div>
              </TableCell>
              <TableCell 
                className="text-muted-foreground cursor-pointer"
                onClick={() => setSelectedPublicationId(row.id)}
              >
                {row.publicationYear}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
