/**
 * Electron Preload Script
 * Exposes secure IPC API to renderer process
 */

import { contextBridge, ipcRenderer } from 'electron';

// ============================================================================
// Type-Safe IPC API
// ============================================================================

/**
 * Create a type-safe IPC renderer
 */
const createIPCRenderer = () => {
  return {
    /**
     * Invoke an IPC channel and return a promise
     */
    invoke: (channel: string, payload?: any): Promise<any> => {
      return ipcRenderer.invoke(channel, payload);
    },

    /**
     * Send a message without waiting for response
     */
    send: (channel: string, payload?: any): void => {
      ipcRenderer.send(channel, payload);
    },

    /**
     * Listen to a channel
     */
    on: (channel: string, callback: (...args: any[]) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, ...args: any[]) =>
        callback(...args);
      ipcRenderer.on(channel, listener);

      // Return unsubscribe function
      return () => ipcRenderer.removeListener(channel, listener);
    },

    /**
     * Listen to a channel once
     */
    once: (channel: string, callback: (...args: any[]) => void) => {
      ipcRenderer.once(channel, (_event, ...args) => callback(...args));
    },
  };
};

// ============================================================================
// Expose API to Renderer
// ============================================================================

const electronAPI = {
  /**
   * Platform information
   */
  platform: process.platform,

  /**
   * API helpers
   */
  invoke: createIPCRenderer().invoke,

  // ========================================================================
  // File Operations
  // ========================================================================

  uploadFile: (zone: 'protocol' | 'subject', filePath: string) =>
    createIPCRenderer().invoke('file:upload', {
      zone: zone === 'protocol' ? 'protocol' : 'subject',
      filePath,
    }),

  deleteFile: (zone: 'protocol' | 'subject', fileId: string) =>
    createIPCRenderer().invoke('file:delete', {
      zone: zone === 'protocol' ? 'protocol' : 'subject',
      fileId,
    }),

  processFile: (zone: 'protocol' | 'subject', fileId: string) =>
    createIPCRenderer().invoke('file:process', {
      zone: zone === 'protocol' ? 'protocol' : 'subject',
      fileId,
    }),

  getAllFiles: (zone: 'protocol' | 'subject') =>
    createIPCRenderer().invoke('file:getAll', {
      zone: zone === 'protocol' ? 'protocol' : 'subject',
    }),

  // ========================================================================
  // AI Operations
  // ========================================================================

  extractCriteria: (protocolContent?: string) =>
    createIPCRenderer().invoke('ai:extractCriteria', {
      protocolContent: protocolContent || '',
    }),

  extractVisitSchedule: (protocolContent?: string) =>
    createIPCRenderer().invoke('ai:extractVisitSchedule', {
      protocolContent: protocolContent || '',
    }),

  recognizeMedications: (subjectContent?: string) =>
    createIPCRenderer().invoke('ai:recognizeMedications', {
      subjectContent: subjectContent || '',
    }),

  extractSubjectNumber: (subjectContent?: string) =>
    createIPCRenderer().invoke('ai:extractSubjectNumber', {
      subjectContent: subjectContent || '',
    }),

  extractSubjectVisits: (subjectContent?: string, visitScheduleSummary?: string) =>
    createIPCRenderer().invoke('ai:extractSubjectVisits', {
      subjectContent: subjectContent || '',
      visitScheduleSummary: visitScheduleSummary || '',
    }),

  extractSubjectItems: (subjectContent?: string, visitItemsSummary?: string) =>
    createIPCRenderer().invoke('ai:extractSubjectItems', {
      subjectContent: subjectContent || '',
      visitItemsSummary: visitItemsSummary || '',
    }),

  chat: (message: string, context?: string) =>
    createIPCRenderer().invoke('ai:chat', {
      message,
      context,
    }),

  testConnection: () =>
    createIPCRenderer().invoke('ai:testConnection', undefined),

  // ========================================================================
  // Excel Operations
  // ========================================================================

  exportTracker: (data: {
    outputPath?: string;
    inclusionCriteria: any[];
    exclusionCriteria: any[];
    visitSchedule: any[];
    subjectVisits: any[];
    subjectVisitItems: any[];
    medications: any[];
  }) =>
    createIPCRenderer().invoke('excel:exportTracker', data),

  // ========================================================================
  // Settings
  // ========================================================================

  getSettings: () =>
    createIPCRenderer().invoke('settings:get', undefined),

  setSettings: (settings: Partial<any>) =>
    createIPCRenderer().invoke('settings:set', {
      settings,
    }),

  setApiKey: (apiKey: string) =>
    createIPCRenderer().invoke('settings:setApiKey', {
      apiKey,
    }),

  // ========================================================================
  // System
  // ========================================================================

  getVersion: () =>
    createIPCRenderer().invoke('system:getVersion', undefined),

  openExternal: (url: string) =>
    createIPCRenderer().invoke('system:openExternal', {
      url,
    }),

  testNetwork: () =>
    createIPCRenderer().invoke('system:testNetwork', undefined),

  // ========================================================================
  // Dialog
  // ========================================================================

  openFile: () =>
    createIPCRenderer().invoke('dialog:openFile', undefined),

  saveFile: (defaultName?: string, filters?: Array<{ name: string; extensions: string[] }>) =>
    createIPCRenderer().invoke('dialog:saveFile', {
      defaultName,
      filters,
    }),
};

// Expose the API to window object
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// TypeScript augmentation
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}

export type ElectronAPI = typeof electronAPI;
