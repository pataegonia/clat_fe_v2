# CLAT-FE onboarding guide

> **Student management and SMS/Alimtalk automation for visiting instructors** — frontend repository reference.

*Repo canonical copy in English for reliable UTF-8. Last content review: 2026-04-07.*

---

## Table of contents

1. [Overview](#1-overview)
2. [Stack and dependencies](#2-stack-and-dependencies)
3. [Folder structure](#3-folder-structure)
4. [Naming conventions](#4-naming-conventions)
5. [Vanilla Extract tokens and theme](#5-vanilla-extract-tokens-and-theme)
6. [Zustand stores](#6-zustand-stores)
7. [Domain types](#7-domain-types)
8. [Implemented routes and components](#8-implemented-routes-and-components)
9. [API endpoints](#9-api-endpoints)
10. [Architecture patterns](#10-architecture-patterns)
11. [Local development](#11-local-development)

---

## 1. Overview

CLAT-FE lets instructors manage students and send lesson results via automated messages.

| Domain | Description |
|--------|-------------|
| **Management** | Class CRUD, student CRUD, Excel bulk upload |
| **Lesson** | Weekly calendar, lesson entry (shared + per-student), progress |
| **Template** | SMS/Alimtalk template builder, shared vs individual fields, preview |

---

## 2. Stack and dependencies

### Framework / runtime

| Package | Version | Role |
|---------|---------|------|
| `next` | 16.1.6 | App Router |
| `react` | 19.2.3 | UI |
| `typescript` | ^5 | Types |

### Styling

| Package | Version | Role |
|---------|---------|------|
| `@vanilla-extract/css` | ^1.18.0 | Type-safe CSS-in-JS |
| `@vanilla-extract/recipes` | ^0.5.7 | Variants |
| `@vanilla-extract/next-plugin` | ^2.4.17 | Next integration |

### State / data

| Package | Version | Role |
|---------|---------|------|
| `zustand` | ^5.0.11 | Global: user, toasts |
| `@tanstack/react-query` | ^5.90.21 | Installed; optional / new features |
| `axios` | ^1.13.6 | HTTP (via `axiosInstance` only) |

### UI / utilities

| Package | Role |
|---------|------|
| `@dnd-kit/core`, `@dnd-kit/sortable` | Drag-and-drop (template item order) |
| `date-fns` | Dates (Korean locale) |
| `zod` | Validation |
| `xlsx` | Excel export |
| `cookies-next` | Cookie-based token handling |
| `@svgr/webpack` | SVG as React components |

---

## 3. Folder structure

```
CLAT-FE/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # / → /home redirect
│   │   ├── globals.css
│   │   ├── (auth)/login|signup/
│   │   ├── (main)/                  # Sidebar + ToastContainer
│   │   │   ├── home/
│   │   │   ├── lesson/              # list, new, [id]
│   │   │   ├── management/          # list, [id]
│   │   │   ├── template/            # list, new, [id], edit
│   │   │   ├── alimtalk/            # settings, history
│   │   │   ├── ai/                  # settings (+ hub backlog)
│   │   │   ├── students/[id]/
│   │   │   └── me/
│   │   ├── check/[sessionId]/       # public attendance
│   │   └── parent/[token]/          # public parent dashboard
│   ├── components/common/
│   ├── hooks/
│   ├── services/                    # domain HTTP (see services/README.md)
│   ├── stores/
│   ├── styles/ + styles/tokens/
│   ├── lib/                         # axiosInstance, message helpers, excel
│   ├── types/
│   ├── mocks/
│   ├── assets/
│   └── proxy.ts                     # Auth routing middleware
├── docs/
│   ├── onboarding-guide.md
│   ├── claude-code-guide.md
│   └── architecture-layers.md
├── public/
├── .env.example
├── next.config.ts
└── package.json
```

---

## 4. Naming conventions

### Files

| Kind | Convention | Example |
|------|------------|---------|
| Page | `page.tsx` | `lesson/[id]/page.tsx` |
| Component | PascalCase `.tsx` | `LessonCard.tsx` |
| Component styles | same + `.css.ts` | `LessonCard.css.ts` |
| Page styles | `[route].css.ts` | `lesson.css.ts` |
| Hook | camelCase, `use*` | `useLessonDetail.ts` |
| Store | `*Store.ts` | `userStore.ts` |
| Service | domain | `class.ts`, `auth.ts` |
| Types | domain `.ts` | `student.ts` |

### Folders

| Kind | Convention | Example |
|------|------------|---------|
| Route-only components | PascalCase folder | `LessonCard/` |
| Route-local assets | `_` prefix | `_components/`, `_types/` |
| Route groups | `(name)` | `(auth)/`, `(main)/` |

### Component folder layout

```
Button/
├── Button.tsx
├── Button.css.ts
└── index.ts
```

---

## 5. Vanilla Extract tokens and theme

- **`src/styles/theme.css.ts`**: `createGlobalTheme(':root', { ... })` — e.g. `color.primary[500]`.
- **`src/styles/tokens/`**: `colors.ts`, `typography.ts`, `grid.ts`, `card.ts`.
- **Recipes:** `recipe({ base, variants })` for Button-style variant APIs.

---

## 6. Zustand stores

### `userStore.ts`

```typescript
interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
}
```

### `toastStore.ts`

```typescript
type ToastVariant = 'success' | 'warning' | 'error';

interface Toast {
  id: string;
  variant: ToastVariant;
  message: string;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}
```

Prefer `useToast()` for UX.

---

## 7. Domain types

### `src/types/student.ts`

```typescript
interface Student {
  id: number;
  name: string;
  phone: string;
  parent_phone?: string;
  school?: string;
  grade?: string;
  memo?: string;
}

interface StudentDetail extends Student {
  classes: StudentClass[];
  stats: StudentStats;
}

interface StudentStats {
  total_lessons: number;
  attendance_rate: number;
  incomplete_items: IncompleteItem[];
}

interface IncompleteItem {
  item_id: number;
  item_name: string;
  lesson_date: string;
}
```

### `src/types/lessonStudent.ts`

```typescript
type Attendance = 'present' | 'absent' | 'late' | 'leave_early';

interface LessonStudent {
  id: number;
  student_id: number;
  student_name: string;
  attendance: Attendance;
  items: LessonStudentItem[];
}

interface LessonStudentItem {
  id: number;
  template_item_id: number;
  item_name: string;
  item_type: ItemType;
  value: string | number | boolean | null;
}
```

### `src/app/(main)/template/_types/template.ts`

```typescript
type ItemType = 'TEXT' | 'NUMBER' | 'SELECT' | 'COMPLETE' | 'ATTENDANCE';
type ItemCategory = 'common' | 'individual';

interface TemplateItem {
  id: string;
  api_id?: number;
  category: ItemCategory;
  type: ItemType;
  name: string;
  options?: string[];
  include_in_message: boolean;
  order: number;
}
```

DTOs are often colocated inline in `services/*.ts`.

---

## 8. Implemented routes and components

### Routes

| Path | File | Description |
|------|------|-------------|
| `/` | `app/page.tsx` | redirect → `/home` |
| `/login` | `(auth)/login/page.tsx` | Login |
| `/home` | `(main)/home/page.tsx` | Dashboard |
| `/lesson` | `(main)/lesson/page.tsx` | Weekly calendar |
| `/lesson/new` | `(main)/lesson/new/page.tsx` | Create lesson |
| `/lesson/[id]` | `(main)/lesson/[id]/page.tsx` | Lesson detail / entry |
| `/management` | `(main)/management/page.tsx` | Class list |
| `/management/[id]` | `(main)/management/[id]/page.tsx` | Class detail |
| `/template` | `(main)/template/page.tsx` | Template list |
| `/template/new` | `(main)/template/new/page.tsx` | Create template |
| `/template/[id]` | `(main)/template/[id]/page.tsx` | View template |
| `/template/[id]/edit` | `(main)/template/[id]/edit/page.tsx` | Edit template |

### Shared UI (`components/common/`)

Button, Text, Modal, Input, Textarea, Dropdown, Toggle, Chip, ConfirmModal, AddCard, Toast / ToastContainer, Sidebar, UserInitializer, `styles/listItem.css.ts`.

### Route-local (high level)

- **lesson:** `DateCard`, `LessonCard`, `AddLessonModal`, `TemplateSelectModal`; detail: `CommonContent`, `LessonTableSection`, `MessagePreview`, `ProgressBar`.
- **management:** `ClassCard`, `ClassFormModal`, `StudentTable`, `AddStudentFormModal`, `BulkUploadModal`, `StudentDetailModal`; class detail: `ClassInfoTable`, `AddStudentModal`, `DangerSection`.
- **template:** `TemplateCard`, `TemplateName`, `AddItemForm`, `ContentSection`, `MessageSettings`, `MessagePreview`, `DeleteConfirmModal`.

### Hooks

`useDisclosure`, `useToast`, `useToggleArray`, `useLessonDetail`, `useTemplateEditor`.

---

## 9. API endpoints

### Axios (`src/lib/api/axiosInstance.ts`)

- Base: `${NEXT_PUBLIC_API_URL}/api/v1`
- Timeout: 10s
- Request: Bearer from storage/cookies per app setup
- Response: 401 → refresh + retry with queue

### Auth (`services/auth.ts`)

| Function | Method | Path |
|----------|--------|------|
| `login` | POST | `/auth/login` |
| `logout` | POST | `/auth/logout` |
| `refresh` | POST | `/auth/refresh` |
| `me` | GET | `/auth/me` |

### Classes (`services/class.ts`)

| Function | Method | Path |
|----------|--------|------|
| `getClasses` | GET | `/classes` |
| `getClass` | GET | `/classes/:id` |
| `createClass` | POST | `/classes` |
| `updateClass` | PATCH | `/classes/:id` |
| `deleteClass` | DELETE | `/classes/:id` |
| `endClass` | POST | `/classes/:id/end` |
| `getClassStudents` | GET | `/classes/:id/students` |
| `addStudents` | POST | `/classes/:id/students` |
| `removeStudent` | DELETE | `/classes/:id/students/:sid` |

### Lessons (`services/lesson.ts`)

| Function | Method | Path |
|----------|--------|------|
| `getLessons` | GET | `/lessons` |
| `getLesson` | GET | `/lessons/:id` |
| `createLesson` | POST | `/lessons` |
| `updateLesson` | PATCH | `/lessons/:id` |
| `saveLesson` | POST | `/lessons/:id/save` |
| `previewLesson` | GET | `/lessons/:id/preview` |

### Students (`services/student.ts`)

| Function | Method | Path |
|----------|--------|------|
| `getStudents` | GET | `/students` |
| `getStudent` | GET | `/students/:id` |
| `createStudent` | POST | `/students` |
| `updateStudent` | PATCH | `/students/:id` |
| `deleteStudent` | DELETE | `/students/:id` |
| `completeItem` | POST | `/items/:id/complete` |
| `bulkCreateStudents` | POST | `/students/bulk` |

### Templates (`services/template.ts`)

| Function | Method | Path |
|----------|--------|------|
| `getTemplates` | GET | `/templates` |
| `getTemplate` | GET | `/templates/:id` |
| `createTemplate` | POST | `/templates` |
| `updateTemplate` | PATCH | `/templates/:id` |
| `deleteTemplate` | DELETE | `/templates/:id` |
| `toEditorItems` | — | helper |

---

## 10. Architecture patterns

### Auth flow

```
middleware (proxy.ts)
  → accessToken cookie present?
      no → /login
      yes → continue

login  → tokens in cookie + storage (per implementation)
  → user in Zustand

401 (axios)
  → refresh (single-flight queue)
  → retry original request
```

### Data flow

```
Page → hook (useLessonDetail / useTemplateEditor) → services/* → axiosInstance → API
```

- Global: Zustand (user, toast)
- Server state: mostly local state + services (React Query optional)

### Styling

- Components: `recipe()` / `style()` classes from `.css.ts`
- Pages: `import * as styles from './page.css.ts'`

### Modals / toasts

- `useDisclosure` + shared `Modal`
- `useToast()` for feedback

---

## 11. Local development

### Requirements

- Node.js 18+
- pnpm

### Setup

```bash
pnpm install
cp .env.example .env.local
# set NEXT_PUBLIC_API_URL in .env.local
pnpm dev
```

### Env

```bash
NEXT_PUBLIC_API_URL=https://api.example.com
```

### Path alias

`@/*` → `./src/*`

### SVG

```typescript
import ArrowIcon from '@/assets/icons/arrow-right.svg';
<ArrowIcon width={20} height={20} />
```

---

*Derived from codebase snapshot, 2026-04-07.*
