# Tutorial Styling Guide

This guide provides comprehensive styling solutions for react-joyride tutorials, including button positioning fixes, complete style references, and practical examples.

## Table of Contents

- [Quick Style Reference](#quick-style-reference)
- [Button Positioning Solutions](#button-positioning-solutions)
- [Complete Styles Object](#complete-styles-object)
- [Common Styling Patterns](#common-styling-patterns)
- [Theme Examples](#theme-examples)
- [Responsive Design](#responsive-design)
- [Animation Effects](#animation-effects)

## Quick Style Reference

### Essential Style Properties

```typescript
const essentialStyles: Partial<Styles> = {
  options: {
    primaryColor: '#3b82f6',      // Primary button & beacon color
    backgroundColor: '#ffffff',    // Tooltip background
    textColor: '#1f2937',         // Text color
    overlayColor: 'rgba(0, 0, 0, 0.5)', // Overlay background
    arrowColor: '#ffffff',        // Tooltip arrow color
    width: 400,                   // Tooltip width (optional)
    zIndex: 1000,                 // z-index for all elements
  },
};
```

## Button Positioning Solutions

### Center-Aligned Buttons (Fix for Bottom-Right Issue)

The most common issue is buttons appearing in the bottom-right instead of center. Here's the fix:

```typescript
const centerButtonStyles: Partial<Styles> = {
  tooltipFooter: {
    display: 'flex',
    justifyContent: 'center',    // Center buttons horizontally
    alignItems: 'center',
    marginTop: '20px',
    paddingTop: '16px',
    paddingBottom: '8px',         // Add bottom padding
    borderTop: '1px solid #e5e7eb',
  },
  tooltipFooterSpacer: {
    display: 'none',              // Hide the spacer that pushes buttons apart
  },
};
```

### Why Buttons Appear in Bottom-Right

Joyride creates invisible containers for all buttons (back, skip, next) even when some are hidden. This creates a flex spacer that pushes visible buttons to the right. The `tooltipFooterSpacer` style fixes this.

## Complete Styles Object

Here's a comprehensive styles configuration with all available properties:

```typescript
const completeStyles: Partial<Styles> = {
  // Global options
  options: {
    arrowColor: '#ffffff',
    backgroundColor: '#ffffff',
    beaconSize: 36,
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    primaryColor: '#3b82f6',
    spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
    textColor: '#1f2937',
    width: 380,
    zIndex: 10000,
  },

  // Beacon styles
  beacon: {
    position: 'absolute',
    zIndex: 1100,
  },
  beaconInner: {
    backgroundColor: '#3b82f6',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
  },
  beaconOuter: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    animation: 'pulse 2s ease-in-out infinite',
  },

  // Tooltip container
  tooltip: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
    color: '#1f2937',
    fontSize: '16px',
    padding: 0,
    maxWidth: '500px',
    minWidth: '300px',
  },
  tooltipContainer: {
    padding: '24px',
    textAlign: 'left',
  },
  tooltipContent: {
    padding: 0,
    lineHeight: '1.6',
  },
  tooltipTitle: {
    color: '#111827',
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '16px',
    letterSpacing: '-0.025em',
  },

  // Footer with buttons
  tooltipFooter: {
    display: 'flex',
    justifyContent: 'center',     // or 'space-between' for multi-button
    alignItems: 'center',
    marginTop: '24px',
    paddingTop: '20px',
    paddingBottom: '12px',
    borderTop: '1px solid #e5e7eb',
  },
  tooltipFooterSpacer: {
    display: 'none',              // Critical for center alignment
  },

  // Button styles
  buttonNext: {
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '6px',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    padding: '12px 28px',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '4px',
    '&:hover': {
      backgroundColor: '#2563eb',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
    },
  },
  buttonBack: {
    backgroundColor: '#f3f4f6',
    border: 'none',
    borderRadius: '6px',
    color: '#4b5563',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    padding: '12px 28px',
    marginRight: '12px',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#e5e7eb',
    },
  },
  buttonSkip: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '400',
    padding: '8px',
    textDecoration: 'underline',
    transition: 'color 0.2s ease',
    '&:hover': {
      color: '#6b7280',
    },
  },
  buttonClose: {
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: '24px',
    height: '32px',
    width: '32px',
    position: 'absolute',
    right: '16px',
    top: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#f3f4f6',
      color: '#4b5563',
    },
  },

  // Overlay and spotlight
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    mixBlendMode: 'hard-light',
  },
  spotlight: {
    backgroundColor: 'transparent',
    borderRadius: '4px',
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
  },
};
```

## Common Styling Patterns

### 1. Minimal Clean Style

```typescript
const minimalStyle: Partial<Styles> = {
  options: {
    backgroundColor: '#ffffff',
    primaryColor: '#000000',
    textColor: '#333333',
    arrowColor: '#ffffff',
    overlayColor: 'rgba(255, 255, 255, 0.9)',
  },
  tooltip: {
    borderRadius: '0px',
    boxShadow: 'none',
    border: '2px solid #000000',
  },
  buttonNext: {
    backgroundColor: '#000000',
    borderRadius: '0px',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontSize: '14px',
  },
};
```

### 2. Gradient Modern Style

```typescript
const gradientStyle: Partial<Styles> = {
  options: {
    primaryColor: '#667eea',
    backgroundColor: '#ffffff',
  },
  tooltip: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
  },
  buttonNext: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  },
};
```

### 3. Dark Mode Style

```typescript
const darkModeStyle: Partial<Styles> = {
  options: {
    backgroundColor: '#1f2937',
    textColor: '#f9fafb',
    primaryColor: '#3b82f6',
    overlayColor: 'rgba(0, 0, 0, 0.8)',
    arrowColor: '#1f2937',
  },
  tooltip: {
    backgroundColor: '#1f2937',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
    border: '1px solid #374151',
  },
  tooltipTitle: {
    color: '#f3f4f6',
  },
  tooltipContent: {
    color: '#e5e7eb',
  },
  tooltipFooter: {
    borderTop: '1px solid #374151',
  },
  buttonNext: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
  },
  buttonBack: {
    backgroundColor: '#374151',
    color: '#e5e7eb',
  },
};
```

## Theme Examples

### Japanese-Inspired Theme

```typescript
const japaneseTheme: Partial<Styles> = {
  options: {
    primaryColor: '#dc2626',      // Red accent
    backgroundColor: '#fffbeb',    // Warm paper color
    textColor: '#451a03',          // Dark brown
    overlayColor: 'rgba(0, 0, 0, 0.3)',
    arrowColor: '#fffbeb',
  },
  tooltip: {
    fontFamily: '"Noto Sans JP", -apple-system, sans-serif',
    backgroundColor: '#fffbeb',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #fed7aa',
  },
  tooltipTitle: {
    fontSize: '18px',
    fontWeight: '600',
    borderBottom: '2px solid #dc2626',
    paddingBottom: '12px',
    marginBottom: '16px',
  },
  tooltipFooter: {
    justifyContent: 'center',
    borderTop: '1px solid #fed7aa',
  },
  tooltipFooterSpacer: {
    display: 'none',
  },
  buttonNext: {
    backgroundColor: '#dc2626',
    padding: '10px 32px',
    fontSize: '15px',
    borderRadius: '4px',
  },
};
```

### Enterprise Blue Theme

```typescript
const enterpriseTheme: Partial<Styles> = {
  options: {
    primaryColor: '#1e40af',
    backgroundColor: '#ffffff',
    textColor: '#1e293b',
    overlayColor: 'rgba(15, 23, 42, 0.7)',
  },
  tooltip: {
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    borderRadius: '12px',
  },
  tooltipContainer: {
    padding: '32px',
  },
  tooltipTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '20px',
  },
  buttonNext: {
    backgroundColor: '#1e40af',
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
  },
};
```

## Responsive Design

### Mobile-Optimized Styles

```typescript
const mobileStyles: Partial<Styles> = {
  options: {
    width: '90vw',  // Use viewport width
    zIndex: 99999,  // Ensure visibility over mobile navs
  },
  tooltip: {
    maxWidth: '90vw',
    minWidth: '280px',
    fontSize: '14px',
  },
  tooltipContainer: {
    padding: '16px',
  },
  tooltipTitle: {
    fontSize: '18px',
  },
  buttonNext: {
    padding: '12px 24px',
    fontSize: '16px',
    width: '100%',  // Full width on mobile
  },
  buttonBack: {
    padding: '12px 24px',
    width: '100%',
    marginRight: 0,
    marginBottom: '8px',
  },
  tooltipFooter: {
    flexDirection: 'column',  // Stack buttons vertically
    gap: '8px',
  },
};

// Apply conditionally
const styles = window.innerWidth < 768 ? mobileStyles : desktopStyles;
```

### Breakpoint-Based Styling

```typescript
const responsiveStyles: Partial<Styles> = {
  tooltip: {
    padding: 0,
    '@media (max-width: 768px)': {
      maxWidth: '90vw',
      margin: '0 5vw',
    },
  },
  tooltipContainer: {
    padding: window.innerWidth < 768 ? '16px' : '24px',
  },
  buttonNext: {
    padding: window.innerWidth < 768 ? '10px 20px' : '12px 28px',
    fontSize: window.innerWidth < 768 ? '14px' : '16px',
  },
};
```

## Animation Effects

### Pulse Effect for Beacon

```css
/* Add to your global CSS */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
```

### Smooth Entrance Animation

```typescript
const animatedStyles: Partial<Styles> = {
  tooltip: {
    animation: 'fadeInUp 0.3s ease-out',
  },
  // Add corresponding CSS
};
```

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Style Debugging Tips

### 1. Check Component Structure

```typescript
// Enable debug mode to see component structure
<Joyride
  debug={true}
  // ... other props
/>
```

### 2. Override with Important

If styles aren't applying, you might need to increase specificity:

```typescript
const forceStyles: Partial<Styles> = {
  buttonNext: {
    backgroundColor: '#3b82f6 !important',
  },
};
```

### 3. Use Browser DevTools

Inspect the rendered tooltip to see applied styles:
- Look for elements with classes like `react-joyride__tooltip`
- Check computed styles to see what's being overridden

### 4. Common Issues and Solutions

**Issue**: Button appears in wrong position
**Solution**: Set `tooltipFooterSpacer: { display: 'none' }`

**Issue**: Styles not applying
**Solution**: Check z-index conflicts, increase specificity

**Issue**: Tooltip too wide/narrow
**Solution**: Set explicit width in options or tooltip styles

**Issue**: Content overflowing
**Solution**: Add `overflow: 'auto'` to tooltipContent

## Next Steps

- Review [Tutorial Implementation Guide](tutorial-implementation-guide.md) for complete setup
- See [Tutorial Localization](tutorial-localization.md) for button text customization
- Check [Tutorial Troubleshooting](tutorial-troubleshooting.md) for more styling issues