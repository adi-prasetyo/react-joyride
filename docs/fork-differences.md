# Fork Differences

This document outlines the differences between this fork ([adi-prasetyo/react-joyride](https://github.com/adi-prasetyo/react-joyride)) and the original [gilbarbara/react-joyride](https://github.com/gilbarbara/react-joyride).

## 🎯 Purpose of This Fork

This fork was created to provide continued maintenance and modern dependency support for react-joyride, with a focus on:
- React 19 compatibility
- Security vulnerability fixes
- Modern tooling updates
- Maintained backward compatibility

## 📊 Version Comparison

| Aspect | Original (v2.9.3) | This Fork (v2.9.3-adp.1) |
|--------|-------------------|---------------------------|
| **React Support** | 15 - 18 | 15 - 19 ✅ |
| **Security Issues** | 26 vulnerabilities (2 critical) | 21 vulnerabilities (0 critical) ✅ |
| **Build System** | npm scripts | pnpm scripts ✅ |
| **Testing** | Vitest 2.1.5 | Vitest 3.2.4 ✅ |
| **TypeScript** | 5.6.3 | 5.9.2 ✅ |
| **react-floater** | 0.7.9 | 0.9.4 ✅ |

## 🔄 Dependency Updates

### Major Version Bumps
- **React ecosystem**: 18.x → 19.x
- **Vitest**: 2.1.5 → 3.2.4 (critical security fix)
- **react-floater**: 0.7.9 → 0.9.4
- **cross-env**: 7.0.3 → 10.0.0
- **jest-extended**: 4.0.2 → 6.0.0

### Security Fixes
- ✅ **Critical**: Fixed Vitest RCE vulnerability (GHSA-9crc-q9x8-hgqq)
- ✅ **Critical**: Fixed form-data vulnerability 
- ✅ **High**: Updated multiple packages with security issues

### Development Tools
- Updated all ESLint, Prettier, TypeScript configs
- Modernized build tooling (tsup, playwright)
- Updated testing infrastructure

## 🛠️ Internal Changes

### React 19 Compatibility
- Removed deprecated `ReactDOM.unmountComponentAtNode`
- Removed deprecated `ReactDOM.unstable_renderSubtreeIntoContainer`
- Updated Portal component to use modern `createPortal` only
- Fixed `useRef` calls to provide initial values (React 19 requirement)
- Updated TypeScript types for stricter React 19 typing

### react-floater Migration
- Migrated from deprecated `RenderProps` export to local interface
- Updated `options.preventOverflow` → `modifiers.preventOverflow.options`
- Fixed popper instance usage for @popperjs/core v2 structure
- Updated boundary configuration for new API

### Build System
- Changed from npm to pnpm in all scripts
- Fixed husky hooks for pnpm compatibility
- Updated package.json exports for better compatibility
- Committed dist folder for GitHub installs

## 📦 Installation

### Using This Fork
```bash
# Latest maintained version
npm install github:adi-prasetyo/react-joyride#adp-maintained

# Specific tagged version
npm install github:adi-prasetyo/react-joyride#v2.9.3-adp.1

# Using pnpm
pnpm add github:adi-prasetyo/react-joyride#adp-maintained
```

### Using Original
```bash
npm install react-joyride
```

## 🔄 Migration Guide

### From Original to This Fork

**No code changes required!** The API is 100% backward compatible.

1. **Update package.json:**
```json
{
  "dependencies": {
    "react-joyride": "github:adi-prasetyo/react-joyride#adp-maintained"
  }
}
```

2. **Install:**
```bash
npm install --force
```

3. **Verify:** Your existing code should work without modifications.

### From This Fork Back to Original

Simply revert the package.json change:
```json
{
  "dependencies": {
    "react-joyride": "^2.9.3"
  }
}
```

## 🧪 Testing Status

| Test Suite | Original | This Fork |
|------------|----------|-----------|
| **Unit Tests** | ✅ Pass | ✅ Pass (89/89) |
| **TypeScript** | ✅ Pass | ✅ Pass (0 errors) |
| **Build** | ✅ Pass | ✅ Pass |
| **Integration Tests** | ✅ Pass | ⚠️ Snapshots updated* |

*Integration test snapshots were updated due to DOM structure changes from react-floater upgrade. Functionality is preserved.

## 🚀 Future Maintenance

This fork will be maintained to:
- Keep dependencies up to date
- Fix security vulnerabilities
- Maintain React compatibility
- Preserve backward compatibility

For feature requests or bugs, please open issues in the [fork repository](https://github.com/adi-prasetyo/react-joyride/issues).

## 📝 Changelog

### v2.9.3-adp.1 (2025-08-01)
- ✅ Add React 19 support
- ✅ Fix critical Vitest security vulnerability
- ✅ Update react-floater to v0.9.4
- ✅ Modernize all development dependencies
- ✅ Switch to pnpm for package management
- ✅ Add comprehensive CLAUDE.md for future development
- ✅ Update documentation with fork information

### v2.9.3 (Original)
- Base version from original repository