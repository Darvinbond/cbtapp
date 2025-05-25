"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export function LoadingOverlay({ isLoading, message = "Saving" }: LoadingOverlayProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-black/50 backdrop-blur-sm" />
          <div className="relative flex flex-col items-center gap-3">
            <Loader2 className="size-[16px] animate-spin text-zinc-800" />
            <p className="text-zinc-800 text-[12px] font-medium min-w-[80px] text-center">
              {message}{dots}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
