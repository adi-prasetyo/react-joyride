# Overview

[![Joyride example image](http://gilbarbara.com/files/react-joyride.png)](https://react-joyride.com/)

### Create awesome tours for your app!

Showcase your app to new users or explain the functionality of new features.

It uses [react-floater](https://github.com/gilbarbara/react-floater) for positioning and styling.  
You can also use your own components.

**Open the** [**demo**](https://react-joyride.com/)  
**Open GitHub** [**repo**](https://github.com/gilbarbara/react-joyride)

## Tutorial Guides

- [**Tutorial Implementation Guide**](tutorial-implementation-guide.md) - Complete guide with TutorialWrapper component, state management, and TypeScript types
- [**Tutorial Styling Guide**](tutorial-styling-guide.md) - Comprehensive styling solutions including button positioning fixes and theme examples
- [**Tutorial Localization Guide**](tutorial-localization.md) - Multi-language support, removing step counters, and RTL language handling
- [**Tutorial Troubleshooting**](tutorial-troubleshooting.md) - Common issues and solutions for button positioning, tooltips, scrolling, and more

## Setup

```bash
npm i react-joyride
```

## Getting Started

```tsx
import React, { useState } from 'react';
import Joyride from 'react-joyride';

/*
 * If your steps are not dynamic you can use a simple array.
 * Otherwise you can set it as a state inside your component.
 */
const steps = [
  {
    target: '.my-first-step',
    content: 'This is my awesome feature!',
  },
  {
    target: '.my-other-step',
    content: 'This another awesome feature!',
  },
];

export default function App() {
  // If you want to delay the tour initialization you can use the `run` prop
  return (
    <div>
      <Joyride steps={steps} />
      ...
    </div>
  );
}
```

> To support legacy browsers, include the [scrollingelement](https://github.com/mathiasbynens/document.scrollingElement) polyfill.
