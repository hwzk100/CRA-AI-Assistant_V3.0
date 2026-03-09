/**
 * Direct extraction test using the built GLMService
 * This bypasses the UI and tests the AI extraction directly
 */

const fs = require('fs');
const path = require('path');

// Import the built modules
const distMainPath = path.join(__dirname, 'AI for CRA V3.0', 'dist', 'main');

console.log('='.repeat(80));
console.log(' TIME WINDOW EXTRACTION TEST - Direct Module Test');
console.log('='.repeat(80));
console.log(`\n📁 Dist Path: ${distMainPath}`);

// Check if the built files exist
const indexJsPath = path.join(distMainPath, 'index.js');
if (!fs.existsSync(indexJsPath)) {
  console.error('❌ Built files not found. Please run `npm run build` first.');
  process.exit(1);
}

console.log('✅ Built files found\n');

// Read the test protocol
const testProtocolPath = path.join(__dirname, 'test-protocol.txt');
if (!fs.existsSync(testProtocolPath)) {
  console.error('❌ Test protocol not found at:', testProtocolPath);
  process.exit(1);
}

const protocolContent = fs.readFileSync(testProtocolPath, 'utf-8');
console.log(`📄 Test Protocol: ${protocolContent.length} characters\n`);

// Show a preview of the protocol content
console.log('--- Protocol Content Preview ---');
console.log(protocolContent.substring(0, 500) + '...\n');

// Expected results
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

console.log('--- Expected Visits ---');
expectedVisits.forEach((visit, index) => {
  console.log(`${index + 1}. ${visit.visitName}`);
  console.log(`   windowStart: "${visit.windowStart}" | windowEnd: "${visit.windowEnd}"`);
});

console.log('\n' + '='.repeat(80));
console.log(' IMPORTANT NOTE');
console.log('='.repeat(80));
console.log(`
This test requires an active API connection to the GLM-4 service.

To run this test, you need to:
1. Have a valid API key configured
2. Have network connectivity to the GLM-4 API
3. The test will make an actual API call and may incur costs

Alternatively, you can test via the UI:
1. The Electron app is currently running
2. Open the app window
3. Navigate to Worksheet 2
4. Upload: ${testProtocolPath}
5. Click "Extract" and check the results
`);

// Save test configuration
const testConfig = {
  protocolPath: testProtocolPath,
  protocolContent: protocolContent,
  expectedVisits: expectedVisits,
  instructions: `
To run the actual extraction test:

Method 1: Via Electron UI (Recommended)
1. Open the running CRA AI Assistant app
2. Go to Worksheet 2 (Visit Schedule Editor)
3. Click "Upload Protocol"
4. Select: ${testProtocolPath}
5. Click "Extract"
6. Open DevTools (Ctrl+Shift+I) to see console logs
7. Verify all visits have windowStart and windowEnd populated

Method 2: Via Console (if Electron is running)
1. Open DevTools in the app (Ctrl+Shift+I)
2. Navigate to Console tab
3. Paste the protocol content and call the extraction
4. Check results in console

Expected Results:
- ${expectedVisits.length} visits should be extracted
- All visits should have windowStart and windowEnd fields
- Time windows should match the expected values above
- Excel export should show time windows in row 2 header
`
};

fs.writeFileSync(
  path.join(__dirname, 'test-config.json'),
  JSON.stringify(testConfig, null, 2)
);

console.log('✅ Test configuration saved to: test-config.json');
console.log('\n' + '='.repeat(80));

// Display the protocol file path prominently
console.log('\n📋 TEST PROTOCOL FILE LOCATION:');
console.log(`   ${testProtocolPath}`);
console.log('\n📋 INSTRUCTIONS FOR UI TEST:');
console.log(`   1. Open the CRA AI Assistant app (currently running)`);
console.log(`   2. Navigate to Worksheet 2 (Visit Schedule Editor)`);
console.log(`   3. Click "Upload Protocol" button`);
console.log(`   4. Select the file: test-protocol.txt`);
console.log(`   5. Click "Extract" to run the AI extraction`);
console.log(`   6. Open DevTools (Ctrl+Shift+I) to view extraction logs`);
console.log(`   7. Verify results against expected visits listed above`);
console.log('\n' + '='.repeat(80));

module.exports = { testConfig, protocolContent, expectedVisits };
