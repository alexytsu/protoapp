# UI Project

## Common Commands

### Development

```bash
# Start development server
pnpm dev

# Build production version
pnpm build

# Run linting
pnpm lint

# Run formatting
pnpm format
```

### UI Component Management

```bash
# Add a new shadcn component
pnpm dlx shadcn@latest add [component-name]
```

## Project Structure

- `/src/components/ui/` - Shadcn UI components
- `/src/hooks/` - React hooks
- `/src/pages/` - Page components
- `/src/lib/` - Utility functions and shared code
- `/src/service/` - API service layer
- `/src/adl-gen/` - ADL generated code

## Code Style

- Uses typescript
- ADL generated code encourages use of algebraic-data-types throughout the
  system
- Uses react-hook-form + zod for form validation
- Uses shadcn/ui for UI components
- Uses react-router for navigation
- Components are functional components with hooks
