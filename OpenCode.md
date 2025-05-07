# OpenCode Guidelines

## Project Outline

- At the root of the repo are directories that separate the codebase by language
  - `deno` contains utility scripts for development
  - `adl` contains Algebraic Data Language schemas used to define data
    structures across the codebase
  - `rust` contains the backend webserver code
  - `ts` contains TypeScript code for various frontend apps

## Code Style Guidelines

### ADL

- ADL is a DSL for modelling algebraic data types in this codebase
- Do not change ADL files without human direction or intervention. All data
  modelling decisions should be driven by a human
- ADL definitions annotated with DbTable in `adl/protoapp/db.adl` generate SQL
  that creates relevant tables in PostgreSQL
- Rust bindings use generated SeaQuery code to access these tables in a
  type-safe manner
- ADL definitions in `adl/protoapp/apis/ui.adl` define code that is used in the
  API layer
- Manual entries must be made to `ts/ui/src/service/index.ts` when new endpoints
  are added
- Manual entires must be made to `rust/server/src/server/routing.rs` when new
  endpoints are added

### TypeScript

- Use TypeScript for type safety
- Use descriptive variable/function names in camelCase
- Components use PascalCase
- Filenames use kebab-case
- Prefer using shadcn for components when not already available
- For UI code, split a visual page into a Page.tsx component and a PageView.tsx
  component. The PageView should have all state passed in via props and should
  have a corresponding storybook. State (apart from simple UI state) and API
  requests etc. should be handled at the Page.tsx level.

### Rust

- Follow Rust standard formatting (rustfmt)
- Use clippy for linting with no warnings
- Use thiserror for error handling
- Use descriptive variable/function names in snake_case
- Prefer Result/Option for error handling

## Build/Test/Lint Commands

### TypeScript

- Build: `cd ts && pnpm run -r build`
- Lint: `cd ts/ui && pnpm run -r check`
- Format: `cd ts && pnpm run -r format:write`
- Storybook: `cd ts/ui && pnpm run storybook`
- Dev: `cd ts/ui && pnpm run dev`
- Workbench: `cd ts/api-workbench && pnpm run dev`
- Add component: `cd ts/ui && pnpm dlx shadcn@latest add <component_name>`

### Rust

- Build: `cd rust && make build`
- Check: `cd rust && make check`
- Test all: `cd rust && make test`
- Test single: `cd rust && cargo test <test_name> -- --nocapture`
- Dev server: `cd rust && make dev-server`
- Dev processor: `cd rust && make dev-processor`

### ADL

- First source the tools into the path by running `. deno/local-setup.sh`
- Generate code from ADL definitions: `deno task genadl`
