/**
 * Excel Export Service - Generate Tracker Excel with three worksheets
 * Uses ExcelJS for professional Excel generation with styling
 */
import { InclusionCriteria, ExclusionCriteria, VisitSchedule, MedicationRecord } from '@shared/types/core';
import { SubjectVisitData, SubjectVisitItemData } from '@shared/types/worksheet';
import { Result } from '@shared/types/core';
export interface ExcelExportOptions {
    /** Output file path */
    outputPath: string;
    /** Include summary sheet */
    includeSummary?: boolean;
    /** Apply professional styling */
    applyStyling?: boolean;
    /** Workbook title */
    title?: string;
}
export interface TrackerData {
    /** Inclusion criteria */
    inclusionCriteria: InclusionCriteria[];
    /** Exclusion criteria */
    exclusionCriteria: ExclusionCriteria[];
    /** Visit schedule */
    visitSchedule: VisitSchedule[];
    /** Subject visit data for time verification */
    subjectVisits: SubjectVisitData[];
    /** Subject visit item data for item time verification */
    subjectVisitItems: SubjectVisitItemData[];
    /** Medication records */
    medications: MedicationRecord[];
}
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
export declare class ExcelGenerator {
    private workbook;
    private options;
    constructor(options: ExcelExportOptions);
    /**
     * Generate complete tracker Excel file
     */
    generate(data: TrackerData): Promise<Result<ExcelExportResult>>;
    /**
     * Create Worksheet 1: Inclusion/Exclusion Criteria
     */
    private createCriteriaSheet;
    /**
     * Create Worksheet 2: Visit Time Checklist
     * 访视时间核对表
     */
    private createVisitTimeChecklistSheet;
    /**
     * Create Worksheet 3: Visit Item Time Checklist
     * 访视项目时间核对表
     */
    private createVisitItemTimeChecklistSheet;
    /**
     * Create Worksheet 3: Medication Records
     */
    private createMedicationSheet;
    /**
     * Create Summary Sheet
     */
    private createSummarySheet;
    /**
     * Style header row
     */
    private styleHeader;
    /**
     * Style criteria row
     */
    private styleCriteriaRow;
    /**
     * Style pending confirmation row (yellow background)
     */
    private stylePendingRow;
    /**
     * Style confirmed row (green background)
     */
    private styleConfirmedRow;
    /**
     * Format date for Excel
     * Handles both Date objects and ISO date strings
     */
    private formatDate;
}
/**
 * Generate tracker Excel file
 */
export declare const generateTrackerExcel: (data: TrackerData, options: ExcelExportOptions) => Promise<Result<ExcelExportResult>>;
/**
 * Generate default output path with timestamp
 */
export declare const generateOutputPath: (customPath?: string) => string;
//# sourceMappingURL=ExcelGenerator.d.ts.map