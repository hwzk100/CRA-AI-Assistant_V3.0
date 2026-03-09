const ExcelJS = require('./AI for CRA V3.0/node_modules/exceljs');
const fs = require('fs');
const path = require('path');

async function readExcel() {
  const workbook = new ExcelJS.Workbook();
  const filePath = path.join(__dirname, '访视时间安排.xlsx');

  const output = [];

  try {
    output.push('Reading Excel file: ' + filePath);
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.worksheets[0];
    output.push('\n=== Sheet Info ===');
    output.push('Sheet Name: ' + sheet.name);
    output.push('Total Rows: ' + sheet.rowCount);
    output.push('Total Columns: ' + sheet.columnCount);

    output.push('\n=== Column Headers (Row 1) ===');
    const row1 = sheet.getRow(1);
    for (let col = 1; col <= sheet.columnCount; col++) {
      const cell = row1.getCell(col);
      const colLetter = String.fromCharCode(64 + col);
      output.push(`${colLetter}1: "${cell.value}"`);
    }

    output.push('\n=== Time Windows (Row 2) ===');
    const row2 = sheet.getRow(2);
    for (let col = 1; col <= sheet.columnCount; col++) {
      const cell = row2.getCell(col);
      const colLetter = String.fromCharCode(64 + col);
      output.push(`${colLetter}2: "${cell.value}"`);
    }

    output.push('\n=== First 5 Data Rows ===');
    for (let row = 1; row <= Math.min(5, sheet.rowCount); row++) {
      output.push(`\n--- Row ${row} ---`);
      const rowData = sheet.getRow(row);
      for (let col = 1; col <= sheet.columnCount; col++) {
        const cell = rowData.getCell(col);
        const colLetter = String.fromCharCode(64 + col);
        output.push(`  ${colLetter}${row}: "${cell.value}"`);
      }
    }

    output.push('\n=== Column Summary ===');
    output.push('A-G columns: Subject Info');
    for (let col = 1; col <= Math.min(7, sheet.columnCount); col++) {
      const cell1 = row1.getCell(col);
      const cell2 = row2.getCell(col);
      const colLetter = String.fromCharCode(64 + col);
      output.push(`  Column ${colLetter}: Row1="${cell1.value}", Row2="${cell2.value}"`);
    }

    output.push('\nH+ columns: Visit Cycles');
    for (let col = 8; col <= sheet.columnCount; col++) {
      const cell1 = row1.getCell(col);
      const cell2 = row2.getCell(col);
      const colLetter = col <= 26 ? String.fromCharCode(64 + col) : `Col${col}`;
      output.push(`  Column ${colLetter}: Row1="${cell1.value}", Row2="${cell2.value}"`);
    }

    fs.writeFileSync(path.join(__dirname, 'excel-output.txt'), output.join('\n'), 'utf8');
    console.log('Excel structure saved to excel-output.txt');
    console.log(output.join('\n'));

  } catch (error) {
    output.push('Error: ' + error.message);
    console.error(error);
  }
}

readExcel().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
