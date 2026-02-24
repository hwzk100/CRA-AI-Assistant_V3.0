/**
 * Core type definitions for CRA AI Assistant V3.0
 * Enhanced type safety with Result type for error handling
 */
/**
 * Result type for operations that can fail
 * Provides type-safe error handling without exceptions
 */
export type Result<T, E = AppError> = {
    success: true;
    data: T;
} | {
    success: false;
    error: E;
};
/**
 * Helper function to create a successful result
 */
export declare const ok: <T>(data: T) => Result<T>;
/**
 * Helper function to create a failed result
 */
export declare const err: <E extends AppError>(error: E) => Result<never, E>;
/**
 * Check if result is successful (type guard)
 */
export declare const isSuccess: <T>(result: Result<T>) => result is {
    success: true;
    data: T;
};
/**
 * Check if result is failed (type guard)
 */
export declare const isFailure: <T, E>(result: Result<T, E>) => result is {
    success: false;
    error: E;
};
/**
 * Helper function to unwrap a result (throws if error)
 * Use sparingly - prefer pattern matching with 'success' property
 */
export declare const unwrap: <T>(result: Result<T>) => T;
/**
 * Error categories for different types of failures
 */
export declare enum ErrorCategory {
    /** Business logic failures (e.g., validation, AI extraction) */
    DOMAIN = "domain",
    /** Infrastructure failures (e.g., file I/O, OCR, PDF parsing) */
    INFRASTRUCTURE = "infrastructure",
    /** UI/interaction failures */
    UI = "ui",
    /** Network failures (e.g., API calls) */
    NETWORK = "network"
}
/**
 * Error severity levels for user feedback
 */
export declare enum ErrorSeverity {
    /** Blocks the current operation */
    CRITICAL = "critical",
    /** Allows continuing with a warning */
    WARNING = "warning",
    /** Informational message */
    INFO = "info"
}
/**
 * Recovery actions that can be offered to users
 */
export type RecoveryAction = {
    type: 'retry';
    label: string;
    action: () => void;
} | {
    type: 'navigate';
    label: string;
    path: string;
} | {
    type: 'contact';
    label: string;
    contact: string;
};
/**
 * Application error with user-friendly and technical details
 */
export interface AppError {
    /** Machine-readable error code */
    code: string;
    /** Error category */
    category: ErrorCategory;
    /** Error severity */
    severity: ErrorSeverity;
    /** User-friendly error message (localized) */
    userMessage: string;
    /** Technical error message for debugging */
    technicalMessage: string;
    /** When the error occurred */
    timestamp: Date;
    /** Additional context for debugging */
    context?: Record<string, unknown>;
    /** Optional recovery action */
    recovery?: RecoveryAction;
}
/**
 * Create an application error
 */
export declare const createError: (code: string, category: ErrorCategory, severity: ErrorSeverity, userMessage: string, technicalMessage: string, context?: Record<string, unknown>) => AppError;
/**
 * Storage zones for different file types
 */
export declare enum StorageZone {
    /** Clinical trial protocol files */
    PROTOCOL = "protocol",
    /** Subject medical records */
    SUBJECT = "subject"
}
/**
 * File processing status with granular states
 */
export declare enum FileStatus {
    /** File uploaded but not yet processed */
    PENDING = "pending",
    /** Validating file format and integrity */
    VALIDATING = "validating",
    /** General processing state */
    PROCESSING = "processing",
    /** OCR text extraction in progress */
    OCR_PROCESSING = "ocr_processing",
    /** PDF parsing in progress */
    PDF_PARSING = "pdf_parsing",
    /** Processing completed successfully */
    COMPLETED = "completed",
    /** Processing failed */
    FAILED = "failed",
    /** Processing was cancelled */
    CANCELLED = "cancelled"
}
/**
 * Supported file types for upload
 */
export declare enum FileType {
    PDF = "pdf",
    IMAGE = "image",
    ARCHIVE = "archive"
}
/**
 * File information with processing state
 */
export interface FileInfo {
    /** Unique file ID */
    id: string;
    /** Original filename */
    name: string;
    /** File path */
    path: string;
    /** File type */
    type: FileType;
    /** File size in bytes */
    size: number;
    /** Processing status */
    status: FileStatus;
    /** Upload timestamp */
    uploadedAt: Date;
    /** Processing completion timestamp */
    completedAt?: Date;
    /** Extracted text content (for PDF/images) */
    extractedText?: string;
    /** Processing progress (0-100) */
    progress: number;
    /** Error message if failed */
    error?: string;
    /** Preview URL (for images) */
    previewUrl?: string;
}
/**
 * API configuration
 */
export interface APIConfig {
    /** API key for authentication */
    apiKey: string;
    /** API base URL */
    baseURL: string;
    /** Request timeout in milliseconds */
    timeout: number;
    /** Maximum retry attempts */
    maxRetries: number;
    /** Maximum requests per minute (rate limiting) */
    maxRequestsPerMinute?: number;
}
/**
 * API response wrapper
 */
export interface APIResponse<T> {
    /** Response data */
    data: T;
    /** Response status code */
    status: number;
    /** Response message */
    message?: string;
}
/**
 * IPC channel names for electron communication (as string literals)
 */
export declare const IPCChannel: {
    readonly FILE_UPLOAD: "file:upload";
    readonly FILE_DELETE: "file:delete";
    readonly FILE_PROCESS: "file:process";
    readonly FILE_GET_ALL: "file:getAll";
    readonly AI_EXTRACT_CRITERIA: "ai:extractCriteria";
    readonly AI_EXTRACT_VISIT_SCHEDULE: "ai:extractVisitSchedule";
    readonly AI_RECOGNIZE_MEDICATIONS: "ai:recognizeMedications";
    readonly AI_EXTRACT_SUBJECT_NUMBER: "ai:extractSubjectNumber";
    readonly AI_EXTRACT_SUBJECT_VISITS: "ai:extractSubjectVisits";
    readonly AI_EXTRACT_SUBJECT_ITEMS: "ai:extractSubjectItems";
    readonly AI_CHAT: "ai:chat";
    readonly EXCEL_EXPORT: "excel:export";
    readonly EXCEL_EXPORT_TRACKER: "excel:exportTracker";
    readonly SETTINGS_GET: "settings:get";
    readonly SETTINGS_SET: "settings:set";
    readonly SETTINGS_SET_API_KEY: "settings:setApiKey";
    readonly SYSTEM_GET_VERSION: "system:getVersion";
    readonly SYSTEM_OPEN_EXTERNAL: "system:openExternal";
};
export type IPCChannelType = typeof IPCChannel[keyof typeof IPCChannel];
/**
 * IPC request payload type mapping
 */
export type IPCRequestPayload = {
    'file:upload': {
        zone: StorageZone;
        filePath: string;
    };
    'file:delete': {
        fileId: string;
        zone: StorageZone;
    };
    'file:process': {
        fileId: string;
        zone: StorageZone;
    };
    'file:getAll': {
        zone: StorageZone;
    };
    'ai:extractCriteria': {
        protocolContent: string;
    };
    'ai:extractVisitSchedule': {
        protocolContent: string;
    };
    'ai:recognizeMedications': {
        subjectContent: string;
    };
    'ai:extractSubjectNumber': {
        subjectContent: string;
    };
    'ai:extractSubjectVisits': {
        subjectContent: string;
        visitScheduleSummary: string;
    };
    'ai:extractSubjectItems': {
        subjectContent: string;
        visitItemsSummary: string;
    };
    'ai:chat': {
        message: string;
        context?: string;
    };
    'excel:exportTracker': {
        outputPath: string;
    };
    'settings:setApiKey': {
        apiKey: string;
    };
    'settings:get': undefined;
    'settings:set': {
        settings: Partial<AppSettings>;
    };
    'system:getVersion': undefined;
    'system:openExternal': {
        url: string;
    };
};
/**
 * IPC response type mapping
 */
export type IPCResponsePayload = {
    'file:upload': Result<FileInfo>;
    'file:delete': Result<void>;
    'file:process': Result<FileInfo>;
    'file:getAll': Result<FileInfo[]>;
    'ai:extractCriteria': Result<CriteriaSet>;
    'ai:extractVisitSchedule': Result<VisitSchedule[]>;
    'ai:recognizeMedications': Result<MedicationRecord[]>;
    'ai:extractSubjectNumber': Result<string>;
    'ai:extractSubjectVisits': Result<Array<{
        visitScheduleId: string;
        actualVisitDate?: string;
        status: string;
        notes?: string;
    }>>;
    'ai:extractSubjectItems': Result<Array<{
        visitScheduleId: string;
        itemName: string;
        itemType: string;
        actualDate?: string;
        status: string;
        notes?: string;
    }>>;
    'ai:chat': Result<string>;
    [IPCChannel.SETTINGS_GET]: Result<AppSettings>;
    'excel:exportTracker': Result<string>;
    'settings:set': Result<void>;
    'settings:setApiKey': Result<void>;
    'system:getVersion': Result<string>;
    'system:openExternal': Result<void>;
};
/**
 * Application settings
 */
export interface AppSettings {
    /** GLM-4 API key */
    apiKey: string;
    /** Theme preference */
    theme: 'light' | 'dark';
    /** Language preference */
    language: 'zh-CN' | 'en-US';
    /** Auto-save enabled */
    autoSave: boolean;
    /** Auto-save interval in minutes */
    autoSaveInterval: number;
    /** Show notifications */
    showNotifications: boolean;
    /** Log level */
    logLevel: 'debug' | 'info' | 'warn' | 'error';
}
/**
 * Default application settings
 */
export declare const DEFAULT_SETTINGS: AppSettings;
export interface CriteriaSet {
    inclusionCriteria: InclusionCriteria[];
    exclusionCriteria: ExclusionCriteria[];
}
export interface InclusionCriteria {
    id: string;
    number: string;
    description: string;
    category?: string;
    notes?: string;
    _aiExtracted?: boolean;
    _userEdited?: boolean;
}
export interface ExclusionCriteria {
    id: string;
    number: string;
    description: string;
    category?: string;
    notes?: string;
    _aiExtracted?: boolean;
    _userEdited?: boolean;
}
export interface VisitSchedule {
    id: string;
    visitNumber: string;
    visitName: string;
    windowStart: string;
    windowEnd: string;
    procedures: Procedure[];
    assessments: Assessment[];
    _aiExtracted?: boolean;
    _userEdited?: boolean;
    notes?: string;
}
export interface Procedure {
    id: string;
    name: string;
    category: 'screening' | 'treatment' | 'follow-up';
    timing: string;
    notes?: string;
}
export interface Assessment {
    id: string;
    name: string;
    type: 'vital' | 'lab' | 'ecg' | 'imaging' | 'questionnaire';
    timing: string;
}
export interface MedicationRecord {
    id: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    route: string;
    startDate: Date;
    endDate?: Date;
    indication: string;
    notes?: string;
    _aiRecognized?: boolean;
    _userConfirmed?: boolean;
    _confidence?: 'high' | 'medium' | 'low';
}
//# sourceMappingURL=core.d.ts.map