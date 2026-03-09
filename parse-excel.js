const fs = require('fs');

// Shared strings from the Excel file
const sharedStrings = [
  '中心编号',       // 0
  '筛选号',         // 1
  '姓名缩写',       // 2
  '签知情日期',     // 3
  '入组日期',       // 4
  '组别',           // 5
  '患者当前状态',   // 6
  'C1D2',          // 7
  'C1D4',          // 8
  'C1D8',          // 9
  'C1D15',         // 10
  'C2D1',          // 11
  'WEEK6评估',     // 12 (with note: 前48周每6周（±7 天）)
  'C3D1',          // 13
  'C3D2',          // 14
  'C3D4',          // 15
  'C3D8',          // 16
  'C3D15',         // 17
  'C4',            // 18
  'WEEK12评估',    // 19 (with note: 前48周每6周（±7 天）)
  'C5',            // 20
  'C6',            // 21
  'C7',            // 22
  'C8',            // 23
  'C9',            // 24
  'C10',           // 25
  'C11',           // 26
  '终止治疗原因',   // 27
  '安全性随访',     // 28
  '生存随访1',      // 29
  '生存随访2',      // 30
  '时间窗',        // 31
  '备注说明',       // 32
  '临床疾病进展'    // 33
];

// From worksheet XML, row 1 cell references with shared string indices
const row1Data = [
  { col: 'A', index: 0, value: sharedStrings[0] },
  { col: 'B', index: 1, value: sharedStrings[1] },
  { col: 'C', index: 2, value: sharedStrings[2] },
  { col: 'D', index: 3, value: sharedStrings[3] },
  { col: 'E', index: 4, value: sharedStrings[4] },
  { col: 'F', index: 5, value: sharedStrings[5] },
  { col: 'G', index: 6, value: sharedStrings[6] },
  { col: 'H', index: 7, value: sharedStrings[7], note: 'I1 empty' },
  { col: 'J', index: 8, value: sharedStrings[8], note: 'K1 empty' },
  { col: 'L', index: 9, value: sharedStrings[9], note: 'M1 empty' },
  { col: 'N', index: 10, value: sharedStrings[10], note: 'O1 empty' },
  { col: 'P', index: 11, value: sharedStrings[11], note: 'Q1 empty' },
  { col: 'R', index: 12, value: sharedStrings[12], note: 'S1 empty' },
  { col: 'T', index: 13, value: sharedStrings[13], note: 'U1 empty' },
  { col: 'V', index: 14, value: sharedStrings[14], note: 'W1 empty' },
  { col: 'X', index: 15, value: sharedStrings[15], note: 'Y1 empty' },
  { col: 'Z', index: 16, value: sharedStrings[16], note: 'AA1 empty' },
  { col: 'AB', index: 17, value: sharedStrings[17], note: 'AC1 empty' },
  { col: 'AD', index: 18, value: sharedStrings[18], note: 'AE1 empty' },
  { col: 'AF', index: 19, value: sharedStrings[19], note: 'AG1 empty' },
  { col: 'AH', index: 13, value: sharedStrings[13], note: 'AI1 empty (repeat C3D1?)' },
  { col: 'AJ', index: 14, value: sharedStrings[14], note: 'AK1 empty' },
  { col: 'AL', index: 15, value: sharedStrings[15], note: 'AM1 empty' },
  { col: 'AN', index: 16, value: sharedStrings[16], note: 'AO1 empty' },
  { col: 'AP', index: 17, value: sharedStrings[17], note: 'AQ1 empty' },
  { col: 'AR', index: 20, value: sharedStrings[20], note: 'AS1 empty' },
  { col: 'AT', index: 19, value: sharedStrings[19], note: 'AU1 empty' },
  { col: 'AV', index: 21, value: sharedStrings[21], note: 'AW1 empty' },
  { col: 'AX', index: 22, value: sharedStrings[22], note: 'AY1 empty' },
  { col: 'AZ', index: 23, value: sharedStrings[23], note: 'BA1 empty' },
  { col: 'BB', index: 24, value: sharedStrings[24], note: 'BC1 empty' },
  { col: 'BD', index: 25, value: sharedStrings[25] },
  { col: 'BE', index: -1, value: '(empty)', note: 'BF1 empty' },
  { col: 'BG', index: 26, value: sharedStrings[26] },
  { col: 'BH', index: -1, value: '(empty)', note: 'merged with BG1' },
  { col: 'BI', index: 27, value: sharedStrings[27], note: 'BJ1 merged' },
  { col: 'BK', index: 28, value: sharedStrings[28], note: 'BL1 merged' }
];

console.log('=== Excel 访视时间安排表结构 ===\n');

console.log('【第1-2行：表头】');
console.log('A-G列 (第1-7列): 受试者信息');
row1Data.filter(d => ['A','B','C','D','E','F','G'].includes(d.col)).forEach(d => {
  console.log(\`  \${d.col}1: \${d.value}\`);
});

console.log('\nH列及之后 (第8列起): 访视周期');
console.log('每个访视占1列，包含2行：');
console.log('  - 第1行: 访视周期名称');
console.log('  - 第2行: 时间窗\n');

const visitColumns = [
  { col: 'H', name: 'C1D2', window: 'Day2 ± 2天' },
  { col: 'J', name: 'C1D4', window: 'Day4 ± 2天' },
  { col: 'L', name: 'C1D8', window: 'Day8 ± 2天' },
  { col: 'N', name: 'C1D15', window: 'Day15 ± 3天' },
  { col: 'P', name: 'C2D1', window: 'C1D1+21天' },
  { col: 'R', name: 'WEEK6评估', window: '前48周每6周（±7 天）' },
  { col: 'T', name: 'C3D1', window: 'C2D1+21天' },
  { col: 'V', name: 'C3D2', window: 'C3D1+1天' },
  { col: 'X', name: 'C3D4', window: 'C3D1+3天' },
  { col: 'Z', name: 'C3D8', window: 'C3D1+7天' },
  { col: 'AB', name: 'C3D15', window: 'C3D1+14天' },
  { col: 'AD', name: 'C4', window: 'C3D1+21天' },
  { col: 'AF', name: 'WEEK12评估', window: '前48周每6周（±7 天）' },
  { col: 'AR', name: 'C5', window: 'C4+21天' },
  { col: 'AT', name: 'WEEK18评估', window: '前48周每6周（±7 天）' },
  { col: 'AV', name: 'C6', window: 'C5+21天' },
  { col: 'AX', name: 'C7', window: 'C6+21天' },
  { col: 'AZ', name: 'C8', window: 'C7+21天' },
  { col: 'BB', name: 'C9', window: 'C8+21天' },
  { col: 'BD', name: 'C10', window: 'C9+21天' },
  { col: 'BG', name: 'C11', window: 'C10+21天' },
  { col: 'BI', name: '终止治疗原因', window: 'N/A' },
  { col: 'BK', name: '安全性随访', window: 'EOT+30天' }
];

visitColumns.forEach(d => {
  console.log(\`  \${d.col}列: \${d.name} (时间窗: \${d.window})\`);
});

console.log('\n【第3行及之后：数据行】');
console.log('填写每个受试者的实际访视日期或状态');

console.log('\n=== 关键特征 ===');
console.log('1. 前2行为表头（第1行：周期名称，第2行：时间窗）');
console.log('2. A-G列：受试者基本信息');
console.log('3. H列起：访视周期，每列一个访视点');
console.log('4. 许多列是合并单元格（2列合并）');
console.log('5. 数据行从第3行开始');
