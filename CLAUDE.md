# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm run build` - Build the library (clean, compile with tsup, fix CJS exports)
- `npm run watch` - Build in watch mode for development
- `npm run clean` - Remove dist directory

### Testing
- `npm test` - Run tests (coverage in CI, watch locally)
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:watch` - Run tests in watch mode
- `npm run e2e` - Run end-to-end tests with Playwright
- `npm run e2e:debug` - Debug e2e tests in Chromium
- `npm run e2e:ui` - Run e2e tests with Playwright UI

### Code Quality
- `npm run lint` - Lint and fix TypeScript/React code with ESLint
- `npm run typecheck` - Type check using TypeScript compiler
- `npm run typevalidation` - Validate TypeScript types with @arethetypeswrong/cli
- `npm run format` - Format code with Prettier
- `npm run validate` - Run all checks (lint, typecheck, test, e2e, build, size, typevalidation)

### Other
- `npm run size` - Check bundle size limits with size-limit

## Architecture Overview

### Core Components
- **Main Component (`src/components/index.tsx`)**: The primary `Joyride` class component that orchestrates tours
- **Store System (`src/modules/store.ts`)**: Centralized state management using a custom store with Map-based storage
- **Step Management (`src/modules/step.ts`)**: Utilities for validating and merging step configurations
- **DOM Utilities (`src/modules/dom.ts`)**: Cross-browser DOM manipulation and scroll handling

### Component Structure
- `src/components/`: React components (Beacon, Overlay, Portal, Spotlight, Step, Tooltip)
- `src/modules/`: Core business logic modules (store, helpers, step validation, DOM utilities)
- `src/types/`: TypeScript type definitions split into common and component types
- `src/literals/`: Constants for actions, events, lifecycle states, and status values

### Key Architectural Patterns

#### State Management
- Custom store class with Map-based internal storage
- Listener pattern for state synchronization with React components
- Controlled vs uncontrolled modes for step navigation
- Immutable state updates with validation

#### Component Lifecycle
- Tour states: IDLE → READY → RUNNING → FINISHED/SKIPPED/PAUSED
- Step lifecycle: INIT → BEACON → TOOLTIP → COMPLETE
- Event-driven architecture with callback system

#### Positioning & Layout
- Uses `react-floater` library for tooltip positioning
- Custom scroll handling with support for custom scroll parents
- Spotlight and overlay system for highlighting target elements
- Responsive positioning with collision detection

### Testing Structure
- **Unit Tests**: `test/modules/` - Core logic testing (store, helpers, scope)
- **Integration Tests**: `test/tours/` - Full tour functionality testing
- **E2E Tests**: `e2e/` - Browser automation with Playwright
- **Fixtures**: `test/__fixtures__/` - Shared test components and utilities

### Build System
- **tsup**: Modern TypeScript build tool for dual format output (CJS/ESM)
- **Post-build script**: `scripts/fix-cjs.ts` for CommonJS compatibility
- **Dual exports**: Supports both `import` and `require` patterns
- **Type declarations**: Generated `.d.ts` files for TypeScript consumers

## Development Notes

### File Organization
- Path aliases configured: `~/*` maps to `src/*`
- Types are centralized in `src/types/` with clear separation
- Modules follow single responsibility principle
- Components are self-contained with co-located styles when needed

### Key Dependencies
- `react-floater`: Tooltip positioning engine
- `deep-diff`, `deepmerge`: Object comparison and merging
- `scroll`, `scrollparent`: Cross-browser scrolling utilities
- `tree-changes`: Efficient object change detection

### Testing Configuration
- **Vitest** for unit/integration tests with 90%+ coverage requirements
- **Playwright** for component testing and e2e scenarios
- **@testing-library/react** for component testing utilities
- JSDOM environment for DOM testing

## Development Practices
- Use pnpm instead of npm when possible