# Project Architecture - MVC Structure

## Overview
This project uses a clean MVC (Model-View-Controller) architecture with Next.js 15 App Router.

## Folder Structure

```
src/
├── domain/                    # Business Logic Layer (Models + Services)
│   ├── signup/               # Signup feature
│   │   ├── types.ts         # TypeScript interfaces
│   │   ├── schemas.ts       # Zod validation schemas
│   │   ├── services.ts      # Business logic (Apps Script integration)
│   │   └── index.ts         # Barrel export
│   │
│   ├── receipt/             # Receipt generation feature
│   │   ├── types.ts
│   │   ├── schemas.ts
│   │   ├── services.ts      # html-to-image export logic
│   │   └── index.ts
│   │
│   └── model/               # Model profile feature (NEW)
│       ├── types.ts         # ModelProfile interface
│       ├── schemas.ts       # Validation schemas
│       ├── services.ts      # Google Sheets integration
│       └── index.ts
│
├── app/                      # Next.js App Router (Views + Controllers)
│   ├── api/                 # API Routes (Controllers)
│   │   ├── mform1/route.ts  # Signup submission handler
│   │   ├── submit/route.ts  # Form submission handler
│   │   └── model/route.ts   # Model data fetcher (NEW)
│   │
│   ├── (pages)
│   │   ├── page.tsx         # Home (landing)
│   │   ├── signup/page.tsx  # Signup form view
│   │   ├── testpage/page.tsx
│   │   ├── testpage2/page.tsx
│   │   ├── home/
│   │   ├── mhome/
│   │   ├── about/
│   │   ├── privacy/
│   │   └── model/page.tsx   # Model dashboard view (NEW)
│   │
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
│
├── components/              # Reusable UI Components (Views)
│   ├── ui/                 # shadcn/ui primitives
│   ├── Navbar.tsx
│   ├── ThemeToggle.tsx
│   ├── Footer.tsx
│   └── ...
│
├── lib/                    # Utilities & Shared Code
│   ├── hooks/             # React hooks
│   │   ├── use-media-query.ts
│   │   └── useIsMobile.ts
│   └── utils.ts          # Helper functions
│
└── hooks/                 # Custom hooks (being migrated to lib/hooks)
```

## Architecture Patterns

### Domain Layer (`src/domain/`)
**Responsible for:** Business logic, external integrations, data validation

- **types.ts**: TypeScript interfaces and types
- **schemas.ts**: Zod schemas for runtime validation
- **services.ts**: Functions that handle business logic (API calls, data transforms)
- **index.ts**: Barrel export for clean imports

**Example:**
```typescript
// Import from domain
import { fetchModelProfile, ModelProfile } from '@/domain/model';

// Use in API route or component
const result = await fetchModelProfile(modelId);
```

### Controller Layer (`src/app/api/`)
**Responsible for:** HTTP request handling, validation, routing

- Thin wrappers around domain services
- Validate input and return JSON responses
- Handle authentication/authorization if needed

**Example:**
```typescript
// Route: POST /api/model
export async function POST(request: NextRequest) {
  const { modelId } = await request.json();
  const result = await fetchModelProfile(modelId);
  return NextResponse.json(result);
}
```

### View Layer (`src/app/[routes]/` + `src/components/`)
**Responsible for:** UI rendering, user interaction

- **Pages**: Entry points for routes
- **Components**: Reusable UI blocks
- Call API routes or domain services
- Client components use "use client" directive

**Example:**
```typescript
// Client component
"use client";

export default function ModelPage() {
  const [model, setModel] = useState(null);
  
  const fetchModel = async (id) => {
    const response = await fetch('/api/model', {
      method: 'POST',
      body: JSON.stringify({ modelId: id }),
    });
    const data = await response.json();
    setModel(data.data);
  };
  
  return <div>{/* Render model */}</div>;
}
```

## New Feature: Model Profile Dashboard

### Setup Instructions

#### 1. Google Sheets Integration

You need to create a Google Apps Script web app that serves as the backend for your Google Sheets.

**Steps:**
1. Go to [Google Sheets](https://sheets.google.com)
2. Create or open a spreadsheet with your model data
3. Go to **Extensions → Apps Script**
4. Replace the default code with:

```javascript
// Google Apps Script - Save as Code.gs
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  
  if (action === 'getModel') {
    return getModel(data.modelId);
  } else if (action === 'getAllModels') {
    return getAllModels();
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    error: 'Unknown action'
  })).setMimeType(ContentService.MimeType.JSON);
}

function getModel(modelId) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === modelId) { // Assuming ID is first column
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        model: rowToObject(headers, row)
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    error: 'Model not found'
  })).setMimeType(ContentService.MimeType.JSON);
}

function getAllModels() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const models = [];
  
  for (let i = 1; i < data.length; i++) {
    models.push(rowToObject(headers, data[i]));
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    models: models
  })).setMimeType(ContentService.MimeType.JSON);
}

function rowToObject(headers, row) {
  const obj = {};
  for (let i = 0; i < headers.length; i++) {
    obj[headers[i]] = row[i];
  }
  return obj;
}
```

5. Click **Deploy → New deployment**
6. Choose type: **Web app**
7. Execute as: Your account
8. Who has access: **Anyone**
9. Copy the deployment URL

#### 2. Environment Configuration

Add to your `.env.local`:
```env
GOOGLE_SHEET_APP_SCRIPT_URL=https://script.google.com/macros/d/{YOUR_SCRIPT_ID}/usercurrentappscript
```

#### 3. Google Sheet Format

Your Google Sheet should have columns like:
```
id    | name          | email              | phone       | location  | bio           | profileImage | rating | totalBookings | status  | ...
------|---------------|--------------------|-----------  |-----------|---------------|--------------|--------|---------------|---------|----
001   | John Doe      | john@example.com   | 1234567890  | New York  | Professional  | https://...  | 4.5    | 25            | active  | ...
002   | Jane Smith    | jane@example.com   | 0987654321  | LA        | Creative      | https://...  | 4.8    | 42            | active  | ...
```

### Access the Dashboard

- **Local**: http://localhost:3000/model
- **Production**: https://camstudio.fun/model

### How It Works

1. User visits `/model` page
2. Enters a model ID
3. Frontend calls `POST /api/model` with the ID
4. API route calls `fetchModelProfile()` from domain layer
5. Domain service calls Google Apps Script URL
6. Google Apps Script reads the Google Sheet and returns JSON
7. Profile data is displayed in a beautiful dashboard

## Adding New Features

### Step 1: Create Domain Layer
```bash
mkdir src/domain/{feature-name}
touch src/domain/{feature-name}/{types,schemas,services,index}.ts
```

### Step 2: Implement Services
Write business logic in `src/domain/{feature}/services.ts`

### Step 3: Create API Route
Create `src/app/api/{feature}/route.ts` that calls domain services

### Step 4: Create View
Create `src/app/{feature}/page.tsx` that calls the API route

## Key Files Overview

| File | Purpose |
|------|---------|
| `src/domain/*/types.ts` | TypeScript interfaces |
| `src/domain/*/schemas.ts` | Zod validation |
| `src/domain/*/services.ts` | Business logic |
| `src/app/api/*/route.ts` | HTTP handlers |
| `src/app/*/page.tsx` | Page components |
| `src/components/` | Reusable UI |
| `src/lib/` | Utilities |

## Dependencies

- **Next.js 15.5.9**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type safety
- **Zod**: Schema validation
- **Tailwind CSS**: Styling
- **shadcn/ui**: Component library
- **react-hook-form**: Form handling
- **html-to-image**: Image export

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Run production build
npm run lint     # TypeScript lint
```

## Notes

- All new code should follow this MVC structure
- Keep domain logic separate from UI
- Use TypeScript for type safety
- Validate inputs with Zod schemas
- Write comments for complex logic
