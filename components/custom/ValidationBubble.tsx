import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export type ValidationMessageType = "error" | "warning" | "info";

export interface ValidationMessage {
  type: ValidationMessageType;
  message: string;
}

interface ValidationBubbleProps {
  messages: ValidationMessage[];
  className?: string;
}

const icons = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export function ValidationBubble({
  messages,
  className,
}: ValidationBubbleProps) {
  if (messages.length === 0) return null;

  return (
    <div className={cn("space-y-[8px] py-2", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        {messages.map((msg, i) => {
          const Icon = icons[msg.type];
          return (
            <motion.div
              key={msg.message}
              layout
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
              className={cn(
                "flex items-center gap-2 p-2 justify-start bg-zinc-100 text-[13px] leading-snug rounded-[8px] text-zinc-800"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="text-zinc-500">{msg.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
