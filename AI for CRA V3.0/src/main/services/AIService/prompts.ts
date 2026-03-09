/**
 * AI Prompt Templates for CRA AI Assistant V3.0
 * GLM-4 prompt templates for extracting clinical trial information
 */

// ============================================================================
// System Prompt
// ============================================================================

export const SYSTEM_PROMPT = `你是一个专业的临床研究助理（CRA）助手，专门帮助处理临床试验方案文档和受试者医疗记录。你具备以下能力：

1. 精确提取临床试验方案中的入排标准
2. 识别和整理访视计划表
3. 从医疗记录中识别用药信息
4. 理解临床试验相关的医学术语和缩写

你的回答应该：
- 准确、完整、条理清晰
- 严格遵循JSON格式输出
- 对于不确定的信息，标记为null或"不确定"
- 保持专业术语的准确性
- 使用简体中文输出

请严格按照要求的JSON格式输出结果，不要包含任何额外的文字说明。`;

// ============================================================================
// Worksheet 1: Criteria Extraction Prompts
// ============================================================================

/**
 * Prompt for extracting inclusion and exclusion criteria from protocol
 */
export const CRITERIA_EXTRACTION_PROMPT = `请从以下临床试验方案文件中提取完整的入组和排除标准。

**要求：**
1. 识别所有入组标准（Inclusion Criteria）
2. 识别所有排除标准（Exclusion Criteria）
3. 提取每个标准的编号和完整描述
4. 识别标准的分类（如果方案中有分类）
5. 保持原文的准确性，不要遗漏任何细节

**输出格式（JSON）：**
\`\`\`json
{
  "inclusionCriteria": [
    {
      "number": "1",
      "description": "完整的入组标准描述文本",
      "category": "人口学/医学/实验室检查等（如果有）"
    }
  ],
  "exclusionCriteria": [
    {
      "number": "1",
      "description": "完整的排除标准描述文本",
      "category": "医学/安全/合并用药等（如果有）"
    }
  ]
}
\`\`\`

**注意：**
- 如果标准没有明确编号，请按顺序编号为1、2、3...
- 如果没有分类，category字段可以为空字符串
- description字段必须包含完整的标准描述
- 仔细区分入组标准和排除标准

**方案内容：**
{content}

请严格按照JSON格式输出，不要包含任何其他文字。`;

/**
 * Prompt for extracting criteria with specific focus areas
 */
export const CRITERIA_EXTRACTION_DETAILED_PROMPT = `请从以下临床试验方案文件中详细提取入排标准，并标注关键要素。

**要求：**
1. 提取入组和排除标准的完整描述
2. 识别每个标准的关键要素（年龄、诊断、实验室值等）
3. 标注可量化的指标（如：年龄≥18岁，HB≥100g/L）
4. 识别标准的分类

**输出格式（JSON）：**
\`\`\`json
{
  "inclusionCriteria": [
    {
      "number": "1",
      "description": "完整的入组标准描述",
      "category": "分类",
      "keyElements": ["关键要素1", "关键要素2"]
    }
  ],
  "exclusionCriteria": [
    {
      "number": "1",
      "description": "完整的排除标准描述",
      "category": "分类",
      "keyElements": ["关键要素1", "关键要素2"]
    }
  ]
}
\`\`\`

**方案内容：**
{content}

请严格按照JSON格式输出。`;

// ============================================================================
// Worksheet 2: Visit Schedule Extraction Prompts
// ============================================================================

/**
 * Prompt for extracting visit schedule from protocol
 */
export const VISIT_SCHEDULE_EXTRACTION_PROMPT = `请从以下临床试验方案文件中提取完整的访视计划表。

**重点关注：**
- 请优先从方案的**流程表**（Study Flow Chart/Schema）、**访视计划表**（Visit Schedule）、**评估表**（Assessment Schedule）等表格中提取信息
- 这些表格通常包含完整的访视时间安排和检查项目清单
- 如果有多个表格，请整合所有相关信息

**周期(Cycle)模式识别：**
- 周期访视格式识别：C1D1、C2D1、C3D1、C1D8、C2D8（表示周期X第Y天）
- 中文周期格式：周期1第1天、治疗周期1 Day 1、第1周期第1天
- 英文周期格式：Cycle 1 Day 1、Cycle 2 Day 8、C1D1、C2D1
- 混合格式：C1-D1、Cycle1-Day1、C1 D1

**访视阶段分类：**
- 筛选期：筛选访视、Screening、筛选期
- 基线：基线访视、Baseline、Day 0、Day 1（首次给药前）
- 治疗周期：C1D1、C2D1、Cycle 1 Day 1等周期性访视
- 随访期：随访、Follow-up、治疗结束访视、安全性随访

**要求：**
1. 识别所有访视（筛选期、治疗期、随访期等）
2. 提取每个访视的编号和名称：
   - 访视编号应反映方案中的原始格式
   - 周期访视编号：使用 "1", "2", "3" 等顺序编号，或在 visitName 中保留周期信息
   - 例如：C1D1 → visitNumber: "1", visitName: "C1D1 (周期1第1天)"
   - 基线访视：visitNumber: "0" 或 "基线"
   - 筛选期：visitNumber: "-1", "-2" 或按方案原文
3. 提取访视的时间窗口（开始时间和结束时间）
4. 提取每个访视的程序/操作项目（最多提取10个主要的）
5. 提取每个访视的评估/检查项目（最多提取10个主要的）

**重要限制：**
- 每个访视的 procedures 和 assessments 最多只提取 10 个最主要的项目
- 项目名称要简洁，避免冗余描述
- 不要包含任何解释性文字或备注
- JSON必须完整且格式正确

**关键提取原则：**
- 仅提取方案中**明确描述**的访视，不要自动补充或推断缺失的周期
- 如果方案只描述了C1D1和C2D1，只提取这两个访视，不要补充C3D1、C4D1等
- 保留原始访视名称中的周期信息（如C1D1、Cycle 1 Day 1），不要简化或标准化
- 如果方案用表格形式展示周期模式（如C1D1~C6D1），提取每个明确列出的周期访视

**输出格式（JSON）：**
\`\`\`json
{
  "visitSchedule": [
    {
      "visitNumber": "1",
      "visitName": "筛选期访视",
      "windowStart": "Day -28",
      "windowEnd": "Day -1",
      "procedures": [
        {
          "name": "知情同意",
          "category": "screening",
          "timing": "Day -28",
          "required": true
        }
      ],
      "assessments": [
        {
          "name": "血常规",
          "type": "lab",
          "timing": "Day -1",
          "required": true
        }
      ]
    }
  ]
}
\`\`\`

**提取示例：**

示例1 - 周期性访视：
{
  "visitSchedule": [
    {
      "visitNumber": "-1",
      "visitName": "筛选期访视",
      "windowStart": "Day -28",
      "windowEnd": "Day -1",
      ...
    },
    {
      "visitNumber": "0",
      "visitName": "基线访视",
      "windowStart": "Day 1",
      "windowEnd": "Day 1",
      ...
    },
    {
      "visitNumber": "1",
      "visitName": "C1D1 (周期1第1天)",
      "windowStart": "C1D1",
      "windowEnd": "C1D1",
      ...
    },
    {
      "visitNumber": "2",
      "visitName": "C1D8 (周期1第8天)",
      "windowStart": "C1D8",
      "windowEnd": "C1D8 ± 2天",
      ...
    },
    {
      "visitNumber": "3",
      "visitName": "C2D1 (周期2第1天)",
      "windowStart": "C2D1",
      "windowEnd": "C2D1",
      ...
    }
  ]
}

注意：如果方案只写了C1D1和C2D1，不要自动补充C3D1、C4D1等后续周期。

**分类说明：**
- procedures category:
  - "screening"(筛选期) - 筛选阶段的程序
  - "baseline"(基线) - 基线/入组程序
  - "treatment"(治疗) - 治疗周期程序（包括各周期访视）
  - "follow-up"(随访) - 随访期程序
  - "other"(其他) - 其他阶段程序

- assessments type:
  - "vital"(生命体征) - 体征测量
  - "lab"(实验室检查) - 血液/尿液/其他实验室检查
  - "ecg"(心电图) - 心电图检查
  - "imaging"(影像学) - CT/MRI/X光等影像检查
  - "questionnaire"(问卷) - PRO/生活质量问卷
  - "other"(其他) - 其他评估类型

- timing格式:
  - 周期访视使用原文：如 "Cycle 1 Day 1", "C1D1", "周期1第1天"
  - 筛选/基线/随访：使用方案原文，如 "Day -28", "Week 1", "筛选期", "访视当天"
  - 保留所有原始时间描述，不要转换或简化

**时间窗口格式：**
- 使用方案中的原文描述，保留所有格式细节
- 周期访视示例： "Cycle 1 Day 1", "C1D1", "周期1第1天 (C1D1)"
- 筛选期示例： "Day -28 ~ Day -1", "筛选期 -28天至-1天"
- 基线示例： "Day 0", "Day 1 (首次给药)"
- 随访示例： "Week 12 ± 7天", "治疗结束后30天"
- 如果方案中只写 "C1D1" 没有窗口，windowStart 和 windowEnd 都填 "C1D1"

**方案内容：**
{content}

请严格按照JSON格式输出。`;

/**
 * Prompt for extracting simplified visit schedule
 */
export const VISIT_SCHEDULE_SIMPLE_PROMPT = `请从以下临床试验方案文件中提取访视计划的基本信息。

**要求：**
1. 识别所有访视
2. 提取访视编号、名称和时间窗口
3. 列出主要程序和评估项目

**输出格式（JSON）：**
\`\`\`json
{
  "visitSchedule": [
    {
      "visitNumber": "1",
      "visitName": "筛选期访视",
      "windowStart": "Day -28",
      "windowEnd": "Day -1",
      "procedures": ["知情同意", "签署知情同意书"],
      "assessments": ["血常规", "肝肾功能", "心电图"]
    }
  ]
}
\`\`\`

**方案内容：**
{content}

请严格按照JSON格式输出。`;

// ============================================================================
// Worksheet 3: Medication Recognition Prompts
// ============================================================================

/**
 * Prompt for recognizing medications from medical records
 */
export const MEDICATION_RECOGNITION_PROMPT = `请从以下受试者医疗记录中识别并提取所有用药信息，包括合并用药和既往用药。

**要求：**
1. 识别所有药物名称（通用名优先，商品名可标注）
2. 提取剂量信息
3. 提取用药频次
4. 识别给药途径（口服、静脉、外用等）
5. 提取开始日期和结束日期（如果注明）
6. 识别用药适应症/原因
7. 评估识别的置信度

**输出格式（JSON）：**
\`\`\`json
{
  "medications": [
    {
      "medicationName": "阿司匹林",
      "dosage": "100mg",
      "frequency": "每日一次",
      "route": "口服",
      "startDate": "2024-01-15",
      "endDate": null,
      "indication": "冠心病预防",
      "confidence": "high"
    }
  ]
}
\`\`\`

**置信度说明：**
- "high": 信息完整明确，来自病历记录
- "medium": 信息基本完整，部分内容需要推断
- "low": 信息不完整，需要进一步确认

**日期格式：**
- 使用YYYY-MM-DD格式
- 如果日期不确定，标注为null
- 对于"长期"、" ongoing"等情况，endDate标注为null

**用药途径标准化：**
- 口服、静脉注射、肌肉注射、皮下注射、外用、吸入等

**医疗记录内容：**
{content}

请严格按照JSON格式输出。`;

/**
 * Prompt for recognizing medications with detailed analysis
 */
export const MEDICATION_RECOGNITION_DETAILED_PROMPT = `请从以下受试者医疗记录中详细识别用药信息。

**要求：**
1. 区分当前用药和既往用药
2. 识别处方药和非处方药
3. 提取完整的用药信息
4. 标注药物相互作用的风险因素

**输出格式（JSON）：**
\`\`\`json
{
  "currentMedications": [
    {
      "medicationName": "阿司匹林",
      "dosage": "100mg",
      "frequency": "qd",
      "route": "po",
      "startDate": "2024-01-15",
      "indication": "冠心病二级预防",
      "isPrescription": true,
      "confidence": "high"
    }
  ],
  "pastMedications": [
    {
      "medicationName": "布洛芬",
      "dosage": "200mg",
      "frequency": "prn",
      "route": "po",
      "startDate": "2023-06-01",
      "endDate": "2023-08-01",
      "indication": "止痛",
      "isPrescription": false,
      "confidence": "medium"
    }
  ]
}
\`\`\`

**医疗记录内容：**
{content}

请严格按照JSON格式输出。`;

// ============================================================================
// Chat/Question Prompts
// ============================================================================

/**
 * Follow-up question prompt for criteria clarification
 */
export const CRITERIA_CLARIFICATION_PROMPT = `基于以下临床试验方案的入排标准，请回答用户的问题。

**入组标准：**
{inclusionCriteria}

**排除标准：**
{exclusionCriteria}

**用户问题：**
{question}

请提供准确、专业的回答，并引用相关标准的编号。`;

/**
 * Follow-up question prompt for visit schedule clarification
 */
export const VISIT_SCHEDULE_CLARIFICATION_PROMPT = `基于以下临床试验方案的访视计划，请回答用户的问题。

**访视计划：**
{visitSchedule}

**用户问题：**
{question}

请提供准确、专业的回答，并引用相关访视的编号。`;

// ============================================================================
// Subject Data Extraction Prompts
// ============================================================================

/**
 * Prompt for extracting subject number from medical records
 */
export const SUBJECT_NUMBER_EXTRACTION_PROMPT = `请从以下受试者医疗记录中提取受试者编号。

**要求：**
1. 识别受试者编号（可能标记为：受试者编号、Subject ID、Subject No、受试者号等）
2. 提取完整的编号（如001、002、SUB-001等）
3. 如果没有明确的受试者编号，根据文件名、病历号等信息推断

**输出格式（JSON）：**
\`\`\`json
{
  "subjectNumber": "001"
}
\`\`\`

**医疗记录内容：**
{content}

请严格按照JSON格式输出。如果找不到受试者编号，返回空字符串""。`;

/**
 * Prompt for extracting subject visit dates from medical records
 */
export const SUBJECT_VISIT_DATES_PROMPT = `请从以下受试者医疗记录中提取各访视的实际访视时间。

**访视计划参考：**
{visitScheduleSummary}

**要求：**
1. 根据访视计划中的访视编号和名称，匹配医疗记录中的实际访视记录
2. 提取每个访视的实际访视日期（YYYY-MM-DD格式）
3. 判断访视状态：completed（已完成）、pending（待进行）、missed（已错过）、not_applicable（不适用）
4. 识别访视相关的备注信息

**输出格式（JSON）：**
\`\`\`json
{
  "visits": [
    {
      "visitScheduleId": "1",
      "actualVisitDate": "2024-01-15",
      "status": "completed",
      "notes": "访视完成，无不良事件"
    }
  ]
}
\`\`\`

**状态说明：**
- completed: 已完成访视
- pending: 访视尚未进行
- missed: 错过访视窗口
- not_applicable: 该访视不适用于此受试者

**医疗记录内容：**
{content}

请严格按照JSON格式输出。`;

/**
 * Prompt for extracting subject visit item dates from medical records
 */
export const SUBJECT_VISIT_ITEMS_PROMPT = `请从以下受试者医疗记录中提取各访视项目的实际完成时间。

**访视项目参考：**
{visitItemsSummary}

**要求：**
1. 根据访视项目列表，匹配医疗记录中的实际完成记录
2. 提取每个项目的实际完成日期（YYYY-MM-DD格式）
3. 判断项目状态：completed（已完成）、pending（待进行）、not_done（未进行）、not_applicable（不适用）
4. 识别项目相关的备注信息

**输出格式（JSON）：**
\`\`\`json
{
  "items": [
    {
      "visitScheduleId": "1",
      "itemName": "知情同意",
      "itemType": "procedure",
      "actualDate": "2024-01-15",
      "status": "completed",
      "notes": "已完成签署"
    }
  ]
}
\`\`\`

**状态说明：**
- completed: 项目已完成
- pending: 项目待进行
- not_done: 项目未进行
- not_applicable: 该项目不适用于此受试者

**医疗记录内容：**
{content}

请严格按照JSON格式输出。`;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format a prompt by replacing placeholders
 */
export const formatPrompt = (template: string, params: Record<string, string>): string => {
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
};

/**
 * Truncate content to fit within token limits
 *
 * Note: Reduced to 3000 tokens for visit schedule extraction to prevent ECONNRESET errors.
 * The VISIT_SCHEDULE_EXTRACTION_PROMPT is very long (~180 lines), so we need to limit
 * the content size more aggressively to avoid timeout issues.
 */
export const truncateContent = (content: string, maxTokens: number = 3000): string => {
  // Rough estimate: 1 token ≈ 2 characters for Chinese
  const maxChars = maxTokens * 2;
  if (content.length <= maxChars) {
    return content;
  }
  console.log(`[truncateContent] Truncating content from ${content.length} to ${maxChars} characters`);
  return content.substring(0, maxChars) + '\n\n[内容已截断，原文较长，仅展示部分内容...]';
};
