# Tutorial Localization Guide

This guide explains how to customize button text, remove step counters, and implement multi-language support in react-joyride tutorials.

## Table of Contents

- [Basic Locale Configuration](#basic-locale-configuration)
- [Removing Step Counters](#removing-step-counters)
- [Multi-Language Implementation](#multi-language-implementation)
- [Dynamic Locale Switching](#dynamic-locale-switching)
- [Advanced Localization Patterns](#advanced-localization-patterns)
- [RTL Language Support](#rtl-language-support)

## Basic Locale Configuration

The `locale` prop accepts an object with the following properties:

```typescript
interface Locale {
  back?: ReactNode;              // Back button text
  close?: ReactNode;             // Close button text
  last?: ReactNode;              // Last step button text
  next?: ReactNode;              // Next button text
  nextLabelWithProgress?: ReactNode; // Next with step counter
  open?: ReactNode;              // Beacon open text
  skip?: ReactNode;              // Skip button text
}
```

### Default English Locale

```typescript
const defaultLocale = {
  back: 'Back',
  close: 'Close',
  last: 'Last',
  next: 'Next',
  nextLabelWithProgress: 'Next (Step {step} of {steps})',
  open: 'Open the dialog',
  skip: 'Skip',
};
```

## Removing Step Counters

The step counter appears when `showProgress` is true. To remove it while keeping progress tracking:

### Method 1: Override nextLabelWithProgress

```typescript
const noCounterLocale = {
  back: 'Back',
  close: 'Close',
  last: 'Finish',
  next: 'Next',
  nextLabelWithProgress: 'Next', // Same as next, no counter
  skip: 'Skip',
};

// Usage
<Joyride
  locale={noCounterLocale}
  showProgress={true}  // Progress tracked internally but not shown
  // ... other props
/>
```

### Method 2: Custom Progress Display

```typescript
const customProgressLocale = {
  next: 'Continue',
  nextLabelWithProgress: 'Continue →', // Custom format without numbers
  last: 'Complete Tour',
};
```

## Multi-Language Implementation

### Language Configuration Object

```typescript
const languages = {
  en: {
    back: 'Back',
    close: 'Close',
    last: 'Finish',
    next: 'Next',
    nextLabelWithProgress: 'Next',
    skip: 'Skip',
  },
  ja: {
    back: '戻る',
    close: '閉じる',
    last: '完了',
    next: '次へ',
    nextLabelWithProgress: '次へ',
    skip: 'スキップ',
  },
  es: {
    back: 'Atrás',
    close: 'Cerrar',
    last: 'Finalizar',
    next: 'Siguiente',
    nextLabelWithProgress: 'Siguiente',
    skip: 'Omitir',
  },
  fr: {
    back: 'Retour',
    close: 'Fermer',
    last: 'Terminer',
    next: 'Suivant',
    nextLabelWithProgress: 'Suivant',
    skip: 'Passer',
  },
  de: {
    back: 'Zurück',
    close: 'Schließen',
    last: 'Fertig',
    next: 'Weiter',
    nextLabelWithProgress: 'Weiter',
    skip: 'Überspringen',
  },
  zh: {
    back: '返回',
    close: '关闭',
    last: '完成',
    next: '下一步',
    nextLabelWithProgress: '下一步',
    skip: '跳过',
  },
  ko: {
    back: '뒤로',
    close: '닫기',
    last: '완료',
    next: '다음',
    nextLabelWithProgress: '다음',
    skip: '건너뛰기',
  },
  pt: {
    back: 'Voltar',
    close: 'Fechar',
    last: 'Concluir',
    next: 'Próximo',
    nextLabelWithProgress: 'Próximo',
    skip: 'Pular',
  },
  ru: {
    back: 'Назад',
    close: 'Закрыть',
    last: 'Завершить',
    next: 'Далее',
    nextLabelWithProgress: 'Далее',
    skip: 'Пропустить',
  },
  ar: {
    back: 'رجوع',
    close: 'إغلاق',
    last: 'إنهاء',
    next: 'التالي',
    nextLabelWithProgress: 'التالي',
    skip: 'تخطي',
  },
};
```

### Implementation with Context

```typescript
// contexts/LanguageContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  locale: Locale;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');
  
  const locale = languages[language] || languages.en;
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, locale }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

// Usage in component
const TutorialComponent = () => {
  const { locale } = useLanguage();
  
  return (
    <Joyride
      locale={locale}
      // ... other props
    />
  );
};
```

## Dynamic Locale Switching

### With User Preferences

```typescript
const useTutorialLocale = () => {
  const [userLanguage, setUserLanguage] = useState(() => {
    // Get from localStorage or user settings
    return localStorage.getItem('preferredLanguage') || 
           navigator.language.split('-')[0] || 
           'en';
  });

  const locale = useMemo(() => {
    return languages[userLanguage] || languages.en;
  }, [userLanguage]);

  const changeLanguage = useCallback((lang: string) => {
    setUserLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
  }, []);

  return { locale, userLanguage, changeLanguage };
};

// Usage
const Tutorial = () => {
  const { locale, userLanguage, changeLanguage } = useTutorialLocale();
  
  return (
    <>
      <LanguageSelector 
        current={userLanguage} 
        onChange={changeLanguage} 
      />
      <Joyride
        locale={locale}
        // ... other props
      />
    </>
  );
};
```

### Auto-Detection Based on Browser

```typescript
const getAutoLocale = (): Locale => {
  const browserLang = navigator.language.toLowerCase();
  
  // Check exact match first
  if (languages[browserLang]) {
    return languages[browserLang];
  }
  
  // Check language code only (e.g., 'en' from 'en-US')
  const langCode = browserLang.split('-')[0];
  if (languages[langCode]) {
    return languages[langCode];
  }
  
  // Default to English
  return languages.en;
};

// Usage
<Joyride
  locale={getAutoLocale()}
  // ... other props
/>
```

## Advanced Localization Patterns

### 1. Locale with Rich Content

```typescript
const richLocale = {
  next: (
    <span>
      Continue 
      <kbd style={{ marginLeft: '8px' }}>→</kbd>
    </span>
  ),
  back: (
    <span>
      <kbd style={{ marginRight: '8px' }}>←</kbd>
      Go Back
    </span>
  ),
  skip: (
    <span style={{ opacity: 0.7 }}>
      Skip Tutorial
    </span>
  ),
};
```

### 2. Context-Aware Locale

```typescript
const getContextualLocale = (stepIndex: number, totalSteps: number): Locale => {
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;
  
  return {
    back: isFirstStep ? 'Cancel' : 'Previous',
    next: isLastStep ? 'Get Started' : 'Continue',
    nextLabelWithProgress: isLastStep 
      ? 'Complete Setup' 
      : `Continue (${stepIndex + 1}/${totalSteps})`,
    skip: 'Skip for now',
  };
};
```

### 3. Locale with Icons

```typescript
import { 
  ArrowLeft, 
  ArrowRight, 
  X, 
  Check, 
  SkipForward 
} from 'lucide-react';

const iconLocale = {
  back: (
    <>
      <ArrowLeft size={16} style={{ marginRight: '6px' }} />
      Back
    </>
  ),
  next: (
    <>
      Next
      <ArrowRight size={16} style={{ marginLeft: '6px' }} />
    </>
  ),
  last: (
    <>
      <Check size={16} style={{ marginRight: '6px' }} />
      Complete
    </>
  ),
  close: <X size={18} />,
  skip: (
    <>
      Skip
      <SkipForward size={14} style={{ marginLeft: '4px' }} />
    </>
  ),
};
```

### 4. Platform-Specific Locale

```typescript
const getPlatformLocale = (): Locale => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  if (isMobile) {
    return {
      next: 'Tap to Continue',
      back: 'Go Back',
      skip: 'Skip',
      close: '✕',
    };
  }
  
  return {
    next: `Click to Continue ${isMac ? '⌘' : 'Ctrl'}+→`,
    back: `Go Back ${isMac ? '⌘' : 'Ctrl'}+←`,
    skip: 'Skip (ESC)',
    close: 'Close (ESC)',
  };
};
```

## RTL Language Support

For right-to-left languages like Arabic or Hebrew:

### RTL Configuration

```typescript
const rtlLanguages = ['ar', 'he', 'fa', 'ur'];

const getRTLStyles = (language: string): Partial<Styles> => {
  const isRTL = rtlLanguages.includes(language);
  
  if (!isRTL) return {};
  
  return {
    tooltip: {
      direction: 'rtl',
      textAlign: 'right' as const,
    },
    tooltipContainer: {
      direction: 'rtl',
      textAlign: 'right' as const,
    },
    tooltipFooter: {
      direction: 'ltr', // Keep buttons in LTR
      flexDirection: 'row-reverse',
    },
    buttonNext: {
      marginLeft: '12px',
      marginRight: 0,
    },
    buttonBack: {
      marginRight: 0,
      marginLeft: '12px',
    },
    buttonClose: {
      left: '16px',
      right: 'auto',
    },
  };
};

// Usage
const language = 'ar';
const locale = languages[language];
const rtlStyles = getRTLStyles(language);

<Joyride
  locale={locale}
  styles={{
    ...baseStyles,
    ...rtlStyles,
  }}
  // ... other props
/>
```

### RTL-Aware Icons

```typescript
const getRTLAwareLocale = (language: string): Locale => {
  const isRTL = rtlLanguages.includes(language);
  const arrowNext = isRTL ? '←' : '→';
  const arrowBack = isRTL ? '→' : '←';
  
  return {
    next: `${languages[language].next} ${arrowNext}`,
    back: `${arrowBack} ${languages[language].back}`,
    // ... other properties
  };
};
```

## Step Counter Customization

### Custom Progress Format

```typescript
const customProgressFormats = {
  fraction: 'Next ({step}/{steps})',
  percentage: 'Next ({percentage}%)',
  dots: 'Next {dots}',
  minimal: '→',
};

const getProgressLocale = (format: keyof typeof customProgressFormats) => {
  return {
    nextLabelWithProgress: (step: number, total: number) => {
      switch (format) {
        case 'percentage':
          const percentage = Math.round((step / total) * 100);
          return `Next (${percentage}%)`;
        
        case 'dots':
          const dots = Array(total).fill('○');
          dots[step - 1] = '●';
          return `Next ${dots.join(' ')}`;
        
        default:
          return customProgressFormats[format]
            .replace('{step}', step.toString())
            .replace('{steps}', total.toString());
      }
    },
  };
};
```

## Locale Testing Utilities

```typescript
// utils/localeHelpers.ts
export const validateLocale = (locale: Locale): boolean => {
  const requiredKeys = ['back', 'close', 'last', 'next'];
  return requiredKeys.every(key => key in locale);
};

export const getMissingTranslations = (
  locale: Locale, 
  reference: Locale = languages.en
): string[] => {
  const missing: string[] = [];
  
  Object.keys(reference).forEach(key => {
    if (!(key in locale)) {
      missing.push(key);
    }
  });
  
  return missing;
};

// Usage
const customLocale = { next: 'Weiter', back: 'Zurück' };
const missing = getMissingTranslations(customLocale);
console.log('Missing translations:', missing);
// Output: ['close', 'last', 'skip', 'nextLabelWithProgress', 'open']
```

## Best Practices

1. **Always Override nextLabelWithProgress**
   - Even if not using progress, set it to match `next` to avoid surprises

2. **Consider Button Length**
   - Some languages need more space (German, Russian)
   - Test button layouts with longest translations

3. **Use Consistent Terminology**
   - Maintain same terms across your app
   - Create a translation glossary

4. **Handle Missing Translations**
   - Always provide fallback to default language
   - Log missing translations in development

5. **Test with Real Users**
   - Native speakers can spot awkward translations
   - Consider cultural differences in UX patterns

## Next Steps

- Review [Tutorial Implementation Guide](tutorial-implementation-guide.md) for setup
- See [Tutorial Styling Guide](tutorial-styling-guide.md) for visual customization
- Check [Tutorial Troubleshooting](tutorial-troubleshooting.md) for common issues