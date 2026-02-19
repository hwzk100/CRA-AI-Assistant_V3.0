/**
 * Application constants for CRA AI Assistant V3.0
 */

// ============================================================================
// App Information
// ============================================================================

export const APP_INFO = {
  NAME: 'CRA AI Assistant',
  VERSION: '3.0.0',
  DESCRIPTION: '临床试验填写tracker表助手',
  AUTHOR: 'CRA AI Team',
  HOMEPAGE: 'https://github.com/cra-ai/assistant',
} as const;

// ============================================================================
// UI Constants (User Experience First - Large, Friendly)
// ============================================================================

export const UI_CONSTANTS = {
  // Font sizes (larger for accessibility)
  FONT_SIZE: {
    XS: '14px',
    SM: '16px',
    BASE: '18px',
    LG: '20px',
    XL: '24px',
    '2XL': '28px',
    '3XL': '32px',
  },

  // Button dimensions (minimum 44px touch target)
  BUTTON: {
    HEIGHT_MIN: '44px',
    HEIGHT_LARGE: '48px',
    PADDING_X: '32px',
    PADDING_Y: '12px',
  },

  // Border radius (friendly appearance)
  BORDER_RADIUS: {
    SM: '8px',
    MD: '12px',
    LG: '16px',
    XL: '20px',
  },

  // Spacing (comfortable whitespace)
  SPACING: {
    XS: '4px',
    SM: '8px',
    MD: '16px',
    LG: '24px',
    XL: '32px',
    '2XL': '48px',
  },

  // Animation durations
  ANIMATION: {
    FAST: '150ms',
    NORMAL: '200ms',
    SLOW: '300ms',
  },

  // Toast/Notification durations
  NOTIFICATION: {
    SHORT: 3000,
    NORMAL: 5000,
    LONG: 8000,
  },
} as const;

// ============================================================================
// File Constants
// ============================================================================

export const FILE_CONSTANTS = {
  // Maximum file size (50MB)
  MAX_FILE_SIZE: 50 * 1024 * 1024,

  // Supported file extensions
  SUPPORTED_EXTENSIONS: {
    PDF: ['.pdf'],
    IMAGE: ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp'],
    ARCHIVE: ['.zip', '.rar', '.7z'],
  },

  // MIME types
  MIME_TYPES: {
    PDF: 'application/pdf',
    PNG: 'image/png',
    JPEG: 'image/jpeg',
    GIF: 'image/gif',
  },

  // OCR languages
  OCR_LANGUAGES: {
    CHINESE_SIMPLIFIED: 'chi_sim',
    CHINESE_TRADITIONAL: 'chi_tra',
    ENGLISH: 'eng',
    JAPANESE: 'jpn',
    KOREAN: 'kor',
  },
} as const;

// ============================================================================
// AI Constants
// ============================================================================

export const AI_CONSTANTS = {
  // GLM-4 model settings
  MODEL: {
    NAME: 'glm-4',
    MAX_TOKENS: 4096,
    TEMPERATURE: 0.3,
    TOP_P: 0.7,
  },

  // Rate limiting
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 60,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000,
  },

  // Timeout settings
  TIMEOUT: {
    DEFAULT: 30000, // 30 seconds
    OCR: 60000, // 60 seconds
    EXTRACT: 45000, // 45 seconds
  },
} as const;

// ============================================================================
// Excel Constants
// ============================================================================

export const EXCEL_CONSTANTS = {
  // Worksheet names
  WORKSHEET_NAMES: {
    CRITERIA: '入排标准核对',
    VISIT_SCHEDULE: '访视时间安排表',
    MEDICATION: '合并用药和既往用药核对',
    SUMMARY: '汇总',
  },

  // Column widths (in characters)
  COLUMN_WIDTHS: {
    NARROW: 12,
    MEDIUM: 20,
    WIDE: 40,
    EXTRA_WIDE: 60,
  },

  // Row heights (in points)
  ROW_HEIGHTS: {
    HEADER: 25,
    NORMAL: 20,
    TALL: 30,
  },

  // Colors (ARGB format)
  COLORS: {
    HEADER_BG: 'FF4472C4',
    HEADER_TEXT: 'FFFFFFFF',
    INCLUSION_BG: 'FFD9F2D9',
    EXCLUSION_BG: 'FFFFD9D9',
    PENDING_BG: 'FFFFFFE0',
    CONFIRMED_BG: 'FFD9F2D9',
  },
} as const;

// ============================================================================
// Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  API_KEY: 'cra_api_key',
  SETTINGS: 'cra_settings',
  WORKSHEET_DATA: 'cra_worksheet_data',
  FILES: 'cra_files',
} as const;

// ============================================================================
// Error Messages (Chinese)
// ============================================================================

export const ERROR_MESSAGES = {
  // General errors
  UNKNOWN_ERROR: '发生未知错误，请稍后重试',

  // File errors
  FILE_NOT_FOUND: '找不到文件',
  FILE_TOO_LARGE: '文件太大，请上传小于50MB的文件',
  FILE_TYPE_NOT_SUPPORTED: '不支持的文件类型',
  FILE_UPLOAD_FAILED: '文件上传失败',
  FILE_DELETE_FAILED: '文件删除失败',

  // AI errors
  AI_API_KEY_MISSING: '请先设置API密钥',
  AI_API_KEY_INVALID: 'API密钥无效',
  AI_REQUEST_FAILED: 'AI请求失败，请检查网络连接',
  AI_RESPONSE_INVALID: 'AI响应格式无效',
  AI_RATE_LIMIT_EXCEEDED: '请求过于频繁，请稍后再试',
  AI_TIMEOUT: 'AI请求超时，请稍后重试',

  // Excel errors
  EXCEL_EXPORT_FAILED: 'Excel导出失败',
  EXCEL_SAVE_FAILED: 'Excel保存失败',
  EXCEL_INVALID_PATH: '无效的保存路径',

  // Validation errors
  VALIDATION_FAILED: '数据验证失败',
  REQUIRED_FIELD_MISSING: '缺少必填字段',
  INVALID_DATE_FORMAT: '日期格式无效',
  INVALID_NUMBER_FORMAT: '数字格式无效',
} as const;

// ============================================================================
// Success Messages (Chinese)
// ============================================================================

export const SUCCESS_MESSAGES = {
  // File operations
  FILE_UPLOADED: '文件上传成功',
  FILE_DELETED: '文件删除成功',
  FILE_PROCESSED: '文件处理完成',

  // AI operations
  CRITERIA_EXTRACTED: '入排标准提取成功',
  VISIT_SCHEDULE_EXTRACTED: '访视计划提取成功',
  MEDICATIONS_RECOGNIZED: '用药信息识别成功',

  // Excel operations
  EXCEL_EXPORTED: 'Excel导出成功',

  // Edit operations
  CHANGES_SAVED: '更改已保存',
  ITEM_ADDED: '添加成功',
  ITEM_UPDATED: '更新成功',
  ITEM_DELETED: '删除成功',
} as const;

// ============================================================================
// Validation Patterns
// ============================================================================

export const VALIDATION_PATTERNS = {
  // Date patterns (Chinese format)
  DATE: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  DATE_TIME: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,

  // Number patterns
  POSITIVE_NUMBER: /^[1-9]\d*$/,
  DECIMAL_NUMBER: /^\d+(\.\d+)?$/,

  // Dose patterns
  DOSAGE: /^\d+(\.\d+)?(mg|g|ml|µg|mcg)?$/i,
} as const;
