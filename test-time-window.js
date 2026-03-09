/**
 * Test script to verify time window extraction
 * This tests the updated VISIT_SCHEDULE_EXTRACTION_PROMPT
 */

const testCases = [
  {
    name: "Test Case 1: Basic visit schedule with time windows",
    content: `
# 临床试验访视计划表

## 筛选期
- 访视时间：Day -28 至 Day -1
- 检查项目：血常规、肝肾功能、心电图

## 基线访视
- 访视时间：Day 1
- 检查项目：体格检查、生命体征

## 治疗周期
### C1D1 (周期1第1天)
- 访视时间：C1D1 ± 2天
- 检查项目：研究药物给药、血常规

### C1D8 (周期1第8天)
- 访视时间：C1D8
- 检查项目：血常规、尿常规

### C2D1 (周期2第1天)
- 访视时间：C2D1 ± 2天
- 检查项目：研究药物给药

## 随访期
- 访视时间：Week 12 ± 7天
- 检查项目：安全性评估
`,
    expectedTimeWindows: [
      { visitName: "筛选期", windowStart: "Day -28", windowEnd: "Day -1" },
      { visitName: "基线", windowStart: "Day 1", windowEnd: "Day 1" },
      { visitName: "C1D1", windowStart: "C1D1", windowEnd: "C1D1 ± 2天" },
      { visitName: "C1D8", windowStart: "C1D8", windowEnd: "C1D8" },
      { visitName: "C2D1", windowStart: "C2D1", windowEnd: "C2D1 ± 2天" },
      { visitName: "随访期", windowStart: "Week 12", windowEnd: "Week 12 ± 7天" },
    ]
  },
  {
    name: "Test Case 2: Table format with time windows",
    content: `
# 访视流程表

| 访视编号 | 访视名称 | 时间窗 | 主要程序 |
|---------|---------|--------|---------|
| -1 | 筛选期访视 | Day -28 ~ Day -1 | 知情同意 |
| 0 | 基线访视 | Day 0 | 随机化 |
| 1 | C1D1 | C1D1 | 给药 |
| 2 | C1D8 | C1D8 ± 2天 | 实验室检查 |
| 3 | C2D1 | C2D1 | 给药 |
| 4 | 随访 | Week 12 ± 7天 | 安全性随访 |
`,
    expectedTimeWindows: [
      { visitName: "筛选期", windowStart: "Day -28", windowEnd: "Day -1" },
      { visitName: "基线", windowStart: "Day 0", windowEnd: "Day 0" },
      { visitName: "C1D1", windowStart: "C1D1", windowEnd: "C1D1" },
      { visitName: "C1D8", windowStart: "C1D8", windowEnd: "C1D8 ± 2天" },
      { visitName: "C2D1", windowStart: "C2D1", windowEnd: "C2D1" },
      { visitName: "随访", windowStart: "Week 12", windowEnd: "Week 12 ± 7天" },
    ]
  },
  {
    name: "Test Case 3: Cycle notation only (no explicit windows)",
    content: `
# 治疗计划

## 访视安排
- 筛选期访视
- 基线访视 (Day 1)
- C1D1 (周期1第1天)
- C1D8 (周期1第8天)
- C2D1 (周期2第1天)
- C3D1 (周期3第1天)
- 随访期
`,
    expectedTimeWindows: [
      { visitName: "筛选期", windowStart: "Day -28", windowEnd: "Day -1" },
      { visitName: "基线", windowStart: "Day 1", windowEnd: "Day 1" },
      { visitName: "C1D1", windowStart: "C1D1", windowEnd: "C1D1" },
      { visitName: "C1D8", windowStart: "C1D8", windowEnd: "C1D8" },
      { visitName: "C2D1", windowStart: "C2D1", windowEnd: "C2D1" },
      { visitName: "C3D1", windowStart: "C3D1", windowEnd: "C3D1" },
      { visitName: "随访期", windowStart: "随访期", windowEnd: "随访期" },
    ]
  }
];

// Helper function to display test results
function displayTestResult(testCase, result) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${testCase.name}`);
  console.log(`${'='.repeat(60)}`);

  if (!result || !result.visitSchedule) {
    console.log('❌ FAILED: No visit schedule extracted');
    return;
  }

  const visits = result.visitSchedule;
  console.log(`\nExtracted ${visits.length} visits:\n`);

  let allPassed = true;
  visits.forEach((visit, index) => {
    const expected = testCase.expectedTimeWindows[index];
    const hasWindowStart = visit.windowStart && visit.windowStart !== '' && visit.windowStart !== null;
    const hasWindowEnd = visit.windowEnd && visit.windowEnd !== '' && visit.windowEnd !== null;

    const status = (hasWindowStart && hasWindowEnd) ? '✅' : '❌';
    console.log(`${status} Visit ${index + 1}: ${visit.visitName}`);
    console.log(`   windowStart: "${visit.windowStart || '(MISSING)'}"`);
    console.log(`   windowEnd:   "${visit.windowEnd || '(MISSING)'}"`);

    if (expected) {
      if (visit.windowStart !== expected.windowStart) {
        console.log(`   ⚠️  Expected windowStart: "${expected.windowStart}"`);
      }
      if (visit.windowEnd !== expected.windowEnd) {
        console.log(`   ⚠️  Expected windowEnd: "${expected.windowEnd}"`);
      }
    }

    if (!hasWindowStart || !hasWindowEnd) {
      allPassed = false;
    }
  });

  console.log(`\n${allPassed ? '✅ PASSED: All visits have time windows' : '❌ FAILED: Some visits missing time windows'}`);
}

// Export test cases for use in the app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testCases, displayTestResult };
}

console.log(`
═══════════════════════════════════════════════════════════════════════════
  Time Window Extraction Test Cases
═══════════════════════════════════════════════════════════════════════════

This file contains test cases to verify the time window extraction prompt.
To run these tests in the actual app:

1. Open the Electron app
2. Navigate to Worksheet 2 (Visit Schedule)
3. Copy one of the test case contents above
4. Use the AI extraction feature to process the content
5. Check the console output for extracted time windows

The updated prompt should:
- Extract windowStart and windowEnd for ALL visits
- Handle various time window formats (Day X, C1D1, ranges, ±tolerance)
- Provide default values when no explicit time window is given
═══════════════════════════════════════════════════════════════════════════
`);
