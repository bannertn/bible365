
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// --- Configuration ---
const EXCEL_PATH = 'attached_assets/完整清單_\'詩篇\'、\'新約\'、\'舊約\'、\'箴言\'，的進度內容_1765170972505.xlsx';
const BIBLE_JSON_PATH = 'attached_assets/zh_cuv.json';
const OUTPUT_PATH = 'client/src/lib/bible-data.json';

// --- Constants ---
const BIBLE_BOOKS_CHINESE = [
  // Old Testament
  "創世記", "出埃及記", "利未記", "民數記", "申命記", 
  "約書亞記", "士師記", "路得記", "撒母耳記上", "撒母耳記下", 
  "列王紀上", "列王紀下", "歷代志上", "歷代志下", "以斯拉記", 
  "尼希米記", "以斯帖記", "約伯記", "詩篇", "箴言", 
  "傳道書", "雅歌", "以賽亞書", "耶利米書", "耶利米哀歌", 
  "以西結書", "但以理書", "何西阿書", "約珥書", "阿摩司書", 
  "俄巴底亞書", "約拿書", "彌迦書", "那鴻書", "哈巴谷書", 
  "西番雅書", "哈該書", "撒迦利亞書", "瑪拉基書",
  // New Testament
  "馬太福音", "馬可福音", "路加福音", "約翰福音", "使徒行傳", 
  "羅馬書", "哥林多前書", "哥林多後書", "加拉太書", "以弗所書", 
  "腓立比書", "歌羅西書", "帖撒羅尼迦前書", "帖撒羅尼迦後書", "提摩太前書", 
  "提摩太後書", "提多書", "腓利門書", "希伯來書", "雅各書", 
  "彼得前書", "彼得後書", "約翰一書", "約翰二書", "約翰三書", 
  "猶大書", "啟示錄"
];

// Map for fuzzy matching if needed (handling simple variations)
const BOOK_ALIASES: Record<string, string> = {
  "詩": "詩篇",
  "箴": "箴言",
  "創": "創世記",
  "帖前": "帖撒羅尼迦前書",
  "帖後": "帖撒羅尼迦後書",
  "約翰壹書": "約翰一書",
  "約翰貳書": "約翰二書",
  "約翰參書": "約翰三書",
  "約壹": "約翰一書",
  "約貳": "約翰二書",
  "約參": "約翰三書",
  "猶大書": "猶大書", // Just to be safe if strictly checking
  "腓利門書": "腓利門書",
  "俄巴底亞書": "俄巴底亞書",
};

// Single chapter books - if no chapter specified, assume chapter 1
const SINGLE_CHAPTER_BOOKS = new Set([
  "俄巴底亞書", "腓利門書", "約翰二書", "約翰三書", "猶大書"
]);

// --- Interfaces ---
interface BibleBook {
  abbrev: string;
  chapters: string[][];
}

interface Verse {
  id: string;
  reference: string;
  text: string;
}

interface BibleSection {
  title: string;
  verses: Verse[];
}

interface DailyReading {
  date: string;
  sections: {
    psalms: BibleSection;
    newTestament: BibleSection;
    oldTestament: BibleSection;
    proverbs: BibleSection;
  };
}

// --- Helper Functions ---

function getBookIndex(name: string): number {
  // Normalize name (remove spaces, etc)
  let cleanName = name.trim();
  // Try direct match
  let index = BIBLE_BOOKS_CHINESE.indexOf(cleanName);
  if (index !== -1) return index;
  
  // Try alias
  if (BOOK_ALIASES[cleanName]) {
    index = BIBLE_BOOKS_CHINESE.indexOf(BOOK_ALIASES[cleanName]);
    if (index !== -1) return index;
  }

  // Try partial match (startsWith)
  index = BIBLE_BOOKS_CHINESE.findIndex(b => cleanName.startsWith(b) || b.startsWith(cleanName));
  return index;
}

function parseReference(ref: string): { bookName: string, startChapter: number, endChapter: number, startVerse?: number, endVerse?: number } | null {
  // Example inputs: 
  // "詩篇 1篇" -> book: 詩篇, startCh: 1, endCh: 1
  // "馬太福音01章" -> book: 馬太福音, startCh: 1, endCh: 1
  // "創世記 01~02" -> book: 創世記, startCh: 1, endCh: 2
  // "箴言 1:01~06" -> book: 箴言, startCh: 1, endCh: 1, startV: 1, endV: 6
  
  // Clean string: remove "篇", "章", spaces
  let cleanRef = ref.replace(/[篇章]/g, '').trim();
  
  // Regex to capture book name (Chinese chars) and the rest
  // Match Chinese characters at the start
  const bookMatch = cleanRef.match(/^([\u4e00-\u9fa5]+)(.*)$/);
  if (!bookMatch) return null;
  
  const bookName = bookMatch[1].trim();
  const rest = bookMatch[2].trim();

  // Check if it is a single chapter book and no numbers provided
  // normalize book name first to check set
  let normalizedBookName = bookName;
  if (BOOK_ALIASES[bookName]) normalizedBookName = BOOK_ALIASES[bookName];

  if (rest === "" && SINGLE_CHAPTER_BOOKS.has(normalizedBookName)) {
     return {
      bookName,
      startChapter: 1,
      endChapter: 1
    };
  }
  
  // Parse the numbers
  // Case 1: "1:01~06" (Chapter:Verse range)
  const rangeWithColon = rest.match(/(\d+)[:：](\d+)[~-](\d+)/);
  if (rangeWithColon) {
    return {
      bookName,
      startChapter: parseInt(rangeWithColon[1]),
      endChapter: parseInt(rangeWithColon[1]), // Same chapter
      startVerse: parseInt(rangeWithColon[2]),
      endVerse: parseInt(rangeWithColon[3])
    };
  }
  
  // Case 2: "1:01" (Single verse? - unlikely in this schedule but possible)
  const singleVerse = rest.match(/(\d+)[:：](\d+)$/);
  if (singleVerse) {
     return {
      bookName,
      startChapter: parseInt(singleVerse[1]),
      endChapter: parseInt(singleVerse[1]),
      startVerse: parseInt(singleVerse[2]),
      endVerse: parseInt(singleVerse[2])
    };
  }

  // Case 3: "01~02" (Chapter range)
  const chapterRange = rest.match(/(\d+)[~-](\d+)$/);
  if (chapterRange) {
    return {
      bookName,
      startChapter: parseInt(chapterRange[1]),
      endChapter: parseInt(chapterRange[2])
    };
  }

  // Case 4: "01" (Single chapter)
  const singleChapter = rest.match(/(\d+)$/);
  if (singleChapter) {
    return {
      bookName,
      startChapter: parseInt(singleChapter[1]),
      endChapter: parseInt(singleChapter[1])
    };
  }

  return null;
}

// --- Main Script ---

async function main() {
  console.log("Starting Bible data generation...");

  // 1. Read Bible JSON
  console.log("Reading Bible JSON...");
  let bibleRaw = fs.readFileSync(BIBLE_JSON_PATH, 'utf-8');
  // Strip BOM if present
  if (bibleRaw.charCodeAt(0) === 0xFEFF) {
    bibleRaw = bibleRaw.slice(1);
  }
  
  console.log(`First 50 chars: ${bibleRaw.substring(0, 50)}`);

  let bibleData: BibleBook[];
  try {
    bibleData = JSON.parse(bibleRaw);
  } catch (e) {
    console.error("JSON Parse Error. Sample content:", bibleRaw.substring(0, 100));
    throw e;
  }

  // 2. Read Excel
  console.log("Reading Excel file...");
  const fileBuffer = fs.readFileSync(EXCEL_PATH);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const excelData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

  // 3. Process Rows
  console.log("Processing rows...");
  
  // Map to store daily readings by "MM-DD" key
  const readingsMap: Record<string, DailyReading> = {};

  // Skip header (row 0)
  for (let i = 1; i < excelData.length; i++) {
    const row = excelData[i];
    if (!row || row.length < 5) continue;

    const month = row[0];
    const day = row[1];
    const sectionName = row[3]; // "詩篇", "新約", etc.
    const referenceStr = row[4]; // "詩篇 1篇"

    if (!month || !day || !sectionName || !referenceStr) continue;

    // Pad month/day for key
    const dateKey = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Initialize daily reading if not exists
    if (!readingsMap[dateKey]) {
      // Use a dummy year (e.g., 2024 for leap year support, or just generic string)
      // We will store as "MM-DD" in the JSON and handle year in frontend
      readingsMap[dateKey] = {
        date: dateKey, // We'll just use MM-DD format for lookup
        sections: {
          psalms: { title: "詩篇", verses: [] },
          newTestament: { title: "新約", verses: [] },
          oldTestament: { title: "舊約", verses: [] },
          proverbs: { title: "箴言", verses: [] },
        }
      };
    }

    // Parse Reference
    const parsedRef = parseReference(referenceStr);
    if (!parsedRef) {
      console.warn(`Could not parse reference: ${referenceStr}`);
      continue;
    }

    const { bookName, startChapter, endChapter, startVerse, endVerse } = parsedRef;
    const bookIndex = getBookIndex(bookName);
    
    if (bookIndex === -1) {
      console.warn(`Could not find book: ${bookName}`);
      continue;
    }

    // Canonicalize book name
    const canonicalBookName = BIBLE_BOOKS_CHINESE[bookIndex];

    const bookData = bibleData[bookIndex];
    if (!bookData) {
       console.warn(`Bible data missing for index: ${bookIndex}`);
       continue;
    }

    // Extract Verses
    const verses: Verse[] = [];
    
    for (let ch = startChapter; ch <= endChapter; ch++) {
      const chapterIndex = ch - 1;
      const chapterVerses = bookData.chapters[chapterIndex];
      
      if (!chapterVerses) {
         console.warn(`Chapter not found: ${bookName} ${ch}`);
         continue;
      }

      // Determine verse range for this chapter
      let vStart = 1;
      let vEnd = chapterVerses.length;

      // If specific verses are requested
      if (startVerse !== undefined && endVerse !== undefined) {
        // Only apply verse limits if we are in the single chapter specified
        // OR if we are handling multi-chapter ranges with verse limits (unlikely but possible)
        // The parser logic `rangeWithColon` handles `1:01~06` which implies same chapter.
        vStart = startVerse;
        vEnd = endVerse;
      }

      for (let v = vStart; v <= vEnd; v++) {
        const verseIndex = v - 1;
        const text = chapterVerses[verseIndex];
        if (text) {
           verses.push({
             id: `${bookData.abbrev}-${ch}-${v}`,
             reference: `${canonicalBookName} ${ch}:${v}`,
             text: text.replace(/\s+/g, '') // Remove all spaces
           });
        }
      }
    }

    // Assign to correct section
    const currentReading = readingsMap[dateKey];
    if (sectionName === '詩篇') {
      currentReading.sections.psalms.verses.push(...verses);
    } else if (sectionName === '新約') {
      currentReading.sections.newTestament.verses.push(...verses);
    } else if (sectionName === '舊約') {
       currentReading.sections.oldTestament.verses.push(...verses);
    } else if (sectionName === '箴言') {
       currentReading.sections.proverbs.verses.push(...verses);
    }
  }

  // Convert map to array or keep as object? 
  // Object keyed by "MM-DD" is faster for lookup.
  console.log(`Generated readings for ${Object.keys(readingsMap).length} days.`);

  // Write to file
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(readingsMap, null, 2));
  console.log(`Successfully wrote to ${OUTPUT_PATH}`);
}

main().catch(console.error);
