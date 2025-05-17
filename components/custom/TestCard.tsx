'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface TestCardProps {
  id: string;
  name: string;
  description: string;
  created_at: string;
  isListView?: boolean;
}

export default function TestCard({
  id,
  name,
  description,
  created_at,
  isListView = false
}: TestCardProps) {
  const formattedDate = formatDistanceToNow(new Date(created_at), { addSuffix: true });
  
  return (
    <Link href={`/admin/test/${id}`} className="block group">
      <Card className={`
        h-full transition-shadow rounded-[16px] hover:shadow-lg
        ${isListView ? 'flex items-center' : ''}
      `}>
        <CardContent className={`
          p-6 space-y-2
          ${isListView ? 'flex-1 flex items-center gap-4' : ''}
        `}>
          <div className={isListView ? 'flex-1' : ''}>
            <h3 className="font-medium text-lg text-zinc-900 group-hover:text-blue-600 transition-colors">
              {name}
            </h3>
            {description && (
              <p className="text-sm text-zinc-500 line-clamp-2 mt-1">
                {description}
              </p>
            )}
          </div>
          
          {!isListView && (
            <div className="pt-4 mt-4 border-t">
              <p className="text-xs text-zinc-400">
                Modified {formattedDate}
              </p>
            </div>
          )}

          {isListView && (
            <div className="text-xs text-zinc-400 shrink-0">
              Modified {formattedDate}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
