"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddQuestionButtonProps {
  onAdd: (position: "above" | "below") => void;
}

export default function AddQuestionButton({ onAdd }: AddQuestionButtonProps) {
  return (
    <div className="relative py-4 group">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full border-t border-dashed border-zinc-300" />
      </div>

      <div className="relative flex justify-center">
        <Button variant="outline" size="icon" onClick={() => onAdd("above")}>
          <PlusIcon />
        </Button>
      </div>
    </div>
  );
}
