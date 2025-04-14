# UI (React App)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Libraries

- Protoapp UI uses [shadcn](https://ui.shadcn.com/docs) to build its component library

## Development

The following commands are run in the `ts/ui` subdirectory which appropriate paths set by `. deno/local-setup.sh`.

```bash
# Starting the Vite dev server (will be available at http://localhost:5173)
pnpm run dev
```

```bash
# Adding a new component from shadcn
pnpm dlx shadcn@latest add button
```

## Building for Production

```bash
npm run build
```
