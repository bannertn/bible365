import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Verse } from "@/lib/bible-data";

interface BibleSectionProps {
  title: string;
  verses: Verse[];
  checkedVerses: Set<string>;
  onToggleVerse: (id: string, text: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const BibleSection: React.FC<BibleSectionProps> = ({
  title,
  verses,
  checkedVerses,
  onToggleVerse,
  isOpen,
  onToggle,
}) => {
  // Calculate progress
  const sectionIds = verses.map((v) => v.id);
  const checkedCount = sectionIds.filter((id) => checkedVerses.has(id)).length;
  const isComplete = verses.length > 0 && checkedCount === verses.length;

  return (
    <div className="mb-6 overflow-hidden border-2 border-[var(--border)] bg-[var(--bg)] shadow-[4px_4px_0px_0px_var(--border)] transition-all">
      <button
        onClick={onToggle}
        className={cn(
          "flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-[var(--surface)]",
          isOpen && "bg-[var(--surface)] border-b-2 border-[var(--border)]"
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex h-8 w-8 items-center justify-center border-2 border-[var(--border)] text-sm font-bold",
            isComplete ? "bg-[var(--primary)] text-white" : "bg-transparent text-[var(--fg)]"
          )}>
            {checkedCount > 0 ? checkedCount : "0"}
          </div>
          <h2 className="font-sans text-2xl font-black uppercase tracking-tight text-[var(--fg)]">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-none border-2 border-[var(--border)] p-1 hover:bg-[var(--primary)] hover:text-white"
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 py-6 bg-[var(--bg)]">
              <div className="space-y-6">
                {verses.map((verse) => {
                  const isChecked = checkedVerses.has(verse.id);
                  return (
                    <div
                      key={verse.id}
                      className="group flex items-start gap-4 cursor-pointer"
                      onClick={() => onToggleVerse(verse.id, `${verse.reference} ${verse.text}`)}
                    >
                      <div className="pt-1.5 shrink-0">
                         {/* Custom Checkbox for Quadratic Look */}
                         <div className={cn(
                           "h-6 w-6 border-2 border-[var(--border)] transition-colors flex items-center justify-center",
                           isChecked ? "bg-[var(--primary)]" : "bg-transparent hover:bg-[var(--surface)]"
                         )}>
                           {isChecked && <Check className="h-4 w-4 text-white" strokeWidth={4} />}
                         </div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <label
                          className={cn(
                            "block font-serif text-lg leading-relaxed transition-colors cursor-pointer select-none",
                            isChecked ? "text-[var(--fg)] opacity-50 line-through decoration-2" : "text-[var(--fg)]"
                          )}
                        >
                          <span className="mr-2 inline-block font-sans text-sm font-black text-[var(--primary)] uppercase tracking-wider border border-[var(--border)] px-1 py-0.5">
                            {verse.reference}
                          </span>
                          {verse.text}
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
