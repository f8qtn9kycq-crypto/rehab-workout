# Rehab Workout 2.0

Rehab Workout 2.0 is a React + Vite rehabilitation workout app built with TypeScript and Tailwind CSS.

The current app includes exercise browsing, safety checks, session tracking, training logs, education content, and Traditional Chinese / English locale files.

## Requirements

- Node.js
- npm

## Quick Start

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Scripts

- `npm run dev` starts Vite on `127.0.0.1`.
- `npm run build` runs TypeScript checks, then creates the production build.
- `npm run preview` serves the production build locally.

## Project Structure

- `src/components` reusable UI components.
- `src/pages` route-level screens.
- `src/data` exercise, education, equipment, and safety content.
- `src/hooks` reusable React hooks.
- `src/services` app services such as logs and i18n helpers.
- `src/types` shared TypeScript models.
- `src/utils` reusable utility functions.
- `src/locales` Traditional Chinese and English locale data.
- `reference MVP` source/reference material used during early app shaping.

## Current Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- lucide-react icons

## AI-Assisted Implementation Notes

- Keep product behavior unchanged for repo audit tasks.
- Keep future implementation branches focused, for example safety routing, exercise data model, mobile navigation, or session logging.
- Prefer typed data and shared models over repeated string literals in UI components.
- Keep business rules and reusable logic outside large UI components where practical.
- Run `npm install` and `npm run build` before opening a pull request.

## Pull Request Checklist

- Confirm the branch name matches the task.
- Review changed files before committing.
- Avoid mixing unrelated product changes into audit/setup PRs.
- Include the build result in the PR description.
