const ExcelJS = require('./AI for CRA V3.0/node_modules/exceljs');
const path = require('path');

async function readExcelStructure() {
  const workbook = new ExcelJS.Workbook();
  const filePath = path.join(__dirname, '访视时间安排.xlsx');

  console.log('Reading Excel file:', filePath);

  try {
    await workbook.xlsx.readFile(filePath);

    console.log('\n=== Worksheets ===');
    workbook.eachSheet((worksheet, sheetId) => {
      console.log(`\nSheet ${sheetId}: ${worksheet.name}`);
      console.log(`Dimensions: ${worksheet.rowCount} rows x ${worksheet.columnCount} columns`);

      console.log('\n=== First 5 rows ===');
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber <= 5) {
          console.log(`Row ${rowNumber}:`);
          row.eachCell((cell, colNumber) => {
            const colLetter = String.fromCharCode(64 + colNumber);
            console.log(`  ${colLetter}${colNumber}: "${cell.value}"`);
          });
        }
      });

      // Get column headers (row 1 and 2)
      console.log('\n=== Header Structure ===');
      const row1 = worksheet.getRow(1);
      const row2 = worksheet.getRow(2);

      console.log('\nRow 1 (Cycle Names):');
      row1.eachCell((cell, colNumber) => {
        const colLetter = String.fromCharCode(64 + colNumber);
        console.log(`  ${colLetter}1: "${cell.value}"`);
      });

      console.log('\nRow 2 (Time Windows):');
      row2.eachCell((cell, colNumber) => {
        const colLetter = String.fromCharCode(64 + colNumber);
        console.log(`  ${colLetter}2: "${cell.value}"`);
      });
    });

  } catch (error) {
    console.error('Error reading Excel:', error.message);
  }
}

readExcelStructure().catch(console.error);
