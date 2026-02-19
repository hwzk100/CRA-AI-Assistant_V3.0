# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CRA AI Assistant V3.0 is a desktop application for clinical trial monitoring (CRA work). It uses Electron + React + TypeScript with the GLM-4 AI model to extract information from clinical trial protocol documents and subject medical records, then generates Excel tracker reports.

## Development Commands

```bash
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

## Architecture

### Directory Structure

```
src/
├── main/           # Electron main process
│   ├── index.ts    # Entry point, window creation
│   ├── preload.ts  # IPC bridge (contextBridge)
│   ├── handlers/   # IPC handlers (FileHandler, AIHandler, etc.)
│   └── services/   # Business logic (AIService, ExcelService)
├── renderer/       # React UI process
│   ├── components/ # React components (Layout, StorageZone, Worksheet1/2/3)
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
- Three main AI operations: `extractCriteria()`, `extractVisitSchedule()`, `recognizeMedications()`

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
