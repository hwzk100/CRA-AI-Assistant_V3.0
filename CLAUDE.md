# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Project Overview

CRA AI Assistant V3.0 is a desktop application for clinical trial monitoring (CRA work). It uses Electron + React + TypeScript with the GLM-4 AI model to extract information from clinical trial protocol documents and subject medical records, then generates Excel tracker reports.

**Working Directory**: The main source code is located in `AI for CRA V3.0/` subdirectory.

**Product Requirements**: See `PRD.md` for detailed product specifications, acceptance criteria, and user workflows.

**Troubleshooting Guide**: See `AI for CRA V3.0/TROUBLESHOOTING.md` for diagnosing white screen issues, build problems, and common errors.

## Development Commands

**Important**: The project source code is in the `AI for CRA V3.0/` subdirectory. All npm commands must be run from there.

```bash
# Navigate to project directory first (required for all commands)
cd "AI for CRA V3.0"

# Development (runs main + renderer with hot reload)
npm run dev

# Individual process development
npm run dev:main      # Watch main process only
npm run dev:renderer  # Watch renderer process only

# Build for production
npm run build

# Build individual processes
npm run build:main
npm run build:renderer

# Package as Windows installer (outputs to release/ directory)
npm run dist

# Package without installer (for testing)
npm run pack

# Start Electron after build
npm start
```

The dev server runs on port 3000 for the renderer process.

**Note**: This project does not have a test suite. No `npm test` command is available.

## Debugging

**Renderer DevTools**: Automatically opened in development mode. Use `Ctrl+Shift+I` to toggle.

**Main Process Logs**: View in the terminal where `npm run dev` is running, or in the renderer's Console tab (prefixed with `[Renderer Console]`).

**Common Debug Locations**:
- `GLMService.ts`: API calls, token generation, rate limiting
- `FileHandler.ts`: File processing, OCR/PDF parsing
- `AIHandler.ts`: AI extraction operations
- Browser DevTools Network tab: Monitor HTTPS API calls to GLM-4

**Common Issues**:
- **API connection failures**: Check API key format (`id.secret`), network connectivity
- **OCR timeout**: Large images may take >10s; consider resizing or using vision API
- **JSON parse errors**: GLM-4 may return incomplete JSON; the service includes auto-recovery
- **Rate limiting**: 60 requests/min; wait if hitting limits frequently
- **White screen/blank window**: Check CSP headers, ensure build artifacts exist, verify `dist/` directory structure

**Troubleshooting Build Issues**:
```bash
# Clean rebuild (if experiencing white screen or build issues)
cd "AI for CRA V3.0"
rm -rf dist node_modules
npm install
npm run build
npm start
```

## Environment Requirements

- Node.js >= 16.0.0
- npm >= 8.0.0

## File Size and API Limits

- **File upload limit**: 50MB per file
- **Content truncation**: Protocol content is truncated to 3000-4000 tokens for AI requests to avoid timeouts
- **Vision API**: Image data URLs are sent directly to GLM-4V; ensure images are reasonably sized (<5MB recommended)
- **Rate limiting**: GLM-4 API has a 60 requests/minute limit; the service automatically waits when limit is reached

## Architecture

### Directory Structure

