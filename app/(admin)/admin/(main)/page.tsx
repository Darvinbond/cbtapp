'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, Plus, Search } from 'lucide-react';
import TestCard from '@/components/custom/TestCard';
import { CreateTestDialog } from '@/components/custom/CreateTestDialog';

interface Test {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export default function TestList() {
  const [isListView, setIsListView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tests, setTests] = useState<Test[]>([]);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch('/api/tests');
        if (!response.ok) throw new Error('Failed to fetch tests');
        const data = await response.json();
        setTests(data);
      } catch (error) {
        console.error('Error fetching tests:', error);
      }
    };

    fetchTests();
  }, []);

  const filteredTests = tests.filter(test => 
    test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full sm:max-w-6xl mx-auto px-[16px] space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search tests"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border bg-white">
            <Button
              variant="ghost"
              size="sm"
              className={!isListView ? 'bg-zinc-100' : ''}
              onClick={() => setIsListView(false)}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={isListView ? 'bg-zinc-100' : ''}
              onClick={() => setIsListView(true)}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <CreateTestDialog />
        </div>
      </div>

      <div className={
        isListView 
          ? 'space-y-3'
          : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
      }>
        {filteredTests.map(test => (
          <TestCard
            key={test.id}
            {...test}
            isListView={isListView}
          />
        ))}
      </div>

      {filteredTests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-500">No tests found</p>
        </div>
      )}
    </div>
  );
}
