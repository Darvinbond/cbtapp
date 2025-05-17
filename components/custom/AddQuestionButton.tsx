'use client';

import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddQuestionButtonProps {
  onAdd: (position: 'above' | 'below') => void;
}

export default function AddQuestionButton({ onAdd }: AddQuestionButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative py-4 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full border-t border-dashed border-zinc-200" />
      </div>

      <div className="relative flex justify-center">
        <div
          className={`
            flex items-center gap-2 bg-white rounded-full border border-zinc-200 shadow-sm
            transition-all duration-200
            ${isHovered ? 'p-1 pr-3' : 'p-1'}
          `}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={() => onAdd('above')}
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
          
          {isHovered && (
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <button
                onClick={() => onAdd('above')}
                className="hover:text-zinc-900"
              >
                Add above
              </button>
              <span className="text-zinc-300">|</span>
              <button
                onClick={() => onAdd('below')}
                className="hover:text-zinc-900"
              >
                Add below
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
