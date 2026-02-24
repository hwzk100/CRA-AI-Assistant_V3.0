/**
 * Application constants for CRA AI Assistant V3.0
 */
export declare const APP_INFO: {
    readonly NAME: "CRA AI Assistant";
    readonly VERSION: "3.0.0";
    readonly DESCRIPTION: "临床试验填写tracker表助手";
    readonly AUTHOR: "CRA AI Team";
    readonly HOMEPAGE: "https://github.com/cra-ai/assistant";
};
export declare const UI_CONSTANTS: {
    readonly FONT_SIZE: {
        readonly XS: "14px";
        readonly SM: "16px";
        readonly BASE: "18px";
        readonly LG: "20px";
        readonly XL: "24px";
        readonly '2XL': "28px";
        readonly '3XL': "32px";
    };
    readonly BUTTON: {
        readonly HEIGHT_MIN: "44px";
        readonly HEIGHT_LARGE: "48px";
        readonly PADDING_X: "32px";
        readonly PADDING_Y: "12px";
    };
    readonly BORDER_RADIUS: {
        readonly SM: "8px";
        readonly MD: "12px";
        readonly LG: "16px";
        readonly XL: "20px";
    };
    readonly SPACING: {
        readonly XS: "4px";
        readonly SM: "8px";
        readonly MD: "16px";
        readonly LG: "24px";
        readonly XL: "32px";
        readonly '2XL': "48px";
    };
    readonly ANIMATION: {
        readonly FAST: "150ms";
        readonly NORMAL: "200ms";
        readonly SLOW: "300ms";
    };
    readonly NOTIFICATION: {
        readonly SHORT: 3000;
        readonly NORMAL: 5000;
        readonly LONG: 8000;
    };
};
export declare const FILE_CONSTANTS: {
    readonly MAX_FILE_SIZE: number;
    readonly SUPPORTED_EXTENSIONS: {
        readonly PDF: readonly [".pdf"];
        readonly IMAGE: readonly [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".webp"];
        readonly ARCHIVE: readonly [".zip", ".rar", ".7z"];
    };
    readonly MIME_TYPES: {
        readonly PDF: "application/pdf";
        readonly PNG: "image/png";
        readonly JPEG: "image/jpeg";
        readonly GIF: "image/gif";
    };
    readonly OCR_LANGUAGES: {
        readonly CHINESE_SIMPLIFIED: "chi_sim";
        readonly CHINESE_TRADITIONAL: "chi_tra";
        readonly ENGLISH: "eng";
        readonly JAPANESE: "jpn";
        readonly KOREAN: "kor";
    };
};
export declare const AI_CONSTANTS: {
    readonly MODEL: {
        readonly NAME: "glm-4";
        readonly MAX_TOKENS: 4096;
        readonly TEMPERATURE: 0.3;
        readonly TOP_P: 0.7;
    };
    readonly RATE_LIMIT: {
        readonly REQUESTS_PER_MINUTE: 60;
        readonly RETRY_ATTEMPTS: 3;
        readonly RETRY_DELAY_MS: 1000;
    };
    readonly TIMEOUT: {
        readonly DEFAULT: 30000;
        readonly OCR: 60000;
        readonly EXTRACT: 45000;
    };
};
export declare const EXCEL_CONSTANTS: {
    readonly WORKSHEET_NAMES: {
        readonly CRITERIA: "入排标准核对";
        readonly VISIT_TIME_CHECKLIST: "访视时间核对表";
        readonly VISIT_ITEM_TIME_CHECKLIST: "访视项目时间核对表";
        readonly MEDICATION: "合并用药和既往用药核对";
        readonly SUMMARY: "汇总";
    };
    readonly COLUMN_WIDTHS: {
        readonly NARROW: 12;
        readonly MEDIUM: 20;
        readonly WIDE: 40;
        readonly EXTRA_WIDE: 60;
    };
    readonly ROW_HEIGHTS: {
        readonly HEADER: 25;
        readonly NORMAL: 20;
        readonly TALL: 30;
    };
    readonly COLORS: {
        readonly HEADER_BG: "FF4472C4";
        readonly HEADER_TEXT: "FFFFFFFF";
        readonly INCLUSION_BG: "FFD9F2D9";
        readonly EXCLUSION_BG: "FFFFD9D9";
        readonly PENDING_BG: "FFFFFFE0";
        readonly CONFIRMED_BG: "FFD9F2D9";
    };
};
export declare const STORAGE_KEYS: {
    readonly API_KEY: "cra_api_key";
    readonly SETTINGS: "cra_settings";
    readonly WORKSHEET_DATA: "cra_worksheet_data";
    readonly FILES: "cra_files";
};
export declare const ERROR_MESSAGES: {
    readonly UNKNOWN_ERROR: "发生未知错误，请稍后重试";
    readonly FILE_NOT_FOUND: "找不到文件";
    readonly FILE_TOO_LARGE: "文件太大，请上传小于50MB的文件";
    readonly FILE_TYPE_NOT_SUPPORTED: "不支持的文件类型";
    readonly FILE_UPLOAD_FAILED: "文件上传失败";
    readonly FILE_DELETE_FAILED: "文件删除失败";
    readonly AI_API_KEY_MISSING: "请先设置API密钥";
    readonly AI_API_KEY_INVALID: "API密钥无效";
    readonly AI_REQUEST_FAILED: "AI请求失败，请检查网络连接";
    readonly AI_RESPONSE_INVALID: "AI响应格式无效";
    readonly AI_RATE_LIMIT_EXCEEDED: "请求过于频繁，请稍后再试";
    readonly AI_TIMEOUT: "AI请求超时，请稍后重试";
    readonly EXCEL_EXPORT_FAILED: "Excel导出失败";
    readonly EXCEL_SAVE_FAILED: "Excel保存失败";
    readonly EXCEL_INVALID_PATH: "无效的保存路径";
    readonly VALIDATION_FAILED: "数据验证失败";
    readonly REQUIRED_FIELD_MISSING: "缺少必填字段";
    readonly INVALID_DATE_FORMAT: "日期格式无效";
    readonly INVALID_NUMBER_FORMAT: "数字格式无效";
};
export declare const SUCCESS_MESSAGES: {
    readonly FILE_UPLOADED: "文件上传成功";
    readonly FILE_DELETED: "文件删除成功";
    readonly FILE_PROCESSED: "文件处理完成";
    readonly CRITERIA_EXTRACTED: "入排标准提取成功";
    readonly VISIT_SCHEDULE_EXTRACTED: "访视计划提取成功";
    readonly MEDICATIONS_RECOGNIZED: "用药信息识别成功";
    readonly EXCEL_EXPORTED: "Excel导出成功";
    readonly CHANGES_SAVED: "更改已保存";
    readonly ITEM_ADDED: "添加成功";
    readonly ITEM_UPDATED: "更新成功";
    readonly ITEM_DELETED: "删除成功";
};
export declare const VALIDATION_PATTERNS: {
    readonly DATE: RegExp;
    readonly DATE_TIME: RegExp;
    readonly POSITIVE_NUMBER: RegExp;
    readonly DECIMAL_NUMBER: RegExp;
    readonly DOSAGE: RegExp;
};
//# sourceMappingURL=app.d.ts.map