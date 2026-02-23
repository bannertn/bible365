const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'client/src/lib/bible-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let replaceCount = 0;

for (const [date, dailyData] of Object.entries(data)) {
    if (dailyData.sections) {
        for (const [sectionKey, section] of Object.entries(dailyData.sections)) {
            if (section.verses) {
                for (const verse of section.verses) {
                    if (verse.text === 'a') {
                        const oldText = verse.text;
                        verse.text = '見上節';
                        replaceCount++;
                        console.log(`[修改] 經文: ${verse.reference} (${date}) 從 "${oldText}" 改為 "${verse.text}"`);
                    }
                }
            }
        }
    }
}

if (replaceCount > 0) {
    // Save the updated JSON back to the file
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`\n✅ 成功將 ${replaceCount} 處 "a" 修改為 "見上節"，檔案已儲存：${dataPath}`);
} else {
    console.log('\n未找到任何內容為 "a" 的經文，不需修改。');
}
