import React, { useState, useEffect } from "react";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Copy, BookOpen, Calendar, ChevronLeft, ChevronRight, Home as HomeIcon } from "lucide-react";
import { motion } from "framer-motion";
import { getDailyReading, type DailyReading } from "@/lib/bible-data";
import { BibleSection } from "@/components/BibleSection";
import { useToast } from "@/hooks/use-toast";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reading, setReading] = useState<DailyReading | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [openSection, setOpenSection] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize data when date changes
  useEffect(() => {
    setReading(getDailyReading(currentDate));
    // Reset selections and open section when date changes
    setCheckedIds(new Set());
    setOpenSection(null);
  }, [currentDate]);

  const handlePrevDay = () => setCurrentDate(prev => subDays(prev, 1));
  const handleNextDay = () => setCurrentDate(prev => addDays(prev, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleToggleVerse = (id: string, fullText: string) => {
    const newChecked = new Set(checkedIds);

    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }

    setCheckedIds(newChecked);
  };

  const handleCopy = () => {
    if (checkedIds.size === 0 || !reading) {
      toast({
        title: "沒有選擇經文",
        description: "請先勾選您想複製的經文。",
        variant: "destructive",
        className: "border-2 border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] rounded-none shadow-[4px_4px_0px_0px_var(--border)]",
      });
      return;
    }

    // Collect all selected verses in order
    const allVerses = [
      ...reading.sections.psalms.verses,
      ...reading.sections.newTestament.verses,
      ...reading.sections.oldTestament.verses,
      ...reading.sections.proverbs.verses,
    ].filter(v => checkedIds.has(v.id));

    if (allVerses.length === 0) return;

    // Group and format
    let result = "";
    let lastBookChapter = "";

    allVerses.forEach((verse, index) => {
      const match = verse.reference.match(/^(.+)\s(\d+)[:：](\d+)/);

      let currentBookChapter = "";
      let verseNum = "";
      let fullRef = verse.reference;

      if (match) {
        const [_, book, chapter, vNum] = match;
        currentBookChapter = `${book} ${chapter}`;
        verseNum = vNum;
      } else {
        currentBookChapter = verse.reference.split(":")[0];
        verseNum = verse.reference.split(":")[1] || "";
      }

      if (index === 0) {
        result += `${fullRef} ${verse.text}`;
      } else {
        if (currentBookChapter === lastBookChapter) {
          result += ` ${verseNum} ${verse.text}`;
        } else {
          result += `\n\n${fullRef} ${verse.text}`;
        }
      }

      lastBookChapter = currentBookChapter;
    });

    navigator.clipboard.writeText(result).then(() => {
      toast({
        title: "複製成功",
        description: `已複製 ${checkedIds.size} 節經文`,
        className: "border-2 border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] rounded-none shadow-[4px_4px_0px_0px_var(--border)]",
      });
    });
  };

  if (!reading) return null;

  return (
    <div className="min-h-screen pb-32 bg-[var(--bg)] selection:bg-[var(--primary)] selection:text-white">
      {/* Header / Hero */}
      <div className="relative w-full border-b-2 border-[var(--border)] bg-[var(--surface)] py-12">
        {/* Pattern Background */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        />

        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-4 inline-block border-2 border-[var(--border)] bg-[var(--primary)] px-4 py-1 text-sm font-bold text-white shadow-[4px_4px_0px_0px_var(--border)]">
              DAILY BIBLE READING
            </div>
            <h1 className="mb-4 font-sans text-5xl font-black text-[var(--fg)] md:text-6xl tracking-tighter uppercase">
              屬靈健保書
            </h1>
            <p className="font-serif text-xl text-[var(--fg)] italic">
              "一年版讀經計劃"
            </p>
          </motion.div>
        </div>

        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 z-20">
          <ModeToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-3xl px-4 mt-8 relative z-10">
        {/* Date Navigation Card */}
        <div className="mb-8 border-2 border-[var(--border)] bg-[var(--bg)] p-0 shadow-[8px_8px_0px_0px_var(--border)]">
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-6 border-b-2 md:border-b-0 md:border-r-2 border-[var(--border)] flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center border-2 border-[var(--border)] bg-[var(--primary)] text-white shadow-[2px_2px_0px_0px_var(--border)]">
                <Calendar className="h-8 w-8" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--fg)] opacity-60">Today's Reading</p>
                <h2 className="font-sans text-2xl font-black text-[var(--fg)]">
                  {format(new Date(reading.date), "M月d日 EEEE", { locale: zhTW })}
                </h2>
              </div>
            </div>

            <div className="flex items-center bg-[var(--surface)] p-2 gap-2">
              <button
                onClick={handlePrevDay}
                className="btn-quadratic h-full flex-1 flex items-center justify-center gap-2 text-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">前一天</span>
              </button>

              <button
                onClick={handleToday}
                disabled={isSameDay(currentDate, new Date())}
                className={`h-full flex-1 flex items-center justify-center gap-2 border-2 border-[var(--border)] px-4 font-bold text-sm transition-all ${isSameDay(currentDate, new Date())
                  ? "bg-[var(--fg)] text-[var(--bg)] opacity-50 cursor-not-allowed"
                  : "bg-[var(--bg)] hover:bg-[var(--primary)] hover:text-white hover:shadow-[2px_2px_0px_0px_var(--border)] hover:-translate-y-0.5"
                  }`}
              >
                <HomeIcon className="h-4 w-4" />
                <span className="hidden sm:inline">今日</span>
              </button>

              <button
                onClick={handleNextDay}
                className="btn-quadratic h-full flex-1 flex items-center justify-center gap-2 text-sm"
              >
                <span className="hidden sm:inline">後一天</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {reading.isRestDay ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center border-2 border-[var(--border)] bg-[var(--surface)] py-24 text-center shadow-[8px_8px_0px_0px_var(--border)]"
          >
            <div className="mb-6 flex h-24 w-24 items-center justify-center border-2 border-[var(--border)] bg-[var(--bg)] shadow-[4px_4px_0px_0px_var(--border)]">
              <BookOpen className="h-12 w-12 text-[var(--primary)]" strokeWidth={2} />
            </div>
            <h2 className="font-sans text-4xl font-black text-[var(--fg)] mb-4">229 休息日</h2>
            <p className="text-[var(--fg)] font-serif text-lg max-w-sm px-6">
              今天是閏年多出來的一天，好好安息，預備心迎接新的季節。
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <BibleSection
              title="詩篇"
              verses={reading.sections.psalms.verses}
              checkedVerses={checkedIds}
              onToggleVerse={handleToggleVerse}
              isOpen={openSection === "psalms"}
              onToggle={() => setOpenSection(openSection === "psalms" ? null : "psalms")}
            />
            <BibleSection
              title="新約"
              verses={reading.sections.newTestament.verses}
              checkedVerses={checkedIds}
              onToggleVerse={handleToggleVerse}
              isOpen={openSection === "newTestament"}
              onToggle={() => setOpenSection(openSection === "newTestament" ? null : "newTestament")}
            />
            <BibleSection
              title="舊約"
              verses={reading.sections.oldTestament.verses}
              checkedVerses={checkedIds}
              onToggleVerse={handleToggleVerse}
              isOpen={openSection === "oldTestament"}
              onToggle={() => setOpenSection(openSection === "oldTestament" ? null : "oldTestament")}
            />
            <BibleSection
              title="箴言"
              verses={reading.sections.proverbs.verses}
              checkedVerses={checkedIds}
              onToggleVerse={handleToggleVerse}
              isOpen={openSection === "proverbs"}
              onToggle={() => setOpenSection(openSection === "proverbs" ? null : "proverbs")}
            />
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      {!reading.isRestDay && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-[var(--border)] bg-[var(--surface)] px-4 py-4">
          <div className="container mx-auto flex max-w-3xl items-center justify-between">
            <div className="text-sm font-bold text-[var(--fg)] uppercase tracking-wider flex items-center gap-4">
              <span>已選取： <span className="text-[var(--primary)] text-lg ml-1">{checkedIds.size}</span></span>
              <span className="text-xs text-[var(--muted-fg)] normal-case tracking-normal">錯誤回報：tainan@wwbch.org</span>
            </div>
            <button
              onClick={handleCopy}
              className="btn-quadratic-primary flex items-center gap-2 text-sm uppercase tracking-wider"
            >
              <Copy className="h-4 w-4" />
              複製經文
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