```
AI for CRA V3.0/
├── src/
│   ├── main/           # Electron main process
│   │   ├── index.ts    # Entry point, window creation
│   │   ├── preload.ts  # IPC bridge (contextBridge)
│   │   ├── handlers/   # IPC handlers
│   │   │   ├── FileHandler.ts      # File operations (upload, process, delete)
│   │   │   ├── AIHandler.ts        # AI operations (extract, recognize, chat)
│   │   │   ├── ExcelHandler.ts     # Excel export
│   │   │   ├── SettingsHandler.ts  # Settings management
│   │   │   ├── SystemHandler.ts    # System info, network test
│   │   │   └── DialogHandler.ts    # File dialogs
│   │   └── services/   # Business logic
│   │       ├── AIService/
│   │       │   ├── GLMService.ts   # GLM-4 API integration
│   │       │   └── prompts.ts      # AI prompt templates
│   │       └── ExcelService/
│   │           └── ExcelGenerator.ts
│   ├── renderer/       # React UI process
│   │   ├── components/ # React components
│   │   │   ├── common/ # Button, Card, ProgressBar, Toast, ErrorBoundary
│   │   │   ├── Layout/ # AppLayout
│   │   │   ├── StorageZone/ # File upload zones
│   │   │   ├── Worksheet1/ # CriteriaSheet (inclusion/extraction)
│   │   │   ├── Worksheet2/ # VisitScheduleEditor
│   │   │   └── Worksheet3/ # MedicationReviewer
│   │   ├── hooks/      # useStore.ts (Zustand state)
│   │   └── App.tsx     # Root component
│   └── shared/         # Shared types/constants
│       ├── types/      # core.ts, worksheet.ts
│       └── constants/  # app.ts
├── dist/              # Compiled output (generated)
├── release/           # Packaged installers (generated)
├── webpack.main.config.js    # Main process webpack config
├── webpack.renderer.config.js # Renderer process webpack config
├── tailwind.config.js        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

### IPC Communication Pattern

The app uses a type-safe IPC layer via `preload.ts`:

1. **Renderer calls**: `window.electronAPI.methodName(payload)`
2. **Preload routes to**: `ipcRenderer.invoke('channel:name', payload)`
3. **Main handler**: Registered in `setupIPCHandlers()` in `main/index.ts`

**Type Safety**: IPC channels have type-safe payload and response mappings defined in `@shared/types/core.ts`:
- `IPCRequestPayload` - Maps channel names to request payload types
- `IPCResponsePayload` - Maps channel names to response types using `Result<T>`

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
- `extractSubjectNumber(subjectContent)` - Extract subject number from medical records
- `extractSubjectVisits(subjectContent, visitScheduleSummary)` - Extract subject visit dates
- `extractSubjectItems(subjectContent, visitItemsSummary)` - Extract subject visit item dates
- `chat(message, context)` - Chat with AI assistant (未完全实现/Not fully implemented)
- `testConnection()` - Test API connectivity
- `extractFromImage(imageDataUrl, prompt)` - Extract text from image using vision API

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

**File Processing Workflow**:
1. Upload → File validated → Status: `PENDING`
2. User clicks "Process" → Text extraction begins
3. **PDF files**: Use `pdf-parse` to extract embedded text (non-OCR)
4. **Image files**: Use `Tesseract.js` for OCR recognition
5. Completion → Status: `COMPLETED` with extracted text stored
6. Failed → Status: `FAILED` with error message

**FileStatus States**: `PENDING` → `VALIDATING` → `PROCESSING` / `OCR_PROCESSING` / `PDF_PARSING` → `COMPLETED` / `FAILED` / `CANCELLED`

**Image Processing**: Images can also be processed directly with the vision API (GLM-4V) without OCR, setting `processedWithVision: true` and storing `imageDataUrl`.

### Worksheet Components

The app has three worksheet tabs:

1. **Worksheet1 (CriteriaSheet)**: Inclusion/Exclusion criteria extraction
2. **Worksheet2 (VisitScheduleEditor)**: Visit schedule with procedures/assessments
3. **Worksheet3 (MedicationReviewer)**: Medication recognition from records

Each worksheet is a React component in `src/renderer/components/Worksheet[N]/`.

### State Management

Zustand store at `src/renderer/hooks/useStore.ts` with persistence:
- **Auto-saves** (localStorage via zustand persist middleware):
  - Settings (API key, model preferences, theme, language)
  - Worksheet data: inclusionCriteria, exclusionCriteria, visitSchedule, subjectVisits, subjectVisitItems, medications
- **Does NOT persist** (session-only):
  - File lists (protocolFiles, subjectFiles)
  - Transient UI state (isProcessing, processingStage, activeWorksheet)

**Persistence Version**: Currently at version 2 with migration support for adding model settings to existing users.

**Selector Hooks**: Use the selector hooks (e.g., `useProtocolFiles()`, `useInclusionCriteria()`) for optimized re-renders when accessing specific store slices.

### AI Integration (GLM-4)

`src/main/services/AIService/GLMService.ts` implements:
- Custom JWT token generation (no external SDK dependency)
- Rate limiting (60 req/min) with automatic waiting when limit reached
- Retry logic with exponential backoff (max 2 retries by default)
- Vision API support for direct image analysis (GLM-4V models)
- Incomplete JSON response recovery with bracket/brace fixing
- AI operations:
  - `extractCriteria()` - Extract inclusion/exclusion criteria
  - `extractVisitSchedule()` - Extract visit schedule with procedures/assessments
  - `recognizeMedications()` - Recognize medications from medical records
  - `extractSubjectNumber()` - Extract subject number
  - `extractSubjectVisitDates()` - Extract actual visit dates from records
  - `extractSubjectVisitItems()` - Extract actual item dates from records
  - Vision methods: `extractFromImage()`, `extractCriteriaFromImage()`, `extractVisitScheduleFromImage()`, `recognizeMedicationsFromImage()`
- `chat()` endpoint exists in IPC handler but returns a placeholder (功能开发中)

**API Key Format**: `id.secret` (splits on `.` for JWT signing). The token expires in 1 hour and is regenerated automatically.

**JWT Token Generation**: The app implements custom JWT token generation (matching ZhipuAI official implementation) in `GLMService.ts`. No external SDK dependency is required - uses native Node.js `crypto` module for HMAC-SHA256 signing.

**Models Available**:
- Text models: `glm-4` (default), `glm-4-flash` (faster, cheaper)
- Vision models: `glm-4v`, `glm-4v-flash` (default)

**When to use Vision API**: Use GLM-4V models (`glm-4v` or `glm-4v-flash`) when processing images that require AI understanding (e.g., extracting structured data from document photos). The vision API accepts `image_url` in the message content array alongside text prompts.

### OCR Language Support

The app supports multiple OCR languages via Tesseract.js:
- `chi_sim` - Simplified Chinese (default)
- `chi_tra` - Traditional Chinese
- `eng` - English
- `jpn` - Japanese
- `kor` - Korean

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

**Error Categories**:
- `DOMAIN` - Business logic failures (validation, AI extraction)
- `INFRASTRUCTURE` - File I/O, OCR, PDF parsing failures
- `NETWORK` - Network failures, API errors
- `UI` - UI/interaction failures

**Error Severity**:
- `CRITICAL` - Blocks the current operation
- `WARNING` - Allows continuing with a warning
- `INFO` - Informational message

**Type Guards**: Use `isSuccess(result)` and `isFailure(result)` for type-safe error checking.

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

## Important Implementation Notes

1. **Default API Key**: The app includes a default API key in `src/shared/constants/app.ts` (`DEFAULT_SETTINGS`) for development. This should be removed for production builds.

2. **Truncation Strategy**: Content is truncated using `truncateContent()` in `prompts.ts` to ensure AI requests stay within token limits and complete reliably.

3. **Vision vs OCR**: For images, prefer Tesseract.js OCR for plain text extraction. Use vision API (GLM-4V) when you need AI understanding of the image content.

4. **Zustand Persistence**: The store persists to localStorage. Clear browser data or use the reset functionality to clear persisted state.

5. **Error Display**: Errors are shown via Toast components. Ensure error messages are user-friendly in Chinese (the primary language).
