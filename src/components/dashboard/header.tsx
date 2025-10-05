'use client';

import { Logo } from '@/components/icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDashboard } from '@/hooks/use-dashboard';
import type { UserRole } from '@/types';
import { FlaskConical, Briefcase, Rocket, Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

const roleIcons: Record<UserRole, React.ReactNode> = {
  Scientist: <FlaskConical className="w-4 h-4 mr-2" />,
  Manager: <Briefcase className="w-4 h-4 mr-2" />,
  'Mission Architect': <Rocket className="w-4 h-4 mr-2" />,
};

export function Header() {
  const { userRole, setUserRole } = useDashboard();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 z-10 shrink-0">
      <div className="flex items-center gap-3">
        <Link href="/" className='flex items-center gap-3'>
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-xl md:text-2xl font-bold tracking-tighter text-foreground">
            NASA Bioscience Dashboard
          </h1>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/about">
          <Button variant="outline" size="sm">
            <Info className="mr-2 h-4 w-4" />
            About
          </Button>
        </Link>
        <Select value={userRole} onValueChange={(value) => setUserRole(value as UserRole)}>
          <SelectTrigger className="w-[200px] h-9">
            <div className="flex items-center">
              {roleIcons[userRole]}
              <SelectValue placeholder="Select a role" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Scientist">
              <div className="flex items-center">
                {roleIcons['Scientist']}
                Scientist
              </div>
            </SelectItem>
            <SelectItem value="Manager">
              <div className="flex items-center">
                {roleIcons['Manager']}
                Manager
              </div>
            </SelectItem>
            <SelectItem value="Mission Architect">
              <div className="flex items-center">
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
