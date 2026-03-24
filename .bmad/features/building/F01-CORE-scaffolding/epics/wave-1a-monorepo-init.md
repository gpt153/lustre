# Epic: Monorepo Init | Wave-1a

**Wave:** 1
**Model:** haiku
**Dependencies:** None

## Description

Initialize the Lustre monorepo using Turborepo with pnpm workspaces. Set up the root-level configuration files: turbo.json, pnpm-workspace.yaml, root tsconfig.json with path aliases, root .eslintrc.js, root .prettierrc, and root package.json with workspace scripts. Create the directory structure for apps/ (mobile, web) and packages/ (app, ui, api) with placeholder package.json files. Configure TypeScript strict mode, module resolution, and base compiler options that all packages inherit.

## File paths
1. package.json
2. pnpm-workspace.yaml
3. turbo.json
4. tsconfig.json
5. .eslintrc.js
6. .prettierrc
7. .gitignore

## Implementation steps
1. Run `pnpm init` at repo root, set name to `@lustre/root`, private: true
2. Create `pnpm-workspace.yaml` with packages: `["apps/*", "packages/*", "services/*"]`
3. Create `turbo.json` with pipeline: build, dev, lint, typecheck, test. Configure caching for build outputs
4. Create root `tsconfig.json` with strict: true, target: ES2022, moduleResolution: bundler, paths aliases for @lustre/ui, @lustre/api, @lustre/app
5. Create `.eslintrc.js` extending @typescript-eslint/recommended, prettier
6. Create `.prettierrc` with singleQuote: true, semi: false, trailingComma: all, tabWidth: 2
7. Create `.gitignore` with node_modules, .turbo, dist, .expo, .next, *.tsbuildinfo
8. Create stub `package.json` in each workspace directory (apps/mobile, apps/web, packages/app, packages/ui, packages/api)
9. Install root dev dependencies: turbo, typescript, eslint, prettier, @typescript-eslint/eslint-plugin
10. Run `pnpm install` and verify workspace resolution

## Acceptance Criteria
1. `pnpm install` from clean clone resolves all workspaces without error
2. `pnpm turbo build` recognizes all workspace packages
3. Root tsconfig paths resolve @lustre/* imports
4. ESLint and Prettier configs are applied across all packages
5. .gitignore excludes all generated artifacts
