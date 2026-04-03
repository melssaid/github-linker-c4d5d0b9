# Architecture

This document describes the high-level architecture of the project, explains how the major layers interact, and provides guidelines for adding new features.

---

## Table of Contents

1. [Tech stack](#tech-stack)
2. [Directory structure](#directory-structure)
3. [Data flow](#data-flow)
4. [Adding a new feature](#adding-a-new-feature)
5. [Services](#services)
6. [Auth & roles](#auth--roles)
7. [Internationalisation](#internationalisation)

---

## Tech stack

| Layer | Technology |
|---|---|
| UI framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Routing | React Router v6 |
| Server state | TanStack Query (React Query) |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Testing | Vitest + Testing Library |
| E2E testing | Playwright |

---

## Directory structure

```
src/
├── assets/              Static assets bundled by Vite (images, fonts)
├── components/
│   ├── ui/              Auto-generated shadcn/ui primitives – do not edit manually
│   ├── common/          Shared presentational components (PageHeader, EmptyState, …)
│   ├── layout/          App-shell components (TopNavbar, BottomTabBar, DashboardLayout, …)
│   ├── analysis/        Analysis & reporting UI
│   ├── assessment/      Behaviour assessment UI
│   ├── attendance/      Attendance tracking UI
│   ├── kg-admin/        Kindergarten-admin-specific widgets
│   ├── students/        Student management UI
│   └── survey/          Survey form UI
├── data/                Static / seed data (e.g. survey questions)
├── features/            Feature-scoped hooks and logic
│   ├── assessments/hooks/
│   ├── dashboard/hooks/
│   └── students/hooks/
├── hooks/               Global React hooks (useAuth, useRole, use-mobile, …)
├── i18n/                Internationalisation provider and translation strings
├── integrations/
│   └── supabase/        Auto-generated Supabase client and TypeScript types
├── lib/                 Low-level utilities and direct DB helpers
│   ├── database.ts      Raw Supabase query helpers
│   ├── attendance.ts    Attendance computation logic
│   ├── utils.ts         cn() class helper
│   └── …
├── pages/               Route-level page components (one file per route)
│   ├── admin/
│   └── kg-admin/
├── services/            High-level service modules (preferred import point)
│   ├── api.service.ts   Generic Fetch wrapper
│   ├── github.service.ts GitHub REST API helpers
│   └── supabase.service.ts Supabase service layer (re-exports lib/database)
├── shared/
│   └── types/domain.ts  Core domain types (Student, Survey, AttendanceRecord, …)
├── types/
│   └── index.ts         Central re-export of domain types
├── utils/
│   └── index.ts         Central re-export of utility helpers
├── App.tsx              Root component: providers + router + error boundary
├── main.tsx             React entry point (StrictMode wrapper)
└── index.css            Global Tailwind CSS entry
```

---

## Data flow

```
User interaction
      │
      ▼
Page / Feature component
      │  calls
      ▼
Feature hook (features/*/hooks) or global hook (hooks/)
      │  uses
      ▼
Service layer (services/*.service.ts)
      │  calls
      ├──► Supabase client  ──► Supabase DB / Auth / Storage
      └──► GitHub API       ──► GitHub REST API v3
```

- **Components** are pure presentational — they receive data via props or hooks and emit events.
- **Feature hooks** (TanStack Query) own the async state: loading, error, and cached data.
- **Services** encapsulate external I/O and can be swapped or mocked independently.

---

## Adding a new feature

### 1. Define domain types

Add or extend types in `src/shared/types/domain.ts` and re-export from `src/types/index.ts`.

### 2. Add DB queries (if needed)

Add helper functions to `src/lib/database.ts` and re-export them from `src/services/supabase.service.ts`.

### 3. Create a feature hook

```ts
// src/features/my-feature/hooks/useMyFeature.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyItems, addMyItem } from "@/services/supabase.service";

export function useMyFeature() {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["my-feature"],
    queryFn: getMyItems,
  });

  const { mutate: add } = useMutation({
    mutationFn: addMyItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-feature"] }),
  });

  return { items, isLoading, add };
}
```

### 4. Build UI components

Place reusable widgets in `src/components/<feature-name>/`. Keep them decoupled from routing.

### 5. Create a page

Add a page component in `src/pages/` that composes the feature hook with the UI components.

### 6. Register the route

Add the route in `src/App.tsx` inside `<AppRoutes>`, wrapped in the appropriate guard (`ProtectedRoute`, `AdminRoute`, or `KgAdminRoute`).

---

## Services

### `api.service.ts`

Thin Fetch wrapper. Use it for any external HTTP endpoint that is not Supabase or GitHub.

```ts
import { get, post } from "@/services/api.service";

const data = await get<MyType>("https://api.example.com/resource");
```

### `github.service.ts`

Typed helpers for the GitHub REST API v3.  Reads `VITE_GITHUB_TOKEN` when available.

```ts
import { githubService } from "@/services/github.service";

const user = await githubService.getUser("octocat");
const repos = await githubService.listRepos("octocat");
```

### `supabase.service.ts`

Re-exports the Supabase client and all `lib/database.ts` helpers.  Prefer importing from here.

```ts
import { supabase, getStudents } from "@/services/supabase.service";
```

---

## Auth & roles

Authentication is handled by Supabase Auth.  The app exposes two context hooks:

- `useAuth()` — returns `{ user, session, loading, signIn, signOut }`.
- `useRole()` — returns `{ isAdmin, isKgAdmin, isTeacher, loading }`.

Route guards in `App.tsx` (`ProtectedRoute`, `AdminRoute`, `KgAdminRoute`) enforce access at the router level.

---

## Internationalisation

The app supports Arabic (default) via the `I18nProvider` in `src/i18n/index.tsx`. Add new translation keys there. The `dir="rtl"` attribute is set on the root HTML element.
