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

**要求：**
1. 识别所有访视（筛选期、治疗期、随访期等）
2. 提取每个访视的编号和名称
3. 提取访视的时间窗口（开始时间和结束时间）
4. 提取每个访视的程序/操作项目
5. 提取每个访视的评估/检查项目

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

**分类说明：**
- procedures category: "screening"(筛选), "treatment"(治疗), "follow-up"(随访), "other"(其他)
- assessments type: "vital"(生命体征), "lab"(实验室检查), "ecg"(心电图), "imaging"(影像学), "questionnaire"(问卷), "other"(其他)
- timing格式: 使用方案中的原文描述（如"Day 1", "Week 4", "筛选期", "访视当天"等）

**时间窗口格式：**
- 使用方案中的原文描述（如"Day -28 ~ Day -1", "Week 1 ± 3天", "Cycle 1 Day 1"等）

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
 */
export const truncateContent = (content: string, maxTokens: number = 8000): string => {
  // Rough estimate: 1 token ≈ 2 characters for Chinese
  const maxChars = maxTokens * 2;
  if (content.length <= maxChars) {
    return content;
  }
  return content.substring(0, maxChars) + '\n\n[内容已截断...]';
};
