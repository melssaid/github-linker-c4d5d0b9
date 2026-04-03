# Contributing to GitHub Linker

Thank you for your interest in contributing! Please follow the guidelines below to keep the codebase healthy and consistent.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Coding Standards](#coding-standards)
4. [Commit Messages](#commit-messages)
5. [Pull Requests](#pull-requests)
6. [Reporting Issues](#reporting-issues)

---

## Getting Started

1. Fork the repository and clone your fork:
   ```bash
   git clone https://github.com/<your-username>/github-linker-c4d5d0b9.git
   cd github-linker-c4d5d0b9
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example environment file and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

---

## Development Workflow

1. Create a new branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. Make your changes and commit often with clear messages.

3. Ensure all checks pass before opening a PR:
   ```bash
   npm run lint
   npm test
   npm run build
   ```

4. Push your branch and open a Pull Request against `main`.

---

## Coding Standards

- **Language**: TypeScript — all new files must be `.ts` / `.tsx`.
- **Formatting**: Prettier with the settings in `.prettierrc`. Run `npx prettier --write .` before committing.
- **Linting**: ESLint rules defined in `eslint.config.js`. Run `npm run lint` to check.
- **Components**: Use functional components with React hooks.
- **Styling**: Tailwind CSS utility classes. Avoid inline styles.
- **UI Primitives**: Prefer `shadcn/ui` components in `src/components/ui/` over custom implementations.

---

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**
```
feat(students): add bulk photo upload
fix(attendance): correct timezone handling for daily records
docs: update README with project structure
```

---

## Pull Requests

- Keep PRs focused and small — one feature or fix per PR.
- Write a clear title and description explaining the **what** and **why**.
- Link any related issues with `Closes #<issue-number>`.
- Ensure CI checks pass before requesting a review.
- Respond promptly to review comments.

---

## Reporting Issues

Please open a [GitHub Issue](../../issues) and include:

- A clear, descriptive title
- Steps to reproduce the problem
- Expected vs. actual behaviour
- Screenshots or error logs if applicable
- Environment details (OS, browser, Node.js version)
