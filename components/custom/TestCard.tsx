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
        h-max rounded-[12px] hover:border-zinc-600 transition-all duration-200 shadow-none
        ${isListView ? 'flex items-center' : ''}
      `}>
        <CardContent className={`
          p-6 space-y-2
          ${isListView ? 'flex-1 flex items-center leading-tight gap-4' : ''}
        `}>
          <div className={isListView ? 'flex-1' : ''}>
            <h3 className="leading-tight text-[16px] text-black dgroup-hover:text-blue-600 transition-colors">
              {name}
            </h3>
            {description && (
              <p className="text-[12px] leading-tight text-zinc-500 line-clamp-3 mt-[8px]">
                {description}
              </p>
            )}
          </div>
          
          {!isListView && (
            <div className="pt-4 mt-4 border-t">
              <p className="text-[12px] leading-tight ml-auto w-max text-zinc-400">
                Created {formattedDate}
              </p>
            </div>
          )}

          {isListView && (
            <div className="text-xs text-zinc-400 shrink-0">
              Created {formattedDate}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
