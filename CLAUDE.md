# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CRA AI Assistant V3.0 is a desktop application for clinical trial monitoring (CRA work). It uses Electron + React + TypeScript with the GLM-4 AI model to extract information from clinical trial protocol documents and subject medical records, then generates Excel tracker reports.

**Working Directory**: The main source code is located in `AI for CRA V3.0/` subdirectory.

## Development Commands

**Important**: The project source code is in the `AI for CRA V3.0/` subdirectory. All npm commands must be run from there.

```bash
# Navigate to project directory first (required for all commands)
cd "AI for CRA V3.0"

# Development (runs main + renderer with hot reload)
npm run dev

# Build for production
npm run build

# Package as Windows installer
npm run dist

# Start Electron after build
npm start
```

The dev server runs on port 3000 for the renderer process.

**Note**: This project does not have a test suite. No `npm test` command is available.

## Architecture

### Directory Structure

```
AI for CRA V3.0/
└── src/
    ├── main/           # Electron main process
    │   ├── index.ts    # Entry point, window creation
    │   ├── preload.ts  # IPC bridge (contextBridge)
    │   ├── handlers/   # IPC handlers
    │   │   ├── FileHandler.ts      # File operations (upload, process, delete)
    │   │   ├── AIHandler.ts        # AI operations (extract, recognize, chat)
    │   │   ├── ExcelHandler.ts     # Excel export
    │   │   ├── SettingsHandler.ts  # Settings management
    │   │   ├── SystemHandler.ts    # System info, network test
    │   │   └── DialogHandler.ts    # File dialogs
    │   └── services/   # Business logic
    │       ├── AIService/
    │       │   ├── GLMService.ts   # GLM-4 API integration
    │       │   └── prompts.ts      # AI prompt templates
    │       └── ExcelService/
    │           └── ExcelGenerator.ts
    ├── renderer/       # React UI process
    │   ├── components/ # React components
    │   │   ├── common/ # Button, Card, ProgressBar, Toast, ErrorBoundary
    │   │   ├── Layout/ # AppLayout
    │   │   ├── StorageZone/ # File upload zones
    │   │   ├── Worksheet1/ # CriteriaSheet (inclusion/extraction)
    │   │   ├── Worksheet2/ # VisitScheduleEditor
    │   │   └── Worksheet3/ # MedicationReviewer
    │   ├── hooks/      # useStore.ts (Zustand state)
    │   └── App.tsx     # Root component
    └── shared/         # Shared types/constants
        ├── types/      # core.ts, worksheet.ts
        └── constants/  # app.ts
```

### IPC Communication Pattern

The app uses a type-safe IPC layer via `preload.ts`:

1. **Renderer calls**: `window.electronAPI.methodName(payload)`
2. **Preload routes to**: `ipcRenderer.invoke('channel:name', payload)`
3. **Main handler**: Registered in `setupIPCHandlers()` in `main/index.ts`

All IPC responses use the `Result<T>` type (not plain throws):
- `{ success: true, data: T }`
- `{ success: false, error: AppError }`

### Available IPC Endpoints

**File Operations** (`file:*`):
- `uploadFile(zone, filePath)` - Upload file to protocol/subject zone
- `deleteFile(zone, fileId)` - Delete a file
- `processFile(zone, fileId)` - Extract text (PDF OCR or image OCR)
- `getAllFiles(zone)` - Get all files in a zone

**AI Operations** (`ai:*`):
- `extractCriteria(protocolContent)` - Extract inclusion/exclusion criteria
- `extractVisitSchedule(protocolContent)` - Extract visit schedule
- `recognizeMedications(subjectContent)` - Recognize medications from records
- `chat(message, context)` - Chat with AI assistant
- `testConnection()` - Test API connectivity

**Excel Operations** (`excel:*`):
- `exportTracker(data)` - Export all worksheets to Excel

**Settings** (`settings:*`):
- `getSettings()` - Get application settings
- `setSettings(settings)` - Update settings
- `setApiKey(apiKey)` - Update GLM-4 API key

**System** (`system:*`):
- `getVersion()` - Get app version
- `openExternal(url)` - Open URL in browser
- `testNetwork()` - Test network connectivity

**Dialog** (`dialog:*`):
- `openFile()` - Open file selection dialog
- `saveFile(defaultName, filters)` - Open save dialog

### Storage Zones (File Management)

- **StorageZone.PROTOCOL ("存储区A")**: Clinical trial protocol files (PDF/images)
- **StorageZone.SUBJECT ("存储区B")**: Subject medical records

Files are tracked in Zustand store with `FileStatus` states: `PENDING` → `VALIDATING` → `PROCESSING` → `COMPLETED`.

### Worksheet Components

The app has three worksheet tabs:

1. **Worksheet1 (CriteriaSheet)**: Inclusion/Exclusion criteria extraction
2. **Worksheet2 (VisitScheduleEditor)**: Visit schedule with procedures/assessments
3. **Worksheet3 (MedicationReviewer)**: Medication recognition from records

Each worksheet is a React component in `src/renderer/components/Worksheet[N]/`.

### State Management

Zustand store at `src/renderer/hooks/useStore.ts` with persistence:
- Auto-saves: settings, worksheet data (inclusionCriteria, visitSchedule, medications)
- Does NOT persist: file lists, transient UI state

### AI Integration (GLM-4)

`src/main/services/AIService/GLMService.ts` implements:
- Custom JWT token generation (no external SDK dependency)
- Rate limiting (60 req/min)
- Retry logic with exponential backoff
- Four main AI operations: `extractCriteria()`, `extractVisitSchedule()`, `recognizeMedications()`, `chat()`

API key format: `id.secret` (splits on `.` for JWT signing).

### Error Handling

Use `Result<T>` type for operations that can fail:
```typescript
import { ok, err, createError } from '@shared/types/core';

// Success
return ok(data);

// Failure
return err(createError(
  'ERROR_CODE',
  ErrorCategory.DOMAIN,
  ErrorSeverity.CRITICAL,
  'User message',
  'Technical message'
));
```

### Path Aliases (TypeScript/Webpack)

- `@shared` → `src/shared`
- `@renderer` → `src/renderer`
- `@main` → `src/main`

## TypeScript Configuration

The project has some non-strict TypeScript settings:
- `noImplicitAny: false` - Allows implicit any types
- `strictNullChecks: false` - Disables strict null checks

When modifying code, aim to improve type safety where possible, but be aware that existing code may not have strict typing.

## Key Dependencies

- **electron**: Desktop framework
- **react** + **zustand**: UI + state
- **pdf-parse**: PDF text extraction
- **tesseract.js**: OCR for images
- **exceljs**: Excel report generation
- **adm-zip**: ZIP archive handling
- No AI SDK - uses native HTTPS with JWT

## Adding New Features

1. **New IPC endpoint**: Add to `preload.ts`, then create handler in `main/handlers/`
2. **New AI operation**: Add method to `GLMService` and prompt in `prompts.ts`
3. **New worksheet**: Create component in `renderer/components/Worksheet[N]/`, add to `App.tsx`

## Component Hierarchy

```
App (root)
├── AppLayout (main layout)
│   ├── Header (app header with settings button)
│   ├── Worksheet Tabs (1/2/3)
│   └── Content Area
│       ├── StorageZone (file upload zones)
│       ├── CriteriaSheet (Worksheet1)
│       ├── VisitScheduleEditor (Worksheet2)
│       └── MedicationReviewer (Worksheet3)
└── ToastContainer
```

## Working Directory

Always remember that the main project code is in the `AI for CRA V3.0/` subdirectory. When running commands or referencing files, use this path.
