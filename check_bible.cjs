const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'client/src/lib/bible-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let results = [];
let leviticusFound = false;

for (const [date, dailyData] of Object.entries(data)) {
  if (dailyData.sections) {
    for (const [sectionKey, section] of Object.entries(dailyData.sections)) {
      if (section.verses) {
        for (const verse of section.verses) {
          // Check for 利未記 3:15 specifically
          if (verse.reference === '利未記 3:15') {
            leviticusFound = true;
            console.log(`[特定經文檢查] 利未記 3:15 在日期 ${date}, section ${sectionKey} 找到:`);
            console.log(` - ID: ${verse.id}`);
            console.log(` - Text內容: "${verse.text}"`);
          }

          // Check for any verse with exact text 'a' or length 1
          if (verse.text === 'a' || verse.text.length <= 1) {
            results.push({
              date,
              section: sectionKey,
              reference: verse.reference,
              id: verse.id,
              text: verse.text
            });
          }
        }
      }
    }
  }
}

console.log('\n=======================================');
if (!leviticusFound) {
  console.log('找不到 利未記 3:15。');
} else {
  console.log('利未記 3:15 檢查完畢。');
}

console.log('\n[全部經文掃描結果] 內容極短(例如只有 "a")的經文:');
if (results.length > 0) {
  results.forEach(res => {
    console.log(`日期: ${res.date}, 經文: ${res.reference} (ID=${res.id}), 內容: "${res.text}"`);
  });
} else {
  console.log('沒有找到其他內容極短或只有字母 "a" 的經文。');
}
