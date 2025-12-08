
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const filePath = 'attached_assets/完整清單_\'詩篇\'、\'新約\'、\'舊約\'、\'箴言\'，的進度內容_1765170972505.xlsx';

try {
  const fileBuffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log('First 5 rows:');
  console.log(data.slice(0, 5));
} catch (error) {
  console.error('Error reading file:', error);
}
