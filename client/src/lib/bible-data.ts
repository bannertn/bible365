import { format, getMonth, getDate } from "date-fns";
import bibleDataRaw from "./bible-data.json";

export interface Verse {
  id: string;
  reference: string;
  text: string;
}

export interface BibleSection {
  title: string;
  verses: Verse[];
}

export interface DailyReading {
  date: string;
  isRestDay?: boolean;
  sections: {
    psalms: BibleSection;
    newTestament: BibleSection;
    oldTestament: BibleSection;
    proverbs: BibleSection;
  };
}

// Type assertion for the imported JSON
const bibleData = bibleDataRaw as Record<string, DailyReading>;

export const getDailyReading = (date: Date): DailyReading => {
  const month = getMonth(date) + 1; // 0-indexed
  const day = getDate(date);

  // Check for Leap Day (Feb 29)
  if (month === 2 && day === 29) {
    return {
      date: format(date, "yyyy-MM-dd"),
      isRestDay: true,
      sections: {
        psalms: { title: "詩篇", verses: [] },
        newTestament: { title: "新約", verses: [] },
        oldTestament: { title: "舊約", verses: [] },
        proverbs: { title: "箴言", verses: [] },
      },
    };
  }

  const dateKey = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const reading = bibleData[dateKey];

  if (!reading) {
    // Fallback if data is missing for a date (shouldn't happen with full data)
    return {
      date: format(date, "yyyy-MM-dd"),
      sections: {
        psalms: { title: "詩篇", verses: [] },
        newTestament: { title: "新約", verses: [] },
        oldTestament: { title: "舊約", verses: [] },
        proverbs: { title: "箴言", verses: [] },
      },
    };
  }

  // The JSON stores date as "MM-DD", but the app might expect full date string in `date` field if used for display
  // We override the date field to be the actual requested date object formatted
  return {
    ...reading,
    date: format(date, "yyyy-MM-dd"),
  };
};
