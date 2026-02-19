/**
 * Zustand Store - Application State Management
 * Enhanced with persistence, type safety, and performance optimization
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  FileInfo,
  FileStatus,
  StorageZone,
  InclusionCriteria,
  ExclusionCriteria,
  VisitSchedule,
  MedicationRecord,
  AppSettings,
  DEFAULT_SETTINGS,
} from '@shared/types/core';

// ============================================================================
// Store State Interface
// ============================================================================

interface AppStore {
  // ==========================================================================
  // File Management State
  // ==========================================================================

  /** Protocol files (Storage Zone A) */
  protocolFiles: FileInfo[];
  /** Subject files (Storage Zone B) */
  subjectFiles: FileInfo[];
  /** Currently processing files */
  processingFiles: string[];

  // ==========================================================================
  // Worksheet Data State
  // ==========================================================================

  /** Worksheet 1: Inclusion criteria */
  inclusionCriteria: InclusionCriteria[];
  /** Worksheet 1: Exclusion criteria */
  exclusionCriteria: ExclusionCriteria[];
  /** Worksheet 2: Visit schedule */
  visitSchedule: VisitSchedule[];
  /** Worksheet 3: Medication records */
  medications: MedicationRecord[];

  // ==========================================================================
  // UI State
  // ==========================================================================

  /** Currently active worksheet tab */
  activeWorksheet: 1 | 2 | 3;
  /** Is processing any operation */
  isProcessing: boolean;
  /** Current processing stage description */
  processingStage?: string;
  /** Processing progress (0-100) */
  processingProgress: number;
  /** Sidebar expanded state */
  sidebarExpanded: boolean;
  /** Storage zone expanded state */
  storageZoneExpanded: boolean;

  // ==========================================================================
  // Settings State
  // ==========================================================================

  /** Application settings */
  settings: AppSettings;
  /** API key (convenience access) */
  apiKey: string;

  // ==========================================================================
  // Error State
  // ==========================================================================

  /** Last error that occurred */
  lastError: {
    message: string;
    details?: string;
    timestamp: Date;
  } | null;

  // ==========================================================================
  // File Actions
  // ==========================================================================

  /** Set protocol files */
  setProtocolFiles: (files: FileInfo[]) => void;
  /** Set subject files */
  setSubjectFiles: (files: FileInfo[]) => void;
  /** Add a file */
  addFile: (zone: StorageZone, file: FileInfo) => void;
  /** Remove a file */
  removeFile: (zone: StorageZone, fileId: string) => void;
  /** Update file status */
  updateFileStatus: (zone: StorageZone, fileId: string, status: FileStatus, progress: number) => void;
  /** Clear all files */
  clearFiles: (zone?: StorageZone) => void;
  /** Set processing files */
  setProcessingFiles: (fileIds: string[]) => void;

  // ==========================================================================
  // Worksheet Actions
  // ==========================================================================

  /** Set inclusion criteria */
  setInclusionCriteria: (criteria: InclusionCriteria[]) => void;
  /** Set exclusion criteria */
  setExclusionCriteria: (criteria: ExclusionCriteria[]) => void;
  /** Set visit schedule */
  setVisitSchedule: (schedule: VisitSchedule[]) => void;
  /** Set medications */
  setMedications: (medications: MedicationRecord[]) => void;

  /** Add single visit schedule item */
  addVisitScheduleItem: (item: VisitSchedule) => void;
  /** Update visit schedule item */
  updateVisitScheduleItem: (id: string, updates: Partial<VisitSchedule>) => void;
  /** Delete visit schedule item */
  deleteVisitScheduleItem: (id: string) => void;

  /** Add single medication record */
  addMedicationItem: (item: MedicationRecord) => void;
  /** Update medication record */
  updateMedicationItem: (id: string, updates: Partial<MedicationRecord>) => void;
  /** Delete medication record */
  deleteMedicationItem: (id: string) => void;
  /** Confirm medication record */
  confirmMedicationItem: (id: string) => void;

  // ==========================================================================
  // UI Actions
  // ==========================================================================

  /** Set active worksheet */
  setActiveWorksheet: (worksheet: 1 | 2 | 3) => void;
  /** Set processing state */
  setProcessing: (isProcessing: boolean, stage?: string) => void;
  /** Set processing progress */
  setProcessingProgress: (progress: number) => void;
  /** Toggle sidebar */
  toggleSidebar: () => void;
  /** Toggle storage zone */
  toggleStorageZone: () => void;

  // ==========================================================================
  // Settings Actions
  // ==========================================================================

  /** Set settings */
  setSettings: (settings: Partial<AppSettings>) => void;
  /** Set API key */
  setApiKey: (apiKey: string) => void;
  /** Reset settings to default */
  resetSettings: () => void;

  // ==========================================================================
  // Error Actions
  // ==========================================================================

  /** Set error */
  setError: (message: string, details?: string) => void;
  /** Clear error */
  clearError: () => void;

  // ==========================================================================
  // Utility Actions
  // ==========================================================================

  /** Reset all state */
  resetAll: () => void;
}

// ============================================================================
// Store Creation
// ============================================================================

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // ==========================================================================
      // Initial State
      // ==========================================================================

      // File state
      protocolFiles: [],
      subjectFiles: [],
      processingFiles: [],

      // Worksheet data
      inclusionCriteria: [],
      exclusionCriteria: [],
      visitSchedule: [],
      medications: [],

      // UI state
      activeWorksheet: 1,
      isProcessing: false,
      processingStage: undefined,
      processingProgress: 0,
      sidebarExpanded: true,
      storageZoneExpanded: true,

      // Settings
      settings: DEFAULT_SETTINGS,
      apiKey: DEFAULT_SETTINGS.apiKey,

      // Error state
      lastError: null,

      // ==========================================================================
      // File Actions
      // ==========================================================================

      setProtocolFiles: (files) => set({ protocolFiles: files }),

      setSubjectFiles: (files) => set({ subjectFiles: files }),

      addFile: (zone, file) =>
        set((state) => ({
          [zone === StorageZone.PROTOCOL ? 'protocolFiles' : 'subjectFiles']: [
            ...state[zone === StorageZone.PROTOCOL ? 'protocolFiles' : 'subjectFiles'],
            file,
          ],
        })),

      removeFile: (zone, fileId) =>
        set((state) => {
          const key = zone === StorageZone.PROTOCOL ? 'protocolFiles' : 'subjectFiles';
          return {
            [key]: state[key].filter((f) => f.id !== fileId),
          };
        }),

      updateFileStatus: (zone, fileId, status, progress) =>
        set((state) => {
          const key = zone === StorageZone.PROTOCOL ? 'protocolFiles' : 'subjectFiles';
          return {
            [key]: state[key].map((f) =>
              f.id === fileId ? { ...f, status, progress } : f
            ),
          };
        }),

      clearFiles: (zone) =>
        set((state) => {
          if (!zone) {
            return { protocolFiles: [], subjectFiles: [] };
          }
          return {
            [zone === StorageZone.PROTOCOL ? 'protocolFiles' : 'subjectFiles']: [],
          };
        }),

      setProcessingFiles: (fileIds) => set({ processingFiles: fileIds }),

      // ==========================================================================
      // Worksheet Actions
      // ==========================================================================

      setInclusionCriteria: (criteria) => set({ inclusionCriteria: criteria }),

      setExclusionCriteria: (criteria) => set({ exclusionCriteria: criteria }),

      setVisitSchedule: (schedule) => set({ visitSchedule: schedule }),

      setMedications: (medications) => set({ medications }),

      addVisitScheduleItem: (item) =>
        set((state) => ({
          visitSchedule: [...state.visitSchedule, item],
        })),

      updateVisitScheduleItem: (id, updates) =>
        set((state) => ({
          visitSchedule: state.visitSchedule.map((item) =>
            item.id === id ? { ...item, ...updates, _userEdited: true } : item
          ),
        })),

      deleteVisitScheduleItem: (id) =>
        set((state) => ({
          visitSchedule: state.visitSchedule.filter((item) => item.id !== id),
        })),

      addMedicationItem: (item) =>
        set((state) => ({
          medications: [...state.medications, item],
        })),

      updateMedicationItem: (id, updates) =>
        set((state) => ({
          medications: state.medications.map((med) =>
            med.id === id ? { ...med, ...updates, _userConfirmed: true } : med
          ),
        })),

      deleteMedicationItem: (id) =>
        set((state) => ({
          medications: state.medications.filter((med) => med.id !== id),
        })),

      confirmMedicationItem: (id) =>
        set((state) => ({
          medications: state.medications.map((med) =>
            med.id === id ? { ...med, _userConfirmed: true } : med
          ),
        })),

      // ==========================================================================
      // UI Actions
      // ==========================================================================

      setActiveWorksheet: (worksheet) => set({ activeWorksheet: worksheet }),

      setProcessing: (isProcessing, stage) =>
        set({ isProcessing, processingStage: stage, processingProgress: isProcessing ? 0 : 100 }),

      setProcessingProgress: (progress) => set({ processingProgress: progress }),

      toggleSidebar: () =>
        set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),

      toggleStorageZone: () =>
        set((state) => ({ storageZoneExpanded: !state.storageZoneExpanded })),

      // ==========================================================================
      // Settings Actions
      // ==========================================================================

      setSettings: (newSettings: Partial<AppSettings>) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
          apiKey: newSettings.apiKey !== undefined ? newSettings.apiKey : state.apiKey,
        })),

      setApiKey: (apiKey: string) =>
        set((state) => ({
          apiKey,
          settings: { ...state.settings, apiKey },
        })),

      resetSettings: () =>
        set({
          settings: DEFAULT_SETTINGS,
          apiKey: DEFAULT_SETTINGS.apiKey,
        }),

      // ==========================================================================
      // Error Actions
      // ==========================================================================

      setError: (message: string, details?: string) =>
        set({
          lastError: { message, details, timestamp: new Date() },
        }),

      clearError: () => set({ lastError: null }),

      // ==========================================================================
      // Utility Actions
      // ==========================================================================

      resetAll: () =>
        set({
          protocolFiles: [],
          subjectFiles: [],
          processingFiles: [],
          inclusionCriteria: [],
          exclusionCriteria: [],
          visitSchedule: [],
          medications: [],
          activeWorksheet: 1,
          isProcessing: false,
          processingStage: undefined,
          processingProgress: 0,
          lastError: null,
        }),
    }),
    {
      name: 'cra-v3-storage',
      // Partial persistence - only persist specific fields
      partialize: (state: AppStore) => ({
        settings: state.settings,
        apiKey: state.apiKey,
        // Persist worksheet data for auto-save
        inclusionCriteria: state.inclusionCriteria,
        exclusionCriteria: state.exclusionCriteria,
        visitSchedule: state.visitSchedule,
        medications: state.medications,
      }),
      // Version migration
      version: 1,
    }
  )
);

// ============================================================================
// Selector Hooks for Performance
// ============================================================================

/**
 * Selector hook for protocol files
 */
export const useProtocolFiles = () => useStore((state) => state.protocolFiles);

/**
 * Selector hook for subject files
 */
export const useSubjectFiles = () => useStore((state) => state.subjectFiles);

/**
 * Selector hook for inclusion criteria
 */
export const useInclusionCriteria = () => useStore((state) => state.inclusionCriteria);

/**
 * Selector hook for exclusion criteria
 */
export const useExclusionCriteria = () => useStore((state) => state.exclusionCriteria);

/**
 * Selector hook for visit schedule
 */
export const useVisitSchedule = () => useStore((state) => state.visitSchedule);

/**
 * Selector hook for medications
 */
export const useMedications = () => useStore((state) => state.medications);

/**
 * Selector hook for active worksheet
 */
export const useActiveWorksheet = () => useStore((state) => state.activeWorksheet);

/**
 * Selector hook for processing state
 */
export const useProcessingState = () =>
  useStore((state) => ({
    isProcessing: state.isProcessing,
    processingStage: state.processingStage,
    processingProgress: state.processingProgress,
  }));

/**
 * Selector hook for API key
 */
export const useApiKey = () => useStore((state) => state.apiKey);

/**
 * Selector hook for error state
 */
export const useError = () => useStore((state) => state.lastError);

export default useStore;
