# Time Window Extraction Test Guide

## Summary of Changes

The `VISIT_SCHEDULE_EXTRACTION_PROMPT` has been optimized to improve time window extraction:

1. **Reordered Requirements**: Time window extraction moved to #2 priority with 【重要】 marker
2. **Added Extraction Rules**: Comprehensive rules for extracting time windows from various formats
3. **Enhanced Examples**: All examples now include complete `windowStart` and `windowEnd` values
4. **5-Level Priority System**: Clear extraction priority from direct extraction to default filling

## Build Verification

✅ Build completed successfully
✅ Updated prompts included in dist/main/index.js
✅ Verified presence of new patterns: "时间窗提取规则", "【重要】提取每个访视的时间窗口"

## Manual Testing Procedure

### Option 1: Test with Sample Protocol

1. **Open the Application**
   - The app is running in the background (started with `npm start`)

2. **Navigate to Worksheet 2 (Visit Schedule Editor)**
   - Click on the "Worksheet 2" tab

3. **Upload a Test Protocol**
   - Use any protocol file from your project, or create a test file with:
     ```
     # 访视计划

     ## 筛选期
     - 访视时间：Day -28 至 Day -1

     ## 基线
     - 访视时间：Day 1

     ## C1D1
     - 访视时间：C1D1 ± 2天

     ## C2D1
     - 访视时间：C2D1
     ```

4. **Check the Console**
   - Open DevTools (Ctrl+Shift+I)
   - Look for logs like `[extractVisitSchedule] Parsed data, visitSchedule count: X`
   - Verify the extracted data includes `windowStart` and `windowEnd` for all visits

5. **Verify Results**
   - All visits should have non-empty `windowStart` and `windowEnd` values
   - Time windows should match the protocol format

### Option 2: Quick Console Test

Open the app's console (Ctrl+Shift+I) and run:

```javascript
// Test the prompt format
const testContent = `
# 访视计划
筛选期：Day -28 至 Day -1
基线：Day 1
C1D1：C1D1 ± 2天
C2D1：C2D1
`;

// This will be processed by the AI when you upload a file
// Check the console for extracted results
```

### Option 3: Excel Export Verification

After extracting visit schedule:

1. Export to Excel
2. Open Worksheet 2 (访视时间核对表)
3. Check the 2-row header:
   - Row 1: Visit names
   - Row 2: Time windows (should be populated, not empty)

## Expected Results

| Visit Type | Expected windowStart | Expected windowEnd |
|------------|---------------------|-------------------|
| 筛选期 | Day -28 | Day -1 |
| 基线 | Day 1 | Day 1 |
| C1D1 ± 2天 | C1D1 | C1D1 ± 2天 |
| C1D8 (无窗口) | C1D8 | C1D8 |
| Week 12 ± 7天 | Week 12 | Week 12 ± 7天 |

## Success Criteria

✅ All extracted visits include `windowStart` and `windowEnd`
✅ Time windows match the protocol format (Day format, C1D1 format, etc.)
✅ Excel export shows populated time windows in row 2 header
✅ No empty or null values for time window fields

## Troubleshooting

**If time windows are still empty:**
1. Check the API connection is working
2. Verify the prompt is being sent correctly (check console logs)
3. Try with a simpler protocol format
4. Check for API errors in the console

**If extraction fails:**
1. Check the API key is valid
2. Verify network connectivity
3. Check the truncated content length in logs
4. Try with a shorter protocol

## Test Cases Reference

See `test-time-window.js` for detailed test cases:
- Test Case 1: Basic visit schedule with time windows
- Test Case 2: Table format with time windows
- Test Case 3: Cycle notation only (no explicit windows)
