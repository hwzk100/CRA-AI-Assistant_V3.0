/**
 * Worksheet-specific type definitions for CRA AI Assistant V3.0
 * Contains types for the three Excel worksheets
 */
/**
 * Inclusion criteria item
 */
export interface InclusionCriteria {
    /** Unique identifier */
    id: string;
    /** Criteria number (e.g., "1", "2", "3") */
    number: string;
    /** Full criteria description */
    description: string;
    /** Optional category for grouping */
    category?: string;
    /** User notes or comments */
    notes?: string;
    /** Whether criteria was extracted by AI */
    _aiExtracted?: boolean;
    /** Whether criteria was user edited */
    _userEdited?: boolean;
}
/**
 * Exclusion criteria item
 */
export interface ExclusionCriteria {
    /** Unique identifier */
    id: string;
    /** Criteria number (e.g., "1", "2", "3") */
    number: string;
    /** Full criteria description */
    description: string;
    /** Optional category for grouping */
    category?: string;
    /** User notes or comments */
    notes?: string;
    /** Whether criteria was extracted by AI */
    _aiExtracted?: boolean;
    /** Whether criteria was user edited */
    _userEdited?: boolean;
}
/**
 * Complete criteria set (for Worksheet 1)
 */
export interface CriteriaSet {
    /** All inclusion criteria */
    inclusionCriteria: InclusionCriteria[];
    /** All exclusion criteria */
    exclusionCriteria: ExclusionCriteria[];
}
/**
 * Criteria extraction options
 */
export interface CriteriaExtractionOptions {
    /** Whether to extract categories */
    extractCategories?: boolean;
    /** Whether to number criteria automatically */
    autoNumber?: boolean;
    /** Custom extraction prompt override */
    customPrompt?: string;
}
/**
 * Procedure details for a visit
 */
export interface Procedure {
    /** Unique identifier */
    id: string;
    /** Procedure name */
    name: string;
    /** Procedure category */
    category: 'screening' | 'treatment' | 'follow-up' | 'other';
    /** Timing within the visit */
    timing: string;
    /** Additional notes */
    notes?: string;
    /** Whether procedure is required */
    required?: boolean;
}
/**
 * Assessment details for a visit
 */
export interface Assessment {
    /** Unique identifier */
    id: string;
    /** Assessment name */
    name: string;
    /** Assessment type */
    type: 'vital' | 'lab' | 'ecg' | 'imaging' | 'questionnaire' | 'other';
    /** Timing within the visit */
    timing: string;
    /** Additional notes */
    notes?: string;
    /** Whether assessment is required */
    required?: boolean;
}
/**
 * Visit schedule item (for Worksheet 2)
 */
export interface VisitSchedule {
    /** Unique identifier */
    id: string;
    /** Visit number (e.g., "1", "2", "-1", "1+1") */
    visitNumber: string;
    /** Visit name (e.g., "筛选期访视", "第1次治疗访视") */
    visitName: string;
    /** Window start (e.g., "Day -28", "Week 1", "Cycle 1 Day 1") */
    windowStart: string;
    /** Window end (e.g., "Day -1", "Week 2", "Cycle 1 Day 8") */
    windowEnd: string;
    /** Procedures for this visit */
    procedures: Procedure[];
    /** Assessments for this visit */
    assessments: Assessment[];
    /** Whether this visit was extracted by AI */
    _aiExtracted?: boolean;
    /** Whether this visit was edited by user */
    _userEdited?: boolean;
    /** Optional visit notes */
    notes?: string;
}
/**
 * Visit schedule extraction options
 */
export interface VisitScheduleExtractionOptions {
    /** Whether to extract detailed procedures */
    extractProcedures?: boolean;
    /** Whether to extract detailed assessments */
    extractAssessments?: boolean;
    /** Custom extraction prompt override */
    customPrompt?: string;
}
/**
 * Medication record item (for Worksheet 3)
 */
export interface MedicationRecord {
    /** Unique identifier */
    id: string;
    /** Medication name (generic or brand) */
    medicationName: string;
    /** Dosage (e.g., "100mg", "5mg twice daily") */
    dosage: string;
    /** Frequency (e.g., "每日一次", "BID", "PRN") */
    frequency: string;
    /** Route of administration (e.g., "口服", "静脉注射", "外用") */
    route: string;
    /** Start date */
    startDate: Date;
    /** End date (null if ongoing) */
    endDate?: Date;
    /** Indication/reason for medication */
    indication: string;
    /** Whether this was recognized by AI */
    _aiRecognized?: boolean;
    /** Whether this was confirmed by user */
    _userConfirmed?: boolean;
    /** Confidence level of AI recognition */
    _confidence?: 'high' | 'medium' | 'low';
    /** Additional notes */
    notes?: string;
}
/**
 * Medication recognition options
 */
export interface MedicationRecognitionOptions {
    /** Whether to extract dosage information */
    extractDosage?: boolean;
    /** Whether to extract frequency information */
    extractFrequency?: boolean;
    /** Custom recognition prompt override */
    customPrompt?: string;
}
/**
 * Excel export options
 */
export interface ExcelExportOptions {
    /** Output file path */
    outputPath: string;
    /** Whether to include summary sheet */
    includeSummary?: boolean;
    /** Whether to style the output */
    applyStyling?: boolean;
    /** Custom title for the workbook */
    title?: string;
}
/**
 * Excel export result
 */
export interface ExcelExportResult {
    /** Full path to exported file */
    filePath: string;
    /** File size in bytes */
    fileSize: number;
    /** Number of worksheets */
    worksheetCount: number;
    /** Export timestamp */
    exportedAt: Date;
}
/**
 * Validation result for worksheet data
 */
export interface ValidationResult {
    /** Whether validation passed */
    valid: boolean;
    /** Validation errors */
    errors: ValidationError[];
    /** Validation warnings */
    warnings: ValidationWarning[];
}
/**
 * Validation error
 */
export interface ValidationError {
    /** Field that has error */
    field: string;
    /** Error message */
    message: string;
    /** Related item ID */
    itemId?: string;
}
/**
 * Validation warning
 */
export interface ValidationWarning {
    /** Field that has warning */
    field: string;
    /** Warning message */
    message: string;
    /** Related item ID */
    itemId?: string;
}
/**
 * Edit state for a worksheet item
 */
export interface EditState<T> {
    /** Original data before editing */
    original: T;
    /** Current edited data */
    edited: T;
    /** Whether changes have been saved */
    hasUnsavedChanges: boolean;
    /** Fields that have been modified */
    modifiedFields: (keyof T)[];
}
/**
 * Create a new edit state
 */
export declare const createEditState: <T>(data: T) => EditState<T>;
/**
 * Update edited data and track changes
 */
export declare const updateEditState: <T>(state: EditState<T>, updates: Partial<T>) => EditState<T>;
/**
 * ID generator for worksheet items
 */
export declare const generateId: () => string;
/**
 * Create a copy of an item with a new ID
 */
export declare const cloneItem: <T extends {
    id: string;
}>(item: T) => T;
/**
 * Subject visit data for visit time verification
 * 用于核对受试者各访视的实际访视时间
 */
export interface SubjectVisitData {
    /** Unique identifier */
    id: string;
    /** Subject number (e.g., "001", "002") */
    subjectNumber: string;
    /** Reference to visit schedule ID */
    visitScheduleId: string;
    /** Actual visit date in YYYY-MM-DD format */
    actualVisitDate?: string;
    /** Visit status */
    status: 'completed' | 'pending' | 'missed' | 'not_applicable';
    /** Additional notes */
    notes?: string;
    /** Whether this was extracted by AI */
    _aiExtracted?: boolean;
    /** Whether this was confirmed by user */
    _userConfirmed?: boolean;
}
/**
 * Subject visit item data for visit item time verification
 * 用于核对受试者各访视项目的实际完成时间
 */
export interface SubjectVisitItemData {
    /** Unique identifier */
    id: string;
    /** Subject number (e.g., "001", "002") */
    subjectNumber: string;
    /** Reference to visit schedule ID */
    visitScheduleId: string;
    /** Procedure or assessment name */
    itemName: string;
    /** Item type */
    itemType: 'procedure' | 'assessment';
    /** Actual completion date in YYYY-MM-DD format */
    actualDate?: string;
    /** Completion status */
    status: 'completed' | 'pending' | 'not_done' | 'not_applicable';
    /** Additional notes */
    notes?: string;
    /** Whether this was extracted by AI */
    _aiExtracted?: boolean;
    /** Whether this was confirmed by user */
    _userConfirmed?: boolean;
}
//# sourceMappingURL=worksheet.d.ts.map