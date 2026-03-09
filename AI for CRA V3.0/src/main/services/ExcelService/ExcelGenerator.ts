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
// Subject Info Types for Visit Time Checklist
// ============================================================================

/**
 * Subject information for the visit time checklist
 * 对应受试者信息列（A-G列）
 */
export interface SubjectInfo {
  /** 中心编号 */
  centerNumber: string;
  /** 筛选号 */
  screeningNumber: string;
  /** 姓名缩写 */
  initials: string;
  /** 签知情日期 */
  informedConsentDate?: string;
  /** 入组日期 */
  enrollmentDate?: string;
  /** 组别 */
  group?: string;
  /** 患者当前状态 */
  currentStatus?: string;
}

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

    // Sort visits: screening/baseline first, then by protocol order
    const sortedVisits = this.sortVisitsForChecklist(visitSchedule);

    // Group visits by subject number
    const visitsBySubject = new Map<string, Map<string, SubjectVisitData>>();
    subjectVisits.forEach((visit) => {
      if (!visitsBySubject.has(visit.subjectNumber)) {
        visitsBySubject.set(visit.subjectNumber, new Map());
      }
      visitsBySubject.get(visit.subjectNumber)!.set(visit.visitScheduleId, visit);
    });

    // Get unique subject numbers sorted
    const subjectNumbers = Array.from(visitsBySubject.keys()).sort();

    // Column headers for subject info (A-G columns)
    const subjectInfoHeaders = [
      '中心编号',
      '筛选号',
      '姓名缩写',
      '签知情日期',
      '入组日期',
      '组别',
      '患者当前状态',
    ];

    // Build all column headers (Row 1)
    const row1Headers: string[] = [
      ...subjectInfoHeaders,
      ...sortedVisits.map(v => this.generateVisitColumnLabel(v))
    ];

    // Build time window headers (Row 2)
    const row2Headers: string[] = [
      '', '', '', '', '', '', '',  // Empty for subject info columns
      ...sortedVisits.map(v => this.formatTimeWindow(v.windowStart, v.windowEnd))
    ];

    // Add Row 1: Main headers
    const headerRow1 = sheet.addRow(row1Headers);
    // Add Row 2: Time windows
    const headerRow2 = sheet.addRow(row2Headers);

    // Style both header rows
    if (this.options.applyStyling) {
      this.styleDoubleHeaderRow(sheet, headerRow1, headerRow2);
    }

    // Set column widths
    sheet.getColumn(1).width = EXCEL_CONSTANTS.COLUMN_WIDTHS.NARROW;  // 中心编号
    sheet.getColumn(2).width = EXCEL_CONSTANTS.COLUMN_WIDTHS.NARROW;  // 筛选号
    sheet.getColumn(3).width = EXCEL_CONSTANTS.COLUMN_WIDTHS.NARROW;  // 姓名缩写
    sheet.getColumn(4).width = EXCEL_CONSTANTS.COLUMN_WIDTHS.NARROW;  // 签知情日期
    sheet.getColumn(5).width = EXCEL_CONSTANTS.COLUMN_WIDTHS.NARROW;  // 入组日期
    sheet.getColumn(6).width = EXCEL_CONSTANTS.COLUMN_WIDTHS.MEDIUM;  // 组别
    sheet.getColumn(7).width = EXCEL_CONSTANTS.COLUMN_WIDTHS.MEDIUM;  // 患者当前状态
    for (let i = 0; i < sortedVisits.length; i++) {
      sheet.getColumn(8 + i).width = EXCEL_CONSTANTS.COLUMN_WIDTHS.MEDIUM;
    }

    // Add data rows for each subject
    subjectNumbers.forEach((subjectNumber) => {
      const subjectVisitMap = visitsBySubject.get(subjectNumber) || new Map();

      // Build row data: 7 columns of subject info + visit dates
      const rowData: string[] = [];

      // Add subject info columns (will be populated with actual data if available)
      // For now, use subjectNumber as the key identifier
      rowData.push(
        '',                    // 中心编号 - to be filled
        subjectNumber,         // 筛选号 - use subjectNumber as default
        '',                    // 姓名缩写 - to be filled
        '',                    // 签知情日期 - to be filled
        '',                    // 入组日期 - to be filled
        '',                    // 组别 - to be filled
        ''                     // 患者当前状态 - to be filled
      );

      // Add visit date ranges for each visit
      sortedVisits.forEach((visit) => {
        const visitData = subjectVisitMap.get(visit.id);
        if (visitData?.actualVisitDate) {
          rowData.push(visitData.actualVisitDate);
        } else if (visitData?.status === 'not_applicable') {
          rowData.push('N/A');
        } else if (visitData?.status === 'missed') {
          rowData.push('错过');
        } else if (visitData?.status === 'pending') {
          rowData.push('待进行');
        } else {
          rowData.push('');
        }
      });

      sheet.addRow(rowData);
    });
  }

  // ==========================================================================
  // Helper Methods for Visit Time Checklist
  // ==========================================================================

  /**
   * Sort visits for checklist: screening/baseline visits first, then by protocol order
   */
  private sortVisitsForChecklist(visits: VisitSchedule[]): VisitSchedule[] {
    // Define visit priority: screening/baseline should come first
    const screeningKeywords = ['筛选', 'screening', '基线', 'baseline'];

    const withPriority = visits.map(v => {
      const lowerName = v.visitName.toLowerCase();
      const isScreeningOrBaseline = screeningKeywords.some(kw =>
        lowerName.includes(kw.toLowerCase())
      );
      return {
        visit: v,
        priority: isScreeningOrBaseline ? 0 : 1,
        order: visits.indexOf(v)
      };
    });

    // Sort by priority first, then by original order
    withPriority.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.order - b.order;
    });

    return withPriority.map(item => item.visit);
  }

  /**
   * Generate visit column label from visit name
   * Extracts standard format like "C1D2" from "Cycle 1 Day 2"
   */
  private generateVisitColumnLabel(visit: VisitSchedule): string {
    const name = visit.visitName.toLowerCase();

    // Try to extract cycle and day information
    // Patterns: "Cycle X Day Y", "C1D2", "第X周期第Y天", etc.

    // Pattern 1: "Cycle 1 Day 2" format
    const cycleDayMatch = name.match(/cycle\s*(\d+)\s*day\s*(\d+)/i);
    if (cycleDayMatch) {
      return `C${cycleDayMatch[1]}D${cycleDayMatch[2]}`;
    }

    // Pattern 2: "C1D2" format already
    const compactMatch = name.match(/c(\d+)d(\d+)/i);
    if (compactMatch) {
      return `C${compactMatch[1]}D${compactMatch[2]}`.toUpperCase();
    }

    // Pattern 3: Chinese format "第X周期第Y天"
    const chineseMatch = name.match(/第(\d+)周期.*?第(\d+)天/);
    if (chineseMatch) {
      return `C${chineseMatch[1]}D${chineseMatch[2]}`;
    }

    // Pattern 4: Day-only format like "Day 1", "Day -1"
    const dayMatch = name.match(/day\s*(-?\d+)/i);
    if (dayMatch) {
      return `D${dayMatch[1]}`;
    }

    // Pattern 5: Week format like "Week 1"
    const weekMatch = name.match(/week\s*(\d+)/i);
    if (weekMatch) {
      return `W${weekMatch[1]}`;
    }

    // Default: use visit number + name
    return visit.visitNumber ? `${visit.visitNumber}-${visit.visitName}` : visit.visitName;
  }

  /**
   * Format time window as "Day X ± Y天" format
   * Examples:
   *   "Day -28 ~ Day -1" => "Day -14.5 ± 13.5天"
   *   "Day 2" => "Day 2 ± 0天"
   *   "Day 2 ~ Day 4" => "Day 3 ± 1天"
   */
  private formatTimeWindow(windowStart: string, windowEnd: string): string {
    // Extract day numbers from window strings
    const extractDay = (s: string): number | null => {
      const match = s.match(/day\s*(-?\d+(?:\.\d+)?)/i);
      return match ? parseFloat(match[1]) : null;
    };

    const startDay = extractDay(windowStart);
    const endDay = extractDay(windowEnd);

    if (startDay !== null && endDay !== null) {
      const center = (startDay + endDay) / 2;
      const tolerance = Math.abs(endDay - startDay) / 2;

      // Format as "Day X ± Y天"
      const centerStr = center % 1 === 0 ? center.toString() : center.toFixed(1);
      const toleranceStr = tolerance % 1 === 0 ? tolerance.toString() : tolerance.toFixed(1);

      return `Day ${centerStr} ± ${toleranceStr}天`;
    }

    // Fallback: return original format
    return `${windowStart} ~ ${windowEnd}`;
  }

  /**
   * Format date range as "YYYY-MM-DD ~ YYYY-MM-DD" format
   */
  private formatDateRange(startDate?: string, endDate?: string, fallbackDate?: string): string {
    if (startDate && endDate) {
      return `${startDate} ~ ${endDate}`;
    }
    if (fallbackDate) {
      return fallbackDate;
    }
    return '';
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
   * Style double header row (for visit time checklist)
   * Row 1: Main headers, Row 2: Time windows
   */
  private styleDoubleHeaderRow(
    sheet: ExcelJS.Worksheet,
    headerRow1: ExcelJS.Row,
    headerRow2: ExcelJS.Row
  ): void {
    // Style Row 1 (main headers)
    headerRow1.font = { bold: true, size: 12, color: { argb: EXCEL_CONSTANTS.COLORS.HEADER_TEXT } };
    headerRow1.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: EXCEL_CONSTANTS.COLORS.HEADER_BG },
    };
    headerRow1.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    headerRow1.height = EXCEL_CONSTANTS.ROW_HEIGHTS.HEADER;
    headerRow1.border = {
      bottom: { style: 'thin' },
      top: { style: 'thin' },
    };

    // Style Row 2 (time windows)
    headerRow2.font = { bold: true, size: 11, color: { argb: EXCEL_CONSTANTS.COLORS.HEADER_TEXT } };
    headerRow2.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: EXCEL_CONSTANTS.COLORS.HEADER_BG },
    };
    headerRow2.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    headerRow2.height = EXCEL_CONSTANTS.ROW_HEIGHTS.NORMAL;
    headerRow2.border = {
      bottom: { style: 'thin' },
    };
  }

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
