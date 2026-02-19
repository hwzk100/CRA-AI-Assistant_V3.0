/**
 * Zustand Store - Application State Management
 * Enhanced with persistence, type safety, and performance optimization
 */
import { FileInfo, FileStatus, StorageZone, InclusionCriteria, ExclusionCriteria, VisitSchedule, MedicationRecord, AppSettings } from '@shared/types/core';
interface AppStore {
    /** Protocol files (Storage Zone A) */
    protocolFiles: FileInfo[];
    /** Subject files (Storage Zone B) */
    subjectFiles: FileInfo[];
    /** Currently processing files */
    processingFiles: string[];
    /** Worksheet 1: Inclusion criteria */
    inclusionCriteria: InclusionCriteria[];
    /** Worksheet 1: Exclusion criteria */
    exclusionCriteria: ExclusionCriteria[];
    /** Worksheet 2: Visit schedule */
    visitSchedule: VisitSchedule[];
    /** Worksheet 3: Medication records */
    medications: MedicationRecord[];
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
    /** Application settings */
    settings: AppSettings;
    /** API key (convenience access) */
    apiKey: string;
    /** Last error that occurred */
    lastError: {
        message: string;
        details?: string;
        timestamp: Date;
    } | null;
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
    /** Set settings */
    setSettings: (settings: Partial<AppSettings>) => void;
    /** Set API key */
    setApiKey: (apiKey: string) => void;
    /** Reset settings to default */
    resetSettings: () => void;
    /** Set error */
    setError: (message: string, details?: string) => void;
    /** Clear error */
    clearError: () => void;
    /** Reset all state */
    resetAll: () => void;
}
export declare const useStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<AppStore>, "setState" | "persist"> & {
    setState(partial: AppStore | Partial<AppStore> | ((state: AppStore) => AppStore | Partial<AppStore>), replace?: false): unknown;
    setState(state: AppStore | ((state: AppStore) => AppStore), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<AppStore, {
            settings: AppSettings;
            apiKey: string;
            inclusionCriteria: InclusionCriteria[];
            exclusionCriteria: ExclusionCriteria[];
            visitSchedule: VisitSchedule[];
            medications: MedicationRecord[];
        }, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: AppStore) => void) => () => void;
        onFinishHydration: (fn: (state: AppStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<AppStore, {
            settings: AppSettings;
            apiKey: string;
            inclusionCriteria: InclusionCriteria[];
            exclusionCriteria: ExclusionCriteria[];
            visitSchedule: VisitSchedule[];
            medications: MedicationRecord[];
        }, unknown>>;
    };
}>;
/**
 * Selector hook for protocol files
 */
export declare const useProtocolFiles: () => FileInfo[];
/**
 * Selector hook for subject files
 */
export declare const useSubjectFiles: () => FileInfo[];
/**
 * Selector hook for inclusion criteria
 */
export declare const useInclusionCriteria: () => InclusionCriteria[];
/**
 * Selector hook for exclusion criteria
 */
export declare const useExclusionCriteria: () => ExclusionCriteria[];
/**
 * Selector hook for visit schedule
 */
export declare const useVisitSchedule: () => VisitSchedule[];
/**
 * Selector hook for medications
 */
export declare const useMedications: () => MedicationRecord[];
/**
 * Selector hook for active worksheet
 */
export declare const useActiveWorksheet: () => 2 | 1 | 3;
/**
 * Selector hook for processing state
 */
export declare const useProcessingState: () => {
    isProcessing: boolean;
    processingStage: string;
    processingProgress: number;
};
/**
 * Selector hook for API key
 */
export declare const useApiKey: () => string;
/**
 * Selector hook for error state
 */
export declare const useError: () => {
    message: string;
    details?: string;
    timestamp: Date;
};
export default useStore;
//# sourceMappingURL=useStore.d.ts.map