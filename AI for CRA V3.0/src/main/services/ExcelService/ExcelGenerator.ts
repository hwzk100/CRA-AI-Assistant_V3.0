/**
 * Excel Export Service - Generate Tracker Excel with three worksheets
 * Uses ExcelJS for professional Excel generation with styling
 */

import ExcelJS from 'exceljs';
import {
  InclusionCriteria,
  ExclusionCriteria,
  VisitSchedule,
  MedicationRecord,
} from '@shared/types/core';
import { SubjectVisitData, SubjectVisitItemData } from '@shared/types/worksheet';
import { EXCEL_CONSTANTS } from '@shared/constants/app';
import { ok, err, createError, ErrorCategory, ErrorSeverity, Result } from '@shared/types/core';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// Excel Generator
// ============================================================================

export class ExcelGenerator {
  private workbook: ExcelJS.Workbook;
  private options: Required<ExcelExportOptions>;

  constructor(options: ExcelExportOptions) {
    this.workbook = new ExcelJS.Workbook();
    this.options = {
      outputPath: options.outputPath,
      includeSummary: options.includeSummary ?? true,
      applyStyling: options.applyStyling ?? true,
      title: options.title ?? 'CRA监查Tracker表',
    };

    // Set workbook properties
    this.workbook.creator = 'CRA AI Assistant V3.0';
    this.workbook.created = new Date();
    this.workbook.modified = new Date();
    // Note: title is not directly supported by ExcelJS WorkbookProperties
  }

  /**
   * Generate complete tracker Excel file
   */
  async generate(data: TrackerData): Promise<Result<ExcelExportResult>> {
    try {
      console.log('[ExcelGenerator] Starting Excel generation...');
      console.log('[ExcelGenerator] Output path:', this.options.outputPath);

      // Create worksheets
      console.log('[ExcelGenerator] Creating criteria sheet...');
      await this.createCriteriaSheet(data.inclusionCriteria, data.exclusionCriteria);

      console.log('[ExcelGenerator] Creating visit time checklist sheet...');
      await this.createVisitTimeChecklistSheet(data.visitSchedule, data.subjectVisits);

      console.log('[ExcelGenerator] Creating visit item time checklist sheet...');
      await this.createVisitItemTimeChecklistSheet(data.visitSchedule, data.subjectVisitItems);

      console.log('[ExcelGenerator] Creating medication sheet...');
      await this.createMedicationSheet(data.medications);

      if (this.options.includeSummary) {
        console.log('[ExcelGenerator] Creating summary sheet...');
        await this.createSummarySheet(data);
      }

      // Ensure directory exists
      const dir = path.dirname(this.options.outputPath);
      console.log('[ExcelGenerator] Ensuring directory exists:', dir);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write to file
      console.log('[ExcelGenerator] Writing workbook to buffer...');
      const buffer = await this.workbook.xlsx.writeBuffer();
      console.log('[ExcelGenerator] Buffer size:', (buffer as any).length, 'bytes');

      console.log('[ExcelGenerator] Writing file to disk...');
      fs.writeFileSync(this.options.outputPath, Buffer.from(buffer));

      // Verify file was written
      if (!fs.existsSync(this.options.outputPath)) {
        throw new Error('File was not created');
      }

      // Get file stats
      const stats = fs.statSync(this.options.outputPath);
      console.log('[ExcelGenerator] File created successfully:', stats.size, 'bytes');

      return ok({
        filePath: this.options.outputPath,
        fileSize: stats.size,
        worksheetCount: this.workbook.worksheets.length,
        exportedAt: new Date(),
      });
    } catch (error) {
      console.error('[ExcelGenerator] Error:', error);
      return err(
        createError(
          'EXCEL_EXPORT_FAILED',
          ErrorCategory.INFRASTRUCTURE,
          ErrorSeverity.CRITICAL,
          'Excel导出失败：' + (error instanceof Error ? error.message : '未知错误'),
          error instanceof Error ? error.message : 'Unknown error',
          { outputPath: this.options.outputPath }
        )
      );
    }
  }

  /**
   * Create Worksheet 1: Inclusion/Exclusion Criteria
   */
  private async createCriteriaSheet(
    inclusion: InclusionCriteria[],
    exclusion: ExclusionCriteria[]
  ): Promise<void> {
    const sheet = this.workbook.addWorksheet(EXCEL_CONSTANTS.WORKSHEET_NAMES.CRITERIA);

    // Define columns
    sheet.columns = [
      { header: '类型', key: 'type', width: EXCEL_CONSTANTS.COLUMN_WIDTHS.NARROW },
      { header: '编号', key: 'number', width: EXCEL_CONSTANTS.COLUMN_WIDTHS.NARROW },
      { header: '标准描述', key: 'description', width: EXCEL_CONSTANTS.COLUMN_WIDTHS.EXTRA_WIDE },
      { header: '分类', key: 'category', width: EXCEL_CONSTANTS.COLUMN_WIDTHS.MEDIUM },
      { header: '备注', key: 'notes', width: EXCEL_CONSTANTS.COLUMN_WIDTHS.WIDE },
    ];

    if (this.options.applyStyling) {
      this.styleHeader(sheet);
    }

    // Add inclusion criteria
    inclusion.forEach((criteria, index) => {
      const row = sheet.addRow({
        type: '入组标准',
        number: criteria.number,
        description: criteria.description,
        category: criteria.category || '',
        notes: criteria.notes || '',
      });

      if (this.options.applyStyling) {
        this.styleCriteriaRow(row, index + 2, 'inclusion');
      }
    });

    // Add exclusion criteria
    const startRow = inclusion.length + 2;
    exclusion.forEach((criteria, index) => {
      const row = sheet.addRow({
        type: '排除标准',
        number: criteria.number,
        description: criteria.description,
        category: criteria.category || '',
        notes: criteria.notes || '',
      });

      if (this.options.applyStyling) {
        this.styleCriteriaRow(row, startRow + index, 'exclusion');
      }
    });

    // Add filters
    sheet.autoFilter = {
      from: 'A1',
      to: `E${inclusion.length + exclusion.length + 1}`,
    };
  }

  /**
   * Create Worksheet 2: Visit Time Checklist
   * 访视时间核对表
   */
  private async createVisitTimeChecklistSheet(
    visitSchedule: VisitSchedule[],
    subjectVisits: SubjectVisitData[]
  ): Promise<void> {
    const sheet = this.workbook.addWorksheet(EXCEL_CONSTANTS.WORKSHEET_NAMES.VISIT_TIME_CHECKLIST);

    // Group visits by subject number
    const visitsBySubject = new Map<string, SubjectVisitData[]>();
    subjectVisits.forEach((visit) => {
      if (!visitsBySubject.has(visit.subjectNumber)) {
        visitsBySubject.set(visit.subjectNumber, []);
      }
      visitsBySubject.get(visit.subjectNumber)!.push(visit);
    });

    // Get unique subject numbers sorted
    const subjectNumbers = Array.from(visitsBySubject.keys()).sort();

    // Build columns: first column is "受试者编号", then each visit is a column
    const columns: Array<{ header: string; key: string; width: number }> = [
      { header: '受试者编号', key: 'subjectNumber', width: EXCEL_CONSTANTS.COLUMN_WIDTHS.NARROW },
    ];

    visitSchedule.forEach((visit) => {
      columns.push({
        header: `${visit.visitNumber}-${visit.visitName}\n${visit.windowStart}~${visit.windowEnd}`,
        key: `visit_${visit.id}`,
        width: EXCEL_CONSTANTS.COLUMN_WIDTHS.MEDIUM,
      });
    });

    sheet.columns = columns;

    if (this.options.applyStyling) {
      this.styleHeader(sheet);
    }

    // Add rows for each subject
    subjectNumbers.forEach((subjectNumber) => {
      const rowData: Record<string, string> = { subjectNumber };

      const subjectVisitList = visitsBySubject.get(subjectNumber) || [];
      subjectVisitList.forEach((visit) => {
        const key = `visit_${visit.visitScheduleId}`;
        if (visit.actualVisitDate) {
          rowData[key] = visit.actualVisitDate;
        } else if (visit.status === 'not_applicable') {
          rowData[key] = 'N/A';
        } else if (visit.status === 'missed') {
          rowData[key] = '错过';
        } else if (visit.status === 'pending') {
          rowData[key] = '待进行';
        } else {
          rowData[key] = '';
        }
      });

      sheet.addRow(rowData);
    });
  }

  /**
   * Create Worksheet 3: Visit Item Time Checklist
   * 访视项目时间核对表
   */
  private async createVisitItemTimeChecklistSheet(
    visitSchedule: VisitSchedule[],
    subjectVisitItems: SubjectVisitItemData[]
  ): Promise<void> {
    const sheet = this.workbook.addWorksheet(EXCEL_CONSTANTS.WORKSHEET_NAMES.VISIT_ITEM_TIME_CHECKLIST);

    // Group items by subject number
    const itemsBySubject = new Map<string, SubjectVisitItemData[]>();
    subjectVisitItems.forEach((item) => {
      if (!itemsBySubject.has(item.subjectNumber)) {
        itemsBySubject.set(item.subjectNumber, []);
      }
      itemsBySubject.get(item.subjectNumber)!.push(item);
    });

    // Get unique subject numbers sorted
    const subjectNumbers = Array.from(itemsBySubject.keys()).sort();

    // Collect all unique items across all visits
    const allItems: Array<{
      visitScheduleId: string;
      itemName: string;
      itemType: string;
      header: string;
    }> = [];

    visitSchedule.forEach((visit) => {
      visit.procedures.forEach((proc) => {
        allItems.push({
          visitScheduleId: visit.id,
          itemName: proc.name,
          itemType: 'procedure',
          header: `${visit.visitNumber}-${proc.name}`,
        });
      });
      visit.assessments.forEach((assess) => {
        allItems.push({
          visitScheduleId: visit.id,
          itemName: assess.name,
          itemType: 'assessment',
          header: `${visit.visitNumber}-${assess.name}`,
        });
      });
    });

    // Build columns: first column is "受试者编号", then each item is a column
    const columns: Array<{ header: string; key: string; width: number }> = [
      { header: '受试者编号', key: 'subjectNumber', width: EXCEL_CONSTANTS.COLUMN_WIDTHS.NARROW },
    ];

    allItems.forEach((item) => {
      columns.push({
        header: item.header,
        key: `item_${item.visitScheduleId}_${item.itemName}`,
        width: EXCEL_CONSTANTS.COLUMN_WIDTHS.MEDIUM,
      });
    });

    sheet.columns = columns;

    if (this.options.applyStyling) {
      this.styleHeader(sheet);
    }

    // Add rows for each subject
    subjectNumbers.forEach((subjectNumber) => {
      const rowData: Record<string, string> = { subjectNumber };

      const subjectItemList = itemsBySubject.get(subjectNumber) || [];
      subjectItemList.forEach((item) => {
        const key = `item_${item.visitScheduleId}_${item.itemName}`;
        if (item.actualDate) {
          rowData[key] = item.actualDate;
        } else if (item.status === 'not_applicable') {
          rowData[key] = 'N/A';
        } else if (item.status === 'not_done') {
          rowData[key] = '未进行';
        } else if (item.status === 'pending') {
          rowData[key] = '待进行';
        } else {
          rowData[key] = '';
        }
      });

      sheet.addRow(rowData);
    });
  }

  /**
   * Create Worksheet 3: Medication Records
   */
  private async createMedicationSheet(medications: MedicationRecord[]): Promise<void> {
    const sheet = this.workbook.addWorksheet(EXCEL_CONSTANTS.WORKSHEET_NAMES.MEDICATION);

    // Define columns
    sheet.columns = [
      { header: '药物名称', key: 'medicationName', width: EXCEL_CONSTANTS.COLUMN_WIDTHS.WIDE },
      { header: '剂量', key: 'dosage', width: EXCEL_CONSTANTS.COLUMN_WIDTHS.NARROW },
      { header: '频次', key: 'frequency', width: EXCEL_CONSTANTS.COLUMN_WIDTHS.NARROW },
      { header: '给药途径', key: 'route', width: EXCEL_CONSTANTS.COLUMN_WIDTHS.NARROW },
      { header: '开始日期', key: 'startDate', width: EXCEL_CONSTANTS.COLUMN_WIDTHS.NARROW },
      { header: '结束日期', key: 'endDate', width: EXCEL_CONSTANTS.COLUMN_WIDTHS.NARROW },
      { header: '适应症', key: 'indication', width: EXCEL_CONSTANTS.COLUMN_WIDTHS.WIDE },
      { header: '备注', key: 'notes', width: EXCEL_CONSTANTS.COLUMN_WIDTHS.MEDIUM },
      { header: 'AI识别', key: 'aiRecognized', width: EXCEL_CONSTANTS.COLUMN_WIDTHS.NARROW },
      { header: '用户确认', key: 'userConfirmed', width: EXCEL_CONSTANTS.COLUMN_WIDTHS.NARROW },
    ];

    if (this.options.applyStyling) {
      this.styleHeader(sheet);
    }

    medications.forEach((med, index) => {
      const row = sheet.addRow({
        medicationName: med.medicationName,
        dosage: med.dosage,
        frequency: med.frequency,
        route: med.route,
        startDate: this.formatDate(med.startDate),
        endDate: med.endDate ? this.formatDate(med.endDate) : '',
        indication: med.indication,
        notes: med.notes || '',
        aiRecognized: med._aiRecognized ? '是' : '否',
        userConfirmed: med._userConfirmed ? '是' : '否',
      });

      if (this.options.applyStyling) {
        // Highlight pending confirmation (AI recognized but not confirmed)
        if (med._aiRecognized && !med._userConfirmed) {
          this.stylePendingRow(row);
        } else if (med._userConfirmed) {
          this.styleConfirmedRow(row);
        }
      }
    });
  }

  /**
   * Create Summary Sheet
   */
  private async createSummarySheet(data: TrackerData): Promise<void> {
    const sheet = this.workbook.addWorksheet(EXCEL_CONSTANTS.WORKSHEET_NAMES.SUMMARY);

    // Title
    sheet.mergeCells('A1:B1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = this.options.title;
    titleCell.font = { size: 18, bold: true, color: { argb: 'FF000000' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 30;

    // Generation info
    sheet.addRow(['生成时间', new Date().toLocaleString('zh-CN')]);
    sheet.addRow(['生成工具', 'CRA AI Assistant V3.0']);

    // Empty row
    sheet.addRow([]);

    // Statistics section title
    sheet.mergeCells('A5:B5');
    const statsTitle = sheet.getCell('A5');
    statsTitle.value = '数据统计';
    statsTitle.font = { size: 14, bold: true };

    // Statistics
    sheet.addRow(['入组标准数量', data.inclusionCriteria.length]);
    sheet.addRow(['排除标准数量', data.exclusionCriteria.length]);
    sheet.addRow(['访视数量', data.visitSchedule.length]);
    sheet.addRow(['用药记录数量', data.medications.length]);

    // Style statistics section
    const statsStartRow = 6;
    const statsEndRow = statsStartRow + 3;
    for (let i = statsStartRow; i <= statsEndRow; i++) {
      sheet.getRow(i).getCell(1).font = { bold: true };
      sheet.getRow(i).getCell(2).alignment = { horizontal: 'center' };
    }

    // Column widths
    sheet.getColumn('A').width = 25;
    sheet.getColumn('B').width = 30;
  }

  // ==========================================================================
  // Styling Methods
  // ==========================================================================

  /**
   * Style header row
   */
  private styleHeader(sheet: ExcelJS.Worksheet): void {
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, size: 12, color: { argb: EXCEL_CONSTANTS.COLORS.HEADER_TEXT } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: EXCEL_CONSTANTS.COLORS.HEADER_BG },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    headerRow.height = EXCEL_CONSTANTS.ROW_HEIGHTS.HEADER;
    headerRow.border = {
      bottom: { style: 'thin' },
    };
  }

  /**
   * Style criteria row
   */
  private styleCriteriaRow(row: ExcelJS.Row, rowNumber: number, type: 'inclusion' | 'exclusion'): void {
    row.font = { size: 11 };
    row.alignment = { vertical: 'top', wrapText: true };
    row.height = EXCEL_CONSTANTS.ROW_HEIGHTS.TALL;

    // Alternating row colors
    if (rowNumber % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: type === 'inclusion' ? EXCEL_CONSTANTS.COLORS.INCLUSION_BG : EXCEL_CONSTANTS.COLORS.EXCLUSION_BG },
      };
    }
  }

  /**
   * Style pending confirmation row (yellow background)
   */
  private stylePendingRow(row: ExcelJS.Row): void {
    row.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: EXCEL_CONSTANTS.COLORS.PENDING_BG },
    };
    row.font = { size: 11 };
  }

  /**
   * Style confirmed row (green background)
   */
  private styleConfirmedRow(row: ExcelJS.Row): void {
    row.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: EXCEL_CONSTANTS.COLORS.CONFIRMED_BG },
    };
    row.font = { size: 11 };
  }

  /**
   * Format date for Excel
   * Handles both Date objects and ISO date strings
   */
  private formatDate(date: Date | string): string {
    if (!date) return '';

    // If it's already a string, just return the date part
    if (typeof date === 'string') {
      // Handle ISO format strings (YYYY-MM-DDTHH:mm:ss.sssZ)
      if (date.includes('T')) {
        return date.split('T')[0];
      }
      // Already in YYYY-MM-DD format or similar
      return date;
    }

    // If it's a Date object, convert to string
    try {
      return date.toISOString().split('T')[0];
    } catch (e) {
      console.error('[formatDate] Invalid date:', date);
      return '';
    }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate tracker Excel file
 */
export const generateTrackerExcel = async (
  data: TrackerData,
  options: ExcelExportOptions
): Promise<Result<ExcelExportResult>> => {
  const generator = new ExcelGenerator(options);
  return await generator.generate(data);
};

/**
 * Generate default output path with timestamp
 */
export const generateOutputPath = (customPath?: string): string => {
  if (customPath) {
    return customPath;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const fileName = `CRA_Tracker_${timestamp}.xlsx`;
  const os = require('os');

  // Use home directory directly (most reliable)
  const homeDir = os.homedir();
  return path.join(homeDir, fileName);
};
