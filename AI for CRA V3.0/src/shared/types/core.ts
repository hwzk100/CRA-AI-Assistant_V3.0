/**
 * Core type definitions for CRA AI Assistant V3.0
 * Enhanced type safety with Result type for error handling
 */

// ============================================================================
// Result Type - Functional error handling
// ============================================================================

/**
 * Result type for operations that can fail
 * Provides type-safe error handling without exceptions
 */
export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Helper function to create a successful result
 */
export const ok = <T>(data: T): Result<T> => ({
  success: true,
  data,
});

/**
 * Helper function to create a failed result
 */
export const err = <E extends AppError>(error: E): Result<never, E> => ({
  success: false,
  error,
});

/**
 * Check if result is successful (type guard)
 */
export const isSuccess = <T>(result: Result<T>): result is { success: true; data: T } => {
  return result.success;
};

/**
 * Check if result is failed (type guard)
 */
export const isFailure = <T, E>(result: Result<T, E>): result is { success: false; error: E } => {
  return !result.success;
};

/**
 * Helper function to unwrap a result (throws if error)
 * Use sparingly - prefer pattern matching with 'success' property
 */
export const unwrap = <T>(result: Result<T>): T => {
  if (result.success === true) {
    return result.data;
  }
  // TypeScript needs explicit check for error case
  if (result.success === false) {
    throw result.error;
  }
  // Should never reach here, but satisfy TypeScript
  throw new Error('Invalid Result state');
};

// ============================================================================
// Error Types
// ============================================================================

/**
 * Error categories for different types of failures
 */
export enum ErrorCategory {
  /** Business logic failures (e.g., validation, AI extraction) */
  DOMAIN = 'domain',
  /** Infrastructure failures (e.g., file I/O, OCR, PDF parsing) */
  INFRASTRUCTURE = 'infrastructure',
  /** UI/interaction failures */
  UI = 'ui',
  /** Network failures (e.g., API calls) */
  NETWORK = 'network',
}

/**
 * Error severity levels for user feedback
 */
export enum ErrorSeverity {
  /** Blocks the current operation */
  CRITICAL = 'critical',
  /** Allows continuing with a warning */
  WARNING = 'warning',
  /** Informational message */
  INFO = 'info',
}

/**
 * Recovery actions that can be offered to users
 */
export type RecoveryAction =
  | { type: 'retry'; label: string; action: () => void }
  | { type: 'navigate'; label: string; path: string }
  | { type: 'contact'; label: string; contact: string };

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
export const createError = (
  code: string,
  category: ErrorCategory,
  severity: ErrorSeverity,
  userMessage: string,
  technicalMessage: string,
  context?: Record<string, unknown>
): AppError => ({
  code,
  category,
  severity,
  userMessage,
  technicalMessage,
  timestamp: new Date(),
  context,
});

// ============================================================================
// Storage Zones
// ============================================================================

/**
 * Storage zones for different file types
 */
export enum StorageZone {
  /** Clinical trial protocol files */
  PROTOCOL = 'protocol',
  /** Subject medical records */
  SUBJECT = 'subject',
}

// ============================================================================
// File Processing Types
// ============================================================================

/**
 * File processing status with granular states
 */
export enum FileStatus {
  /** File uploaded but not yet processed */
  PENDING = 'pending',
  /** Validating file format and integrity */
  VALIDATING = 'validating',
  /** General processing state */
  PROCESSING = 'processing',
  /** OCR text extraction in progress */
  OCR_PROCESSING = 'ocr_processing',
  /** PDF parsing in progress */
  PDF_PARSING = 'pdf_parsing',
  /** Processing completed successfully */
  COMPLETED = 'completed',
  /** Processing failed */
  FAILED = 'failed',
  /** Processing was cancelled */
  CANCELLED = 'cancelled',
}

/**
 * Supported file types for upload
 */
export enum FileType {
  PDF = 'pdf',
  IMAGE = 'image',
  ARCHIVE = 'archive',
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

// ============================================================================
// API Types
// ============================================================================

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

// ============================================================================
// IPC Types
// ============================================================================

/**
 * IPC channel names for electron communication (as string literals)
 */
export const IPCChannel = {
  FILE_UPLOAD: 'file:upload',
  FILE_DELETE: 'file:delete',
  FILE_PROCESS: 'file:process',
  FILE_GET_ALL: 'file:getAll',
  AI_EXTRACT_CRITERIA: 'ai:extractCriteria',
  AI_EXTRACT_VISIT_SCHEDULE: 'ai:extractVisitSchedule',
  AI_RECOGNIZE_MEDICATIONS: 'ai:recognizeMedications',
  AI_EXTRACT_SUBJECT_NUMBER: 'ai:extractSubjectNumber',
  AI_EXTRACT_SUBJECT_VISITS: 'ai:extractSubjectVisits',
  AI_EXTRACT_SUBJECT_ITEMS: 'ai:extractSubjectItems',
  AI_CHAT: 'ai:chat',
  EXCEL_EXPORT: 'excel:export',
  EXCEL_EXPORT_TRACKER: 'excel:exportTracker',
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  SETTINGS_SET_API_KEY: 'settings:setApiKey',
  SYSTEM_GET_VERSION: 'system:getVersion',
  SYSTEM_OPEN_EXTERNAL: 'system:openExternal',
} as const;

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
  'ai:extractSubjectVisits': Result<Array<{ visitScheduleId: string; actualVisitDate?: string; status: string; notes?: string }>>;
  'ai:extractSubjectItems': Result<Array<{ visitScheduleId: string; itemName: string; itemType: string; actualDate?: string; status: string; notes?: string }>>;
  'ai:chat': Result<string>;
  [IPCChannel.EXCEL_EXPORT_TRACKER]: Result<string>;
  [IPCChannel.SETTINGS_GET]: Result<AppSettings>;
  'excel:exportTracker': Result<string>;
  'settings:set': Result<void>;
  'settings:setApiKey': Result<void>;
  'system:getVersion': Result<string>;
  'system:openExternal': Result<void>;
};

// ============================================================================
// Settings Types
// ============================================================================

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
export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '07b90939b67f4170bc77dc79038bff91.DAZoHzF7duEhH3NM',
  theme: 'light',
  language: 'zh-CN',
  autoSave: true,
  autoSaveInterval: 5,
  showNotifications: true,
  logLevel: 'info',
};

// ============================================================================
// Import worksheet types (forward declarations)
// ============================================================================

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
