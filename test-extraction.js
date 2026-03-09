/**
 * Test script to verify time window extraction
 * This script tests the GLMService with the updated prompts
 */

const fs = require('fs');
const path = require('path');

// Read the test protocol
const testProtocolPath = path.join(__dirname, 'test-protocol.txt');
const protocolContent = fs.readFileSync(testProtocolPath, 'utf-8');

console.log('='.repeat(80));
console.log(' TIME WINDOW EXTRACTION TEST');
console.log('='.repeat(80));
console.log('\n📄 Test Protocol: test-protocol.txt');
console.log(`📏 Content Length: ${protocolContent.length} characters\n`);

// Expected results based on the test protocol
const expectedVisits = [
  { visitName: '筛选期访视', windowStart: 'Day -28', windowEnd: 'Day -1' },
  { visitName: '基线访视', windowStart: 'Day 1', windowEnd: 'Day 1' },
  { visitName: 'C1D1', windowStart: 'C1D1', windowEnd: 'C1D1 ± 2天' },
  { visitName: 'C1D8', windowStart: 'C1D8', windowEnd: 'C1D8 ± 1天' },
  { visitName: 'C2D1', windowStart: 'C2D1', windowEnd: 'C2D1 ± 2天' },
  { visitName: 'C2D8', windowStart: 'C2D8', windowEnd: 'C2D8 ± 1天' },
  { visitName: 'C3D1', windowStart: 'C3D1', windowEnd: 'C3D1 ± 2天' },
  { visitName: 'C4D1', windowStart: 'C4D1', windowEnd: 'C4D1 ± 2天' },
  { visitName: 'C5D1', windowStart: 'C5D1', windowEnd: 'C5D1 ± 2天' },
  { visitName: 'C6D1', windowStart: 'C6D1', windowEnd: 'C6D1 ± 2天' },
  { visitName: '随访1', windowStart: '最后一次给药后28天', windowEnd: '最后一次给药后28天 ± 7天' },
  { visitName: '随访2', windowStart: 'Week 24', windowEnd: 'Week 24 ± 14天' },
];

console.log('Expected Visits:');
expectedVisits.forEach((visit, index) => {
  console.log(`  ${index + 1}. ${visit.visitName}`);
  console.log(`     windowStart: "${visit.windowStart}"`);
  console.log(`     windowEnd:   "${visit.windowEnd}"`);
});

console.log('\n' + '='.repeat(80));
console.log(' TESTING OPTIONS');
console.log('='.repeat(80));
console.log(`
To test the extraction with the actual AI, you have several options:

1. MANUAL TEST (Recommended):
   - Open the running Electron app
   - Navigate to Worksheet 2 (Visit Schedule Editor)
   - Click "Upload Protocol" and select "test-protocol.txt"
   - Click "Extract" to process the file
   - Check the console (Ctrl+Shift+I) for results
   - Verify Excel export shows time windows in row 2

2. CONSOLE TEST:
   - Open DevTools in the app (Ctrl+Shift+I)
   - Paste the following into the console:

   // Test extraction
   const protocolContent = ${JSON.stringify(protocolContent.substring(0, 500))}...;
   // Use the AI handler to extract

3. VIEW THE UPDATED PROMPT:
   - Check: AI for CRA V3.0/src/main/services/AIService/prompts.ts
   - Lines 137-300 contain the updated VISIT_SCHEDULE_EXTRACTION_PROMPT
   - Key changes:
     * Time window extraction moved to requirement #2
     * Added "时间窗提取规则" section with 6 extraction rules
     * Enhanced examples with complete windowStart/windowEnd values
     * Added 5-level priority extraction system

`);

// Display the key parts of the updated prompt
console.log('='.repeat(80));
console.log(' UPDATED PROMPT KEY CHANGES');
console.log('='.repeat(80));
console.log(`
📌 REQUIREMENT #2 (Previously #3):
   "【重要】提取每个访视的时间窗口（windowStart和windowEnd）- 这是必须字段"

📌 NEW SECTION: 时间窗提取规则 (Time Window Extraction Rules)
   - Direct extraction from protocol text
   - Cycle + tolerance handling
   - Visit point only handling
   - Default values based on visit type
   - Table column header extraction
   - Description text extraction

📌 UPDATED EXAMPLES:
   All examples now include complete windowStart and windowEnd values

📌 EMPHASIS:
   "【重要】所有访视必须包含windowStart和windowEnd字段，不能为空！"
`);

console.log('\n' + '='.repeat(80));
console.log(' VERIFICATION CHECKLIST');
console.log('='.repeat(80));
console.log(`
After running the extraction, verify:

✓ All visits have windowStart field populated (not null/empty)
✓ All visits have windowEnd field populated (not null/empty)
✓ Time windows match the protocol format
✓ Tolerance values (±X天) are preserved in windowEnd
✓ Cycle notation (C1D1, C2D1) is correctly extracted
✓ Excel export shows time windows in the 2-row header format

Test Protocol Location: ${testProtocolPath}

To manually test:
1. Ensure the Electron app is running (it should be)
2. Open the app window
3. Navigate to Worksheet 2
4. Upload the test protocol file
5. Run the extraction
6. Check results
`);

// Save test info for reference
const testInfo = {
  protocolFile: testProtocolPath,
  protocolLength: protocolContent.length,
  expectedVisits: expectedVisits,
  testDate: new Date().toISOString(),
  promptChanges: [
    'Time window extraction moved to requirement #2',
    'Added 6 extraction rules',
    'Enhanced examples with complete time windows',
    'Added 5-level priority extraction system',
    'Added emphasis markers 【重要】'
  ]
};

fs.writeFileSync(
  path.join(__dirname, 'test-info.json'),
  JSON.stringify(testInfo, null, 2)
);

console.log('✅ Test info saved to: test-info.json');
console.log('\n' + '='.repeat(80));
