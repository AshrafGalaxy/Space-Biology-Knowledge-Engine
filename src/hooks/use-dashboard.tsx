
'use client';

import { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import type { Publication, UserRole, GapAnalysisResult, SortingState } from '@/types';
import { useToast } from './use-toast';

type ViewMode = 'grid' | 'list';

interface DashboardContextType {
  publications: Publication[];
  concepts: string[];
  filteredPublications: Publication[];
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  activeConcepts: Set<string>;
  toggleConcept: (concept: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedPublication: Publication | null;
  setSelectedPublicationId: (id: string | null) => void;
  isLoadingAnalysis: boolean;
  setIsLoadingAnalysis: (isLoading: boolean) => void;
  analysisResult: GapAnalysisResult;
  setAnalysisResult: (result: GapAnalysisResult) => void;
  clearFilters: () => void;
  isFiltered: boolean;
  comparisonSet: Set<string>;
  toggleComparison: (id: string) => void;
  clearComparison: () => void;
  getPublicationById: (id: string) => Publication | undefined;
  yearRange: [number, number];
  setYearRange: (range: [number, number]) => void;
  minYear: number;
  maxYear: number;
  sorting: SortingState;
  setSorting: (sorting: SortingState) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filterByConcept: (concept: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ 
  children, 
  publications,
  concepts,
  minYear,
  maxYear,
}: { 
  children: React.ReactNode,
  publications: Publication[],
  concepts: string[],
  minYear: number,
  maxYear: number,
}) {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole>('Scientist');
  const [activeConcepts, setActiveConcepts] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPublicationId, setSelectedPublicationId] = useState<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<GapAnalysisResult>(null);
  const [comparisonSet, setComparisonSet] = useState<Set<string>>(new Set());
  const [yearRange, setYearRange] = useState<[number, number]>([minYear, maxYear]);
  const [sorting, setSorting] = useState<SortingState>({ id: 'publicationYear', desc: true });
  const [viewMode, setViewMode] = useState<ViewMode>('grid');


  const toggleConcept = useCallback((concept: string) => {
    let conceptAdded = false;
    let conceptRemoved = false;
    setActiveConcepts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(concept)) {
        newSet.delete(concept);
        conceptRemoved = true;
      } else {
        if (newSet.size >= 3) {
          toast({
            title: 'Concept Limit Reached',
            description: 'You can select a maximum of 3 concepts at a time for filtering.',
            variant: 'destructive',
          });
          return prev;
        }
        newSet.add(concept);
        conceptAdded = true;
      }
      return newSet;
    });
    return { conceptAdded, conceptRemoved };
  }, [toast]);

  const filterByConcept = (concept: string) => {
    // We only want to close the dialog if a *new* concept was successfully added.
    // If the user is de-selecting a concept, or if they've hit the limit, the dialog should remain open.
    const { conceptAdded } = toggleConcept(concept);
    if (conceptAdded) {
        setSelectedPublicationId(null);
    }
  };

  const toggleComparison = (id: string) => {
    setComparisonSet(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    })
  }

  const clearComparison = () => setComparisonSet(new Set());

  const clearFilters = () => {
    setActiveConcepts(new Set());
    setSearchTerm('');
    setYearRange([minYear, maxYear]);
    setSorting({ id: 'publicationYear', desc: true });
  };

  const isFiltered = useMemo(() => {
      return searchTerm.length > 0 || activeConcepts.size > 0 || yearRange[0] > minYear || yearRange[1] < maxYear;
  }, [searchTerm, activeConcepts, yearRange, minYear, maxYear]);

  const filteredPublications = useMemo(() => {
    let filtered = publications.filter(p => {
      const searchMatch = searchTerm.length > 0 
        ? p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          p.summary.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      
      const conceptMatch = activeConcepts.size > 0 
        ? [...activeConcepts].every(concept => p.keyConcepts.includes(concept))
        : true;

      const yearMatch = p.publicationYear >= yearRange[0] && p.publicationYear <= yearRange[1];
        
      return searchMatch && conceptMatch && yearMatch;
    });

    if (sorting.id) {
        filtered.sort((a, b) => {
            const valA = a[sorting.id as keyof Publication];
            const valB = b[sorting.id as keyof Publication];
            
            let comparison = 0;
            if (valA > valB) {
                comparison = 1;
            } else if (valA < valB) {
                comparison = -1;
            }
            
            return sorting.desc ? -comparison : comparison;
        });
    }

    return filtered;
  }, [publications, searchTerm, activeConcepts, yearRange, sorting]);
  
  const selectedPublication = useMemo(() => {
    return publications.find(p => p.id === selectedPublicationId) ?? null;
  }, [selectedPublicationId, publications]);

  const getPublicationById = useCallback((id: string) => {
    return publications.find(p => p.id === id);
  }, [publications]);

  // Reset analysis when filters change
  useEffect(() => {
    setAnalysisResult(null);
  }, [filteredPublications, isFiltered]);

  const value = {
    publications,
    concepts,
    filteredPublications,
    userRole,
    setUserRole,
    activeConcepts,
    toggleConcept,
    searchTerm,
    setSearchTerm,
    selectedPublication,
    setSelectedPublicationId,
    isLoadingAnalysis,
    setIsLoadingAnalysis,
    analysisResult,
    setAnalysisResult,
    clearFilters,
    isFiltered,
    comparisonSet,
    toggleComparison,
    clearComparison,
    getPublicationById,
    yearRange,
    setYearRange,
    minYear,
    maxYear,
    sorting,
    setSorting,
    viewMode,
    setViewMode,
    filterByConcept,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

    