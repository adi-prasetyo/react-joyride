# Tutorial Troubleshooting Guide

This guide addresses common issues and their solutions when implementing tutorials with react-joyride.

## Table of Contents

- [Button Positioning Issues](#button-positioning-issues)
- [Tooltip Placement Problems](#tooltip-placement-problems)
- [Target Element Not Found](#target-element-not-found)
- [Scroll Behavior Issues](#scroll-behavior-issues)
- [State Synchronization Problems](#state-synchronization-problems)
- [Styling Conflicts](#styling-conflicts)
- [Z-Index Problems](#z-index-problems)
- [Overlay Not Appearing Issues](#overlay-not-appearing-issues)
- [Automated Testing Issues](#automated-testing-issues)
- [Spotlight Issues](#spotlight-issues)
- [Mobile-Specific Issues](#mobile-specific-issues)
- [Performance Issues](#performance-issues)
- [Multi-Page Tour Issues](#multi-page-tour-issues)

## Button Positioning Issues

### Problem: Buttons Appear in Bottom-Right Instead of Center

**Symptom**: Next/Start button appears in the bottom-right corner of the tooltip.

**Cause**: Joyride creates invisible flex containers for all buttons, even hidden ones, creating spacers.

**Solution**:
```typescript
const styles: Partial<Styles> = {
  tooltipFooter: {
    display: 'flex',
    justifyContent: 'center',    // Center alignment
    alignItems: 'center',
    marginTop: '20px',
    paddingTop: '16px',
    paddingBottom: '8px',
    borderTop: '1px solid #e5e7eb',
  },
  tooltipFooterSpacer: {
    display: 'none',             // Critical: Hide the spacer
  },
};
```

### Problem: Buttons Too Close to Tooltip Edge

**Solution**: Add margin/padding to buttons:
```typescript
const styles: Partial<Styles> = {
  buttonNext: {
    marginBottom: '8px',         // Space from bottom edge
    marginTop: '4px',            // Space from top elements
  },
  tooltipFooter: {
    paddingBottom: '12px',       // Extra footer padding
  },
};
```

## Tooltip Placement Problems

### Problem: Tooltip Appears in Wrong Position

**Common Causes & Solutions**:

1. **Target element has transform**:
```typescript
// Add to step configuration
{
  target: '.transformed-element',
  floaterProps: {
    // Disable position fixing for transformed elements
    disablePositionAutoAdjust: true,
  },
}
```

2. **Parent has overflow hidden**:
```typescript
// Force specific placement
{
  placement: 'top',  // Try different placements
  floaterProps: {
    offset: 20,      // Adjust offset
    preventOverflow: {
      boundariesElement: 'viewport',
    },
  },
}
```

3. **Dynamic content changes position**:
```typescript
// Update position after content loads
useEffect(() => {
  if (contentLoaded) {
    // Force Joyride to recalculate positions
    window.dispatchEvent(new Event('resize'));
  }
}, [contentLoaded]);
```

### Problem: Tooltip Overlaps Target Element

**Solution**: Adjust offset and placement:
```typescript
const step = {
  target: '.my-element',
  placement: 'bottom',
  floaterProps: {
    offset: 30,  // Increase distance from target
  },
  offset: 20,    // Additional offset (deprecated but still works)
};
```

## Target Element Not Found

### Problem: "Target not found" Error

**Common Causes**:

1. **Element not yet rendered**:
```typescript
// Wait for element to be available
const waitForElement = (selector: string): Promise<Element> => {
  return new Promise((resolve) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

// Use before starting tour
await waitForElement('.my-target');
startTutorial();
```

2. **Wrong selector**:
```typescript
// Use data attributes for reliability
<div data-tutorial="feature-button">...</div>

// In step configuration
{
  target: '[data-tutorial="feature-button"]',
  // ...
}
```

3. **Element in different route/page**:
```typescript
// Handle gracefully in callback
const handleJoyrideCallback = (data: CallBackProps) => {
  if (data.type === EVENTS.TARGET_NOT_FOUND) {
    console.warn('Target not found, skipping to next step');
    nextStep();
    return;
  }
};
```

### Problem: Dynamic Elements Not Found

**Solution**: Use refs or wait for render:
```typescript
const MyComponent = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const [targetReady, setTargetReady] = useState(false);

  useEffect(() => {
    if (targetRef.current) {
      setTargetReady(true);
    }
  }, []);

  return (
    <>
      <div ref={targetRef} id="dynamic-target">Content</div>
      {targetReady && (
        <Joyride
          steps={[{
            target: '#dynamic-target',
            content: 'This is dynamic content',
          }]}
          // ...
        />
      )}
    </>
  );
};
```

## Scroll Behavior Issues

### Problem: Page Doesn't Scroll to Element

**Solutions**:

1. **Enable scrolling**:
```typescript
<Joyride
  scrollToFirstStep={true}
  disableScrolling={false}  // Make sure this is false
  scrollOffset={100}         // Adjust offset as needed
  scrollDuration={500}       // Smooth scrolling
/>
```

2. **Custom scroll parent**:
```typescript
// If element is in a scrollable container
const step = {
  target: '.element-in-container',
  floaterProps: {
    getScrollParent: () => document.querySelector('.scroll-container'),
  },
};
```

3. **Manual scroll control**:
```typescript
useEffect(() => {
  if (currentStep) {
    const element = document.querySelector(currentStep.target);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }
}, [currentStep]);
```

### Problem: Tooltip Position Wrong After Scroll

**Solution**: Update Joyride after scroll:
```typescript
const handleScroll = useCallback(() => {
  // Debounce the update
  clearTimeout(scrollTimeout.current);
  scrollTimeout.current = setTimeout(() => {
    // Force position recalculation
    if (joyrideHelpers.current) {
      const { info } = joyrideHelpers.current;
      const { index } = info();
      // Trigger re-render
      setForceUpdate(prev => prev + 1);
    }
  }, 100);
}, []);

useEffect(() => {
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [handleScroll]);
```

## State Synchronization Problems

### Problem: Controlled Mode Not Working

**Solution**: Properly manage stepIndex:
```typescript
const [stepIndex, setStepIndex] = useState(0);

const handleJoyrideCallback = (data: CallBackProps) => {
  const { action, index, type } = data;

  if (type === EVENTS.STEP_AFTER) {
    if (action === ACTIONS.NEXT) {
      setStepIndex(index + 1);
    } else if (action === ACTIONS.PREV) {
      setStepIndex(index - 1);
    }
  }
  
  if (type === EVENTS.TOUR_END) {
    setStepIndex(0); // Reset for next run
  }
};

<Joyride
  stepIndex={stepIndex}
  run={true}
  callback={handleJoyrideCallback}
  // ...
/>
```

### Problem: Tour Restarts Unexpectedly

**Common Causes**:

1. **Component remounting**:
```typescript
// Persist state in parent or context
const TourProvider = ({ children }) => {
  const [tourState, setTourState] = useState(() => {
    // Load from localStorage
    const saved = localStorage.getItem('tourState');
    return saved ? JSON.parse(saved) : { completed: false };
  });

  // Save on change
  useEffect(() => {
    localStorage.setItem('tourState', JSON.stringify(tourState));
  }, [tourState]);

  return (
    <TourContext.Provider value={{ tourState, setTourState }}>
      {children}
    </TourContext.Provider>
  );
};
```

2. **Steps array changing reference**:
```typescript
// Memoize steps to prevent re-renders
const steps = useMemo(() => [
  { target: '.step1', content: 'Step 1' },
  { target: '.step2', content: 'Step 2' },
], []); // Empty deps if steps don't change
```

## Styling Conflicts

### Problem: Custom Styles Not Applied

**Solutions**:

1. **Increase specificity**:
```typescript
const styles: Partial<Styles> = {
  tooltip: {
    backgroundColor: '#000 !important',
    color: '#fff !important',
  },
};
```

2. **Check z-index conflicts**:
```typescript
const styles: Partial<Styles> = {
  options: {
    zIndex: 99999,  // Higher than other elements
  },
};
```

3. **Override with CSS**:
```css
/* Global CSS with high specificity */
.react-joyride__tooltip {
  background-color: #000 !important;
}
```

### Problem: Tooltip Inherits Page Styles

**Solution**: Reset styles explicitly:
```typescript
const styles: Partial<Styles> = {
  tooltip: {
    // Reset inherited styles
    all: 'unset',
    display: 'block',
    // Then apply your styles
    backgroundColor: '#fff',
    padding: '20px',
    // ...
  },
};
```

## Z-Index Problems

### Problem: Tooltip Behind Other Elements

**Solutions**:

1. **Increase z-index**:
```typescript
const styles: Partial<Styles> = {
  options: {
    zIndex: 2147483647,  // Maximum safe z-index
  },
};
```

2. **Check parent z-index**:
```css
/* Ensure no parent has lower z-index */
.tour-container {
  position: relative;
  z-index: auto !important;
}
```

3. **Use Portal for rendering**:
```typescript
// Joyride already uses Portal, but ensure no conflicts
// Check that Portal target exists
useEffect(() => {
  if (!document.getElementById('react-joyride-portal')) {
    const portal = document.createElement('div');
    portal.id = 'react-joyride-portal';
    document.body.appendChild(portal);
  }
}, []);
```

## Overlay Not Appearing Issues

### Problem: Overlay Not Showing on Initial Render for Center Placement

**Symptom**: When starting a tour with a step that targets `body` with `placement: 'center'`, the overlay (darkened background) doesn't appear on initial render. It only appears after navigating to another step and then back.

**Cause**: Prior to version 2.9.4, there was a bug in the lifecycle progression logic that prevented center-placed steps from advancing from `INIT` to `READY` lifecycle when the tour first started with `ACTIONS.START`.

**Solution for versions < 2.9.4**: 

1. **Workaround - Start with a different step**:
```typescript
// Add a dummy first step that immediately advances
const steps = [
  {
    target: '.some-element',
    content: 'Welcome!',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: 'body',
    content: 'This is the main welcome message',
    placement: 'center',
  },
  // ... rest of your steps
];
```

2. **Workaround - Force lifecycle progression**:
```typescript
const [run, setRun] = useState(false);

// Start tour with a delay
useEffect(() => {
  if (shouldStartTour) {
    setRun(true);
    // Force a re-render after mount
    setTimeout(() => {
      setRun(false);
      setTimeout(() => setRun(true), 10);
    }, 100);
  }
}, [shouldStartTour]);
```

**Solution for versions >= 2.9.4**: This issue has been fixed. The overlay now appears immediately for center placement steps on initial render.

**How to verify the fix**: 
```typescript
// This should now work correctly in v2.9.4+
const steps = [
  {
    target: 'body',
    placement: 'center',
    content: 'Welcome! The overlay should appear immediately.',
  },
];

<Joyride
  steps={steps}
  run={true}
  styles={{
    options: {
      overlayColor: 'rgba(0, 0, 0, 0.5)', // Verify overlay is visible
    },
  }}
/>
```

**Technical Details**: The issue was in the Step component where the condition for lifecycle progression explicitly excluded `ACTIONS.START`. The fix includes this action in the condition:

```typescript
// Before (buggy)
if (step.placement === 'center' && 
    status === STATUS.RUNNING && 
    changed('index') && 
    action !== ACTIONS.START && // This was the problem
    lifecycle === LIFECYCLE.INIT) {
  store.update({ lifecycle: LIFECYCLE.READY });
}

// After (fixed)
if (step.placement === 'center' && 
    status === STATUS.RUNNING && 
    (changed('index') || action === ACTIONS.START) && 
    lifecycle === LIFECYCLE.INIT) {
  store.update({ lifecycle: LIFECYCLE.READY });
}
```

## Automated Testing Issues

### Problem: Can't Click Through Overlay in Playwright/Puppeteer

**Symptom**: Automated tests fail to click elements through the Joyride overlay, even with `spotlightClicks: true`, but manual clicking works fine.

**Cause**: When `spotlightClicks` is enabled, Joyride tracks mouse movement to determine when the cursor is over the spotlight area and sets `pointer-events: none` on the overlay. Automated testing tools like Playwright typically don't trigger `mousemove` events when clicking, so the overlay remains clickable and blocks the target element.

**Solution**: Trigger mouse movement before clicking:

```typescript
// Playwright example
test('click element through Joyride spotlight', async ({ page }) => {
  const button = page.locator('[data-testid="my-button"]');
  const box = await button.boundingBox();
  
  if (box) {
    // Move mouse to trigger mousemove events
    await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
    await page.waitForTimeout(50); // Give time for mousemove handler
    
    // Now click - the overlay will have pointer-events: none
    await page.mouse.click(box.x + box.width/2, box.y + box.height/2);
  }
});

// Alternative approach using force click (less realistic but simpler)
await button.click({ force: true });
```

**Explanation**: The overlay component listens for `mousemove` events to detect when the cursor enters the spotlight area. When detected, it sets `pointer-events: none` on the overlay, allowing clicks to pass through. Manual testing naturally triggers these events as you move your mouse, but automated tools need to explicitly trigger them.

## Spotlight Issues

### Problem: spotlightPadding Not Working

**Symptom**: Setting `spotlightPadding` (including negative values) has no effect on the spotlight size.

**Cause**: The step configuration is not properly passing the `spotlightPadding` property to Joyride. This often happens when using a wrapper component that maps custom step objects to Joyride's Step format.

**Solution**: Ensure your wrapper includes `spotlightPadding` when converting steps:

```typescript
// ❌ Wrong - spotlightPadding missing
const joyrideSteps = steps.map(step => ({
  target: step.target,
  content: step.content,
  placement: step.placement || 'bottom',
  spotlightClicks: step.spotlightClicks,
  styles: step.styles || {},
}));

// ✅ Correct - spotlightPadding included
const joyrideSteps = steps.map(step => ({
  target: step.target,
  content: step.content,
  placement: step.placement || 'bottom',
  spotlightClicks: step.spotlightClicks,
  spotlightPadding: step.spotlightPadding !== undefined ? step.spotlightPadding : 10,
  styles: step.styles || {},
}));
```

### Problem: Spotlight Highlights Adjacent Elements

**Symptom**: The spotlight is too large and highlights neighboring buttons or elements.

**Solution**: Use negative `spotlightPadding` to shrink the spotlight:

```typescript
{
  target: '[data-testid="my-button"]',
  content: 'Click this specific button',
  spotlightPadding: -5, // Makes spotlight 10px smaller (5px on each side)
  // or
  spotlightPadding: -10, // Makes spotlight 20px smaller
}
```

**Note**: The spotlight size calculation is:
- Width: `elementWidth + (spotlightPadding * 2)`
- Height: `elementHeight + (spotlightPadding * 2)`
- Left position: `elementLeft - spotlightPadding`

So negative padding reduces the size and shifts the position accordingly.

## Mobile-Specific Issues

### Problem: Tooltip Cut Off on Mobile

**Solutions**:

1. **Responsive width**:
```typescript
const mobileStyles: Partial<Styles> = {
  options: {
    width: window.innerWidth < 768 ? '90vw' : 400,
  },
  tooltip: {
    maxWidth: '90vw',
    margin: '0 5vw',
  },
};
```

2. **Adjust placement for mobile**:
```typescript
const isMobile = window.innerWidth < 768;
const step = {
  target: '.element',
  placement: isMobile ? 'center' : 'bottom',
  floaterProps: {
    // Disable auto-positioning on mobile
    disableFlip: isMobile,
  },
};
```

### Problem: Touch Events Not Working

**Solution**: Ensure proper event handling:
```typescript
const step = {
  target: '.mobile-element',
  event: 'click',  // Works for both touch and click
  spotlightClicks: true,  // Allow interaction with highlighted element
};
```

## Performance Issues

### Problem: Tour Causes Lag

**Solutions**:

1. **Debounce resize handlers**:
```typescript
const debouncedResize = useMemo(
  () => debounce(() => {
    // Update positions
  }, 300),
  []
);

useEffect(() => {
  window.addEventListener('resize', debouncedResize);
  return () => {
    window.removeEventListener('resize', debouncedResize);
    debouncedResize.cancel();
  };
}, [debouncedResize]);
```

2. **Lazy load Joyride**:
```typescript
const Joyride = lazy(() => import('react-joyride'));

// Use with Suspense
<Suspense fallback={null}>
  {showTour && <Joyride {...props} />}
</Suspense>
```

3. **Optimize step content**:
```typescript
// Memoize complex content
const stepContent = useMemo(() => (
  <ComplexStepContent data={data} />
), [data]);

const steps = [{
  target: '.element',
  content: stepContent,
}];
```

## Multi-Page Tour Issues

### Problem: Tour State Lost on Navigation

**Solution**: Persist state across pages:
```typescript
// Before navigation
const handleNextPage = () => {
  const tourProgress = {
    flowId: currentFlow.id,
    nextStepIndex: currentStepIndex + 1,
    timestamp: Date.now(),
  };
  
  sessionStorage.setItem('tourProgress', JSON.stringify(tourProgress));
  router.push('/next-page');
};

// On next page
useEffect(() => {
  const saved = sessionStorage.getItem('tourProgress');
  if (saved) {
    const { flowId, nextStepIndex, timestamp } = JSON.parse(saved);
    
    // Check if recent (within 5 minutes)
    if (Date.now() - timestamp < 300000) {
      setTimeout(() => {
        startTutorial(flowId, nextStepIndex);
      }, 500); // Wait for page to render
    }
    
    sessionStorage.removeItem('tourProgress');
  }
}, []);
```

### Problem: Tour Continues on Wrong Page

**Solution**: Validate current page:
```typescript
const validateStepForCurrentPage = (step: Step): boolean => {
  const currentPath = window.location.pathname;
  const stepMeta = step.data as { requiredPath?: string };
  
  if (stepMeta?.requiredPath) {
    return currentPath === stepMeta.requiredPath;
  }
  
  // Check if target exists
  return !!document.querySelector(step.target);
};

// Filter steps for current page
const validSteps = steps.filter(validateStepForCurrentPage);
```

## Debug Helpers

### Enable Debug Mode

```typescript
<Joyride
  debug={true}  // Logs internal state changes
  // ...
/>
```

### Custom Debug Logger

```typescript
const debugLogger = (data: CallBackProps) => {
  console.group(`[Joyride] ${data.type}`);
  console.log('Action:', data.action);
  console.log('Index:', data.index);
  console.log('Status:', data.status);
  console.log('Lifecycle:', data.lifecycle);
  console.log('Step:', data.step);
  console.groupEnd();
};

<Joyride
  callback={debugLogger}
  // ...
/>
```

## Common Error Messages

### "TypeError: Cannot read property 'getBoundingClientRect' of null"

**Cause**: Target element doesn't exist
**Fix**: Ensure element exists before starting tour

### "Warning: Can't perform a React state update on an unmounted component"

**Cause**: Callback trying to update state after unmount
**Fix**: Use cleanup and cancellation:

```typescript
useEffect(() => {
  let mounted = true;

  const handleCallback = (data: CallBackProps) => {
    if (mounted) {
      // Safe to update state
    }
  };

  return () => {
    mounted = false;
  };
}, []);
```

## Next Steps

- Review [Tutorial Implementation Guide](tutorial-implementation-guide.md) for proper setup
- See [Tutorial Styling Guide](tutorial-styling-guide.md) for styling solutions
- Check [Tutorial Localization](tutorial-localization.md) for text customization