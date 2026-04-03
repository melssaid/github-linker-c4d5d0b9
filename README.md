# GitHub Linker – Kindergarten Management Platform

A full-featured kindergarten management web application built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Supabase**.

---

## ✨ Features

- 👩‍🏫 Teacher & administrator dashboards
- 🧒 Student management (profiles, photos, enrollment)
- 📋 Daily attendance tracking
- 📊 Behavior analysis & assessment tools
- 💬 Bulk WhatsApp messaging to parents
- 📄 PDF report generation
- 🌐 Arabic / bilingual UI support
- 🔐 Role-based access control (admin, kg-admin, teacher)

---

## 📋 Requirements

- [Node.js](https://nodejs.org/) ≥ 18
- [npm](https://www.npmjs.com/) ≥ 9 (or [Bun](https://bun.sh/) ≥ 1)
- A [Supabase](https://supabase.com/) project (for database & auth)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/melssaid/github-linker-c4d5d0b9.git
cd github-linker-c4d5d0b9
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start the development server

```bash
npm run dev
```

The app will be available at [http://localhost:8080](http://localhost:8080).

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |

---

## 🗂️ Project Structure

```
github-linker/
├── public/               # Static assets
├── src/
│   ├── assets/           # Images and media
│   ├── components/
│   │   ├── analysis/     # Analysis view components
│   │   ├── assessment/   # Behavior assessment components
│   │   ├── attendance/   # Attendance table & stats
│   │   ├── common/       # Shared UI helpers (EmptyState, PageHeader)
│   │   ├── kg-admin/     # Kindergarten admin charts & insights
│   │   ├── layout/       # DashboardLayout, TopNavbar, BottomTabBar
│   │   ├── students/     # Student manager, photos, profile view
│   │   ├── survey/       # Survey form
│   │   └── ui/           # shadcn/ui primitive components
│   ├── data/             # Static data (survey questions)
│   ├── features/         # Feature-scoped hooks
│   │   ├── assessments/
│   │   ├── dashboard/
│   │   └── students/
│   ├── hooks/            # Shared React hooks
│   ├── i18n/             # Internationalisation
│   ├── integrations/     # Supabase client & generated types
│   ├── lib/              # Utility functions (attendance, PDF, storage…)
│   ├── pages/            # Route-level page components
│   │   ├── admin/        # System administrator pages
│   │   └── kg-admin/     # Kindergarten administrator pages
│   ├── shared/types/     # Shared TypeScript domain types
│   ├── test/             # Test setup & example tests
│   ├── App.tsx
│   └── main.tsx
├── supabase/             # Supabase config & edge functions
├── .github/workflows/    # CI/CD pipelines
├── .editorconfig
├── .prettierrc
├── CONTRIBUTING.md
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

---

## 📄 License

This project is private and proprietary.
