/**
 * Excel Handler - IPC handlers for Excel export operations
 */

import { IpcMain, BrowserWindow } from 'electron';
import { generateTrackerExcel, generateOutputPath } from '../services/ExcelService/ExcelGenerator';
import { InclusionCriteria, ExclusionCriteria, VisitSchedule, MedicationRecord } from '@shared/types/core';
import { SubjectVisitData, SubjectVisitItemData } from '@shared/types/worksheet';

// ============================================================================
// Setup Handler
// ============================================================================

export const setupExcelHandlers = (ipcMain: IpcMain, mainWindow: BrowserWindow | null): void => {
  /**
   * Export tracker Excel file with all worksheets
   */
  ipcMain.handle(
    'excel:exportTracker',
    async (
      _event,
      {
        outputPath,
        inclusionCriteria,
        exclusionCriteria,
        visitSchedule,
        subjectVisits,
        subjectVisitItems,
        medications,
      }: {
        outputPath?: string;
        inclusionCriteria: InclusionCriteria[];
        exclusionCriteria: ExclusionCriteria[];
        visitSchedule: VisitSchedule[];
        subjectVisits: SubjectVisitData[];
        subjectVisitItems: SubjectVisitItemData[];
        medications: MedicationRecord[];
      }
    ) => {
      try {
        // Generate output path if not provided
        const finalOutputPath = outputPath || generateOutputPath();

        // Use data from renderer state
        const trackerData = {
          inclusionCriteria,
          exclusionCriteria,
          visitSchedule,
          subjectVisits,
          subjectVisitItems,
          medications,
        };

        // Generate Excel
        const result = await generateTrackerExcel(trackerData, {
          outputPath: finalOutputPath,
          includeSummary: true,
          applyStyling: true,
          title: 'CRA监查Tracker表',
        });

        if (result.success) {
          return {
            success: true,
            data: result.data.filePath,
          };
        } else {
          return result;
        }
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'EXCEL_EXPORT_FAILED',
            userMessage: 'Excel导出失败',
            technicalMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    }
  );
};
