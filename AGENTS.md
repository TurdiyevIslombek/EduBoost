# AGENTS.md

## Commands
- **Build**: `bun run build` (Next.js build)
- **Lint**: `bun run lint` (ESLint)
- **Dev**: `bun run dev:all` (Starts Next.js app and webhook concurrently)
- **DB Migration**: `npx drizzle-kit push` (Pushes schema changes to DB)
- **Tests**: No test framework currently configured. Do not attempt to run tests.

## Architecture
- **Framework**: Next.js 15 (App Router)
- **Database**: Drizzle ORM with Neon (Serverless Postgres) & Upstash Redis
- **API**: tRPC (Routers in `src/modules/*/server/procedures`, aggregated in `src/trpc/routers/_app.ts`)
- **State Management**: React Query (via tRPC)
- **Authentication**: Clerk
- **Styling**: Tailwind CSS + Shadcn UI + Radix UI
- **Structure**: Feature-based modules in `src/modules/` (each contains components, server procedures, types)

## Code Style & Conventions
- **Language**: TypeScript (Strict mode)
- **Imports**: Use `@/` alias for `src/` (e.g., `@/lib/utils`, `@/modules/videos/ui/components/...`)
- **Components**: Functional components, prefer named exports.
- **Validation**: Zod schemas for API inputs and forms (React Hook Form).
- **Naming**: PascalCase for components, camelCase for functions/variables.
- **File Names**: `kebab-case` for files and directories.
- **Async**: Async/await for data fetching and server actions.
- **UI**: Use `lucide-react` for icons. Use `cn()` for class merging.
