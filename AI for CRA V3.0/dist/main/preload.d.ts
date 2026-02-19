/**
 * Electron Preload Script
 * Exposes secure IPC API to renderer process
 */
declare const electronAPI: {
    /**
     * Platform information
     */
    platform: NodeJS.Platform;
    /**
     * API helpers
     */
    invoke: (channel: string, payload?: any) => Promise<any>;
    uploadFile: (zone: "protocol" | "subject", filePath: string) => Promise<any>;
    deleteFile: (zone: "protocol" | "subject", fileId: string) => Promise<any>;
    processFile: (zone: "protocol" | "subject", fileId: string) => Promise<any>;
    getAllFiles: (zone: "protocol" | "subject") => Promise<any>;
    extractCriteria: (protocolContent?: string) => Promise<any>;
    extractVisitSchedule: (protocolContent?: string) => Promise<any>;
    recognizeMedications: (subjectContent?: string) => Promise<any>;
    chat: (message: string, context?: string) => Promise<any>;
    testConnection: () => Promise<any>;
    exportTracker: (data: {
        outputPath?: string;
        inclusionCriteria: any[];
        exclusionCriteria: any[];
        visitSchedule: any[];
        medications: any[];
    }) => Promise<any>;
    getSettings: () => Promise<any>;
    setSettings: (settings: Partial<any>) => Promise<any>;
    setApiKey: (apiKey: string) => Promise<any>;
    getVersion: () => Promise<any>;
    openExternal: (url: string) => Promise<any>;
    testNetwork: () => Promise<any>;
    openFile: () => Promise<any>;
    saveFile: (defaultName?: string, filters?: Array<{
        name: string;
        extensions: string[];
    }>) => Promise<any>;
};
declare global {
    interface Window {
        electronAPI: typeof electronAPI;
    }
}
export type ElectronAPI = typeof electronAPI;
export {};
//# sourceMappingURL=preload.d.ts.map