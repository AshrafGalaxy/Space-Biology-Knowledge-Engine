'use client';

import { Logo } from '@/components/icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { useDashboard } from '@/hooks/use-dashboard.tsx';
import type { UserRole } from '@/types';
import { FlaskConical, Briefcase, Rocket, Info, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

const roleIcons: Record<UserRole, React.ReactNode> = {
  Scientist: <FlaskConical className="w-4 h-4" />,
  Manager: <Briefcase className="w-4 h-4" />,
  'Mission Architect': <Rocket className="w-4 h-4" />,
};

export function Header({ onFilterToggle }: { onFilterToggle: () => void }) {
  const { userRole, setUserRole } = useDashboard();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 z-10 shrink-0">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="lg:hidden" onClick={onFilterToggle}>
          <SlidersHorizontal className="h-4 w-4" />
          <span className="sr-only">Toggle Filters</span>
        </Button>
        <Link href="/" className='flex items-center gap-3'>
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-lg md:text-2xl font-bold tracking-tighter text-foreground">
            NASA Bioscience
          </h1>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/about">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            <Info className="mr-2 h-4 w-4" />
            About
          </Button>
        </Link>
        <Select value={userRole} onValueChange={(value) => setUserRole(value as UserRole)}>
          <SelectTrigger className="w-[180px] sm:w-[200px] h-9">
            <div className="flex items-center gap-2">
              {roleIcons[userRole]}
              <span className="hidden sm:inline">{userRole}</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Scientist">
              <div className="flex items-center gap-2">
                {roleIcons['Scientist']}
                Scientist
              </div>
            </SelectItem>
            <SelectItem value="Manager">
              <div className="flex items-center gap-2">
                {roleIcons['Manager']}
                Manager
              </div>
            </SelectItem>
            <SelectItem value="Mission Architect">
              <div className="flex items-center gap-2">
                {roleIcons['Mission Architect']}
                Mission Architect
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}