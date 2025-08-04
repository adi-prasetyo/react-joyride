# Tutorial Implementation Guide

This guide provides a comprehensive approach to implementing product tours and tutorials using react-joyride. It includes practical examples, best practices, and complete implementation patterns.

## Table of Contents

- [Basic Setup](#basic-setup)
- [Complete TutorialWrapper Component](#complete-tutorialwrapper-component)
- [Step Configuration](#step-configuration)
- [State Management](#state-management)
- [Multi-Page Tours](#multi-page-tours)
- [TypeScript Types](#typescript-types)
- [Advanced Patterns](#advanced-patterns)

## Basic Setup

First, install react-joyride:

```bash
npm install react-joyride
# or with the fork for React 19 support
npm install github:adi-prasetyo/react-joyride#adp-maintained
```

## Complete TutorialWrapper Component

Here's a production-ready TutorialWrapper component with full functionality:

```tsx
// components/Tutorial/TutorialWrapper.tsx
import React, { useEffect, useCallback } from 'react';
import Joyride from 'react-joyride';
import { 
  STATUS, 
  EVENTS, 
  CallBackProps, 
  Step,
  Styles
} from 'react-joyride';
import { useTutorial } from './hooks/useTutorial';

// Define your styles (see tutorial-styling-guide.md for complete styling)
const tutorialStyles: Partial<Styles> = {
  options: {
    primaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    zIndex: 1000,
    arrowColor: '#ffffff',
    overlayColor: 'rgba(0, 0, 0, 0.5)',
  },
  tooltip: {
    fontSize: '14px',
    borderRadius: '8px',
    padding: 0,
    maxWidth: '500px',
    minWidth: '300px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
  },
  tooltipContainer: {
    padding: '20px',
    textAlign: 'left' as const,
  },
  tooltipTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '12px',
    lineHeight: '1.4',
  },
  tooltipFooter: {
    display: 'flex',
    justifyContent: 'center', // Center buttons
    alignItems: 'center',
    marginTop: '20px',
    paddingTop: '16px',
    paddingBottom: '8px',
    borderTop: '1px solid #e5e7eb',
  },
  tooltipFooterSpacer: {
    display: 'none', // Hide spacer to prevent button misalignment
  },
  buttonNext: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    padding: '12px 24px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginBottom: '8px',
  },
  buttonBack: {
    backgroundColor: 'transparent',
    color: '#6b7280',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    padding: '8px 16px',
    cursor: 'pointer',
    marginRight: '8px',
    transition: 'all 0.2s',
  },
};

// Locale configuration (see tutorial-localization.md for details)
const defaultLocale = {
  back: 'Back',
  close: 'Close',
  last: 'Finish',
  next: 'Next',
  nextLabelWithProgress: 'Next', // Remove step counter
  skip: 'Skip',
};

interface TutorialWrapperProps {
  children: React.ReactNode;
}

const TutorialWrapper: React.FC<TutorialWrapperProps> = ({ children }) => {
  const {
    tutorialState,
    getCurrentFlow,
    getCurrentStep,
    nextStep,
    previousStep,
    skipTutorial,
    stopTutorial,
    completeStep,
    completeFlow,
  } = useTutorial();

  const currentFlow = getCurrentFlow();
  const currentStep = getCurrentStep();

  // Convert tutorial steps to Joyride format
  const joyrideSteps: Step[] = currentFlow?.steps.map((step, index) => ({
    target: step.target,
    content: step.content,
    title: step.title,
    placement: step.placement || 'bottom',
    disableBeacon: step.disableBeacon || false,
    hideFooter: step.hideFooter || false,
    styles: step.styles || {},
    floaterProps: {
      offset: 20, // Add spacing between tooltip and target
      ...step.floaterProps,
    },
  })) || [];

  // Handle Joyride callbacks
  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, type, index, action } = data;

    console.log('[Tutorial] Joyride callback:', { status, type, index, action });

    // Handle step completion
    if (type === EVENTS.STEP_AFTER) {
      if (currentFlow) {
        completeStep(currentFlow.id, index);
        
        // Handle multi-page tours
        if (currentFlow.id === 'onboarding' && index === currentFlow.steps.length - 1) {
          localStorage.setItem('tutorial_continue_next_page', 'true');
        }
      }
    }

    // Handle target not found
    if (type === EVENTS.TARGET_NOT_FOUND) {
      console.warn('[Tutorial] Target not found for step:', index);
      nextStep();
      return;
    }

    // Handle tour completion or skip
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      if (currentFlow && status === STATUS.FINISHED) {
        completeFlow(currentFlow.id);
      } else {
        skipTutorial();
      }
    }

    // Handle navigation actions
    if (action === 'next') {
      nextStep();
    } else if (action === 'prev') {
      previousStep();
    } else if (action === 'skip') {
      skipTutorial();
    } else if (action === 'close') {
      stopTutorial();
    }
  }, [currentFlow, completeStep, completeFlow, nextStep, previousStep, skipTutorial, stopTutorial]);

  // Auto-scroll to target element
  useEffect(() => {
    if (tutorialState.isActive && currentStep) {
      const target = document.querySelector(currentStep.target);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }, 100);
      }
    }
  }, [tutorialState.currentStepIndex, currentStep]);

  return (
    <>
      {children}
      
      {tutorialState.isActive && currentFlow && (
        <Joyride
          steps={joyrideSteps}
          stepIndex={tutorialState.currentStepIndex}
          run={tutorialState.isActive}
          continuous={true}
          showProgress={true}
          showSkipButton={false}
          scrollToFirstStep={true}
          scrollOffset={100}
          disableScrolling={false}
          disableOverlayClose={false}
          spotlightClicks={false}
          spotlightPadding={20}
          callback={handleJoyrideCallback}
          styles={tutorialStyles}
          locale={defaultLocale}
          debug={process.env.NODE_ENV === 'development'}
        />
      )}
    </>
  );
};

export default TutorialWrapper;
```

## Step Configuration

Steps are the core of your tutorial. Each step requires at minimum a `target` and `content`:

```typescript
interface TutorialStep {
  target: string;               // CSS selector or HTMLElement
  content: React.ReactNode;     // Step content
  title?: React.ReactNode;      // Optional title
  placement?: Placement;        // Tooltip placement
  disableBeacon?: boolean;      // Skip beacon, show tooltip immediately
  hideFooter?: boolean;         // Hide footer buttons
  styles?: Partial<Styles>;     // Step-specific styles
  floaterProps?: FloaterProps;  // Additional positioning options
}
```

### Example Steps Configuration

```typescript
const tutorialSteps: TutorialStep[] = [
  {
    target: '#welcome-banner',
    title: 'Welcome to Our App!',
    content: 'Let\'s take a quick tour to help you get started.',
    placement: 'center', // Center on screen
    disableBeacon: true,
  },
  {
    target: '.navigation-menu',
    title: 'Navigation Menu',
    content: 'Use this menu to navigate between different sections of the app.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="search-bar"]',
    title: 'Search Functionality',
    content: (
      <div>
        <p>Search for anything you need:</p>
        <ul>
          <li>Products by name</li>
          <li>Categories</li>
          <li>SKU numbers</li>
        </ul>
      </div>
    ),
    placement: 'bottom',
    floaterProps: {
      offset: 30, // Extra spacing for this step
    },
  },
  {
    target: '.user-profile',
    title: 'Your Profile',
    content: 'Access your account settings and preferences here.',
    placement: 'left',
  },
];
```

### Placement Options

- `top`, `top-start`, `top-end`
- `bottom`, `bottom-start`, `bottom-end`
- `left`, `left-start`, `left-end`
- `right`, `right-start`, `right-end`
- `auto` - Automatically choose best position
- `center` - Center on viewport (requires `target: 'body'`)

## State Management

### Custom Hook for Tutorial State

```typescript
// hooks/useTutorial.ts
import { useState, useCallback, useEffect } from 'react';

interface TutorialFlow {
  id: string;
  name: string;
  steps: TutorialStep[];
  requiredFlows?: string[]; // Prerequisites
}

interface TutorialState {
  isActive: boolean;
  currentFlow: string | null;
  currentStepIndex: number;
  completedFlows: string[];
  completedSteps: Record<string, number[]>;
}

export const useTutorial = () => {
  const [tutorialState, setTutorialState] = useState<TutorialState>(() => {
    // Load saved state from localStorage
    const saved = localStorage.getItem('tutorial_state');
    return saved ? JSON.parse(saved) : {
      isActive: false,
      currentFlow: null,
      currentStepIndex: 0,
      completedFlows: [],
      completedSteps: {},
    };
  });

  // Save state to localStorage on change
  useEffect(() => {
    localStorage.setItem('tutorial_state', JSON.stringify(tutorialState));
  }, [tutorialState]);

  const startTutorial = useCallback((flowId: string) => {
    setTutorialState(prev => ({
      ...prev,
      isActive: true,
      currentFlow: flowId,
      currentStepIndex: 0,
    }));
  }, []);

  const nextStep = useCallback(() => {
    setTutorialState(prev => ({
      ...prev,
      currentStepIndex: prev.currentStepIndex + 1,
    }));
  }, []);

  const previousStep = useCallback(() => {
    setTutorialState(prev => ({
      ...prev,
      currentStepIndex: Math.max(0, prev.currentStepIndex - 1),
    }));
  }, []);

  const skipTutorial = useCallback(() => {
    setTutorialState(prev => ({
      ...prev,
      isActive: false,
      currentFlow: null,
      currentStepIndex: 0,
    }));
  }, []);

  const completeStep = useCallback((flowId: string, stepIndex: number) => {
    setTutorialState(prev => ({
      ...prev,
      completedSteps: {
        ...prev.completedSteps,
        [flowId]: [...(prev.completedSteps[flowId] || []), stepIndex],
      },
    }));
  }, []);

  const completeFlow = useCallback((flowId: string) => {
    setTutorialState(prev => ({
      ...prev,
      completedFlows: [...prev.completedFlows, flowId],
      isActive: false,
      currentFlow: null,
      currentStepIndex: 0,
    }));
  }, []);

  return {
    tutorialState,
    startTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    stopTutorial: skipTutorial,
    completeStep,
    completeFlow,
    getCurrentFlow: () => tutorialFlows.find(f => f.id === tutorialState.currentFlow),
    getCurrentStep: () => {
      const flow = tutorialFlows.find(f => f.id === tutorialState.currentFlow);
      return flow?.steps[tutorialState.currentStepIndex];
    },
  };
};
```

## Multi-Page Tours

For tours that span multiple pages, you need to handle state persistence:

```typescript
// Page 1: Start the tour
const handleStartTour = () => {
  localStorage.setItem('tutorial_continue', JSON.stringify({
    flowId: 'onboarding',
    targetPage: '/dashboard',
    nextStepIndex: 3,
  }));
  startTutorial('onboarding');
};

// Page 2: Continue the tour
useEffect(() => {
  const continueData = localStorage.getItem('tutorial_continue');
  if (continueData) {
    const { flowId, nextStepIndex } = JSON.parse(continueData);
    localStorage.removeItem('tutorial_continue');
    
    // Wait for page to render
    setTimeout(() => {
      setTutorialState({
        isActive: true,
        currentFlow: flowId,
        currentStepIndex: nextStepIndex,
      });
    }, 500);
  }
}, []);
```

## TypeScript Types

Complete TypeScript definitions for your tutorial system:

```typescript
// types/tutorial.ts
import { ReactNode } from 'react';
import { Placement, FloaterProps, Styles } from 'react-joyride';

export interface TutorialStep {
  target: string | HTMLElement;
  content: ReactNode;
  title?: ReactNode;
  placement?: Placement | 'auto' | 'center';
  disableBeacon?: boolean;
  hideFooter?: boolean;
  hideCloseButton?: boolean;
  hideBackButton?: boolean;
  spotlightClicks?: boolean;
  spotlightPadding?: number;
  styles?: Partial<Styles>;
  floaterProps?: Partial<FloaterProps>;
  data?: any; // Custom data
}

export interface TutorialFlow {
  id: string;
  name: string;
  description?: string;
  steps: TutorialStep[];
  requiredFlows?: string[];
  autoStart?: boolean;
  once?: boolean; // Only show once
}

export interface TutorialState {
  isActive: boolean;
  currentFlow: string | null;
  currentStepIndex: number;
  completedFlows: string[];
  completedSteps: Record<string, number[]>;
  skippedFlows: string[];
}

export interface TutorialContextValue {
  state: TutorialState;
  startTutorial: (flowId: string) => void;
  stopTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (index: number) => void;
  skipTutorial: () => void;
  completeStep: (flowId: string, stepIndex: number) => void;
  completeFlow: (flowId: string) => void;
  resetTutorial: () => void;
  getCurrentFlow: () => TutorialFlow | undefined;
  getCurrentStep: () => TutorialStep | undefined;
  canStartFlow: (flowId: string) => boolean;
}
```

## Advanced Patterns

### Conditional Steps

Show steps based on user actions or application state:

```typescript
const dynamicSteps = useMemo(() => {
  const steps: TutorialStep[] = [
    {
      target: '.header',
      content: 'Welcome to the app!',
    },
  ];

  // Add steps conditionally
  if (user.isNewUser) {
    steps.push({
      target: '.getting-started',
      content: 'Check out our getting started guide!',
    });
  }

  if (user.hasProducts) {
    steps.push({
      target: '.product-list',
      content: 'Here are your products.',
    });
  } else {
    steps.push({
      target: '.add-product-btn',
      content: 'Click here to add your first product!',
    });
  }

  return steps;
}, [user]);
```

### Custom Beacon Component

```tsx
const CustomBeacon: React.FC<BeaconRenderProps> = ({ step, onClickOrHover }) => (
  <button
    onClick={onClickOrHover}
    className="custom-beacon"
    aria-label="Start tutorial"
  >
    <span className="pulse-animation">?</span>
  </button>
);

// Use in Joyride
<Joyride
  beaconComponent={CustomBeacon}
  // ... other props
/>
```

### Tutorial Analytics

Track tutorial engagement:

```typescript
const handleJoyrideCallback = useCallback((data: CallBackProps) => {
  const { type, index, action, status } = data;

  // Track events
  if (type === EVENTS.TOUR_START) {
    analytics.track('Tutorial Started', { flowId: currentFlow.id });
  }

  if (type === EVENTS.STEP_AFTER) {
    analytics.track('Tutorial Step Completed', {
      flowId: currentFlow.id,
      stepIndex: index,
      stepTarget: currentFlow.steps[index].target,
    });
  }

  if (status === STATUS.FINISHED) {
    analytics.track('Tutorial Completed', { flowId: currentFlow.id });
  }

  if (status === STATUS.SKIPPED) {
    analytics.track('Tutorial Skipped', {
      flowId: currentFlow.id,
      skippedAtStep: index,
    });
  }
}, [currentFlow]);
```

### Programmatic Control

Control the tour from outside the component:

```typescript
// Create a ref to store helpers
const joyrideHelpers = useRef<StoreHelpers>(null);

// In Joyride component
<Joyride
  getHelpers={(helpers) => {
    joyrideHelpers.current = helpers;
  }}
  // ... other props
/>

// Use helpers anywhere
const skipToLastStep = () => {
  if (joyrideHelpers.current) {
    const { go, info } = joyrideHelpers.current;
    const { size } = info();
    go(size - 1); // Go to last step
  }
};
```

## Best Practices

1. **Target Selection**
   - Use unique IDs or data attributes for tutorial targets
   - Avoid generic class selectors that might match multiple elements
   - Example: `data-tutorial="unique-feature-name"`

2. **Content Writing**
   - Keep content concise and action-oriented
   - Use bullet points for multiple items
   - Include keyboard shortcuts if relevant

3. **Step Order**
   - Start with the most important features
   - Group related features together
   - End with a clear call-to-action

4. **Performance**
   - Lazy load tutorial components
   - Clean up localStorage when appropriate
   - Debounce scroll handlers

5. **Accessibility**
   - Ensure all interactive elements are keyboard accessible
   - Provide clear labels for screen readers
   - Test with keyboard navigation

6. **Mobile Considerations**
   - Test on various screen sizes
   - Use appropriate placement for mobile
   - Consider simplified mobile tours

## Next Steps

- See [Tutorial Styling Guide](tutorial-styling-guide.md) for complete styling options
- Check [Tutorial Localization](tutorial-localization.md) for multi-language support
- Review [Tutorial Troubleshooting](tutorial-troubleshooting.md) for common issues