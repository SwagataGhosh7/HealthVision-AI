# Bilingual Healthcare Dashboard UI/UX Guide

## Table of Contents

1. [Design Principles](#design-principles)
2. [Bilingual Layout Patterns](#bilingual-layout-patterns)
3. [Typography & Hierarchy](#typography--hierarchy)
4. [Color Coding for Medical Context](#color-coding-for-medical-context)
5. [Responsive Bilingual Design](#responsive-bilingual-design)
6. [Accessibility Standards](#accessibility-standards)
7. [Animation & Micro-interactions](#animation--micro-interactions)
8. [Component Gallery](#component-gallery)

---

## Design Principles

### 1. **Progressive Disclosure**

Show English only when appropriate, bilingual when needed.

```
English Mode:
┌────────────────────────────────────┐
│ Analysis Results                   │
│ ════════════════════              │
│                                    │
│ Diagnosis: Mild hypertension      │
│                                    │
└────────────────────────────────────┘

Bengali Mode (Same Space, Better UX):
┌────────────────────────────────────┐
│ বিশ্লেষণ ফলাফল                     │
│ Analysis Results                   │
│ ════════════════════              │
│                                    │
│ রোগ নির্ণয়: হালকা উচ্চ রক্তচাপ     │
│ Diagnosis: Mild hypertension      │
│                                    │
└────────────────────────────────────┘
```

### 2. **Language Independence**

Medical data should not depend on language selection.

✅ **Good**: Store data in structured format, render based on language
```json
{
  "vitals": {
    "heartRate": 98,
    "severity": "moderate"
  }
}
```

❌ **Bad**: Store language-dependent strings
```json
{
  "result": "Mild heart condition"
}
```

### 3. **Cognitive Load Management**

Bilingual display can increase cognitive load. Mitigate by:

- Clear visual hierarchy
- Semantic grouping
- Consistent spacing
- Distinct font weights
- Color-coded severity

### 4. **Cultural Sensitivity**

Healthcare is personal. Respect differences:

- Bengali users may prefer local terminology
- Medical accuracy ≥ literal translation
- Context matters (clinical vs. patient-friendly)
- Icons may have different interpretations

---

## Bilingual Layout Patterns

### Pattern 1: Stacked (Recommended for Mobile)

**Best for small screens**

```
┌─────────────────────────┐
│ রোগ নির্ণয় (Primary)    │
│ Diagnosis (Secondary)   │
│                         │
│ উচ্চ রক্তচাপ (Content) │
│ Hypertension           │
│ (Lighter, smaller)      │
└─────────────────────────┘
```

**CSS:**
```css
.bilingual-stacked {
  display: flex;
  flex-direction: column;
  gap: 0.25rem; /* 1 space unit */
}

.bilingual-stacked .primary {
  font-weight: 600;
  font-size: 1rem;
  color: #000;
}

.bilingual-stacked .secondary {
  font-weight: 400;
  font-size: 0.875rem;
  color: #666;
  font-style: italic;
}
```

### Pattern 2: Inline with Visual Separator (Desktop)

**Best for larger screens**

```
রোগ নির্ণয় | Diagnosis
```

**CSS:**
```css
.bilingual-inline {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.bilingual-inline .separator {
  width: 2px;
  height: 1.2em;
  background: #ddd;
  opacity: 0.5;
}
```

### Pattern 3: Tooltip/Expandable

**Best for extremely long text or expert users**

```
Diagnosis: Hypertension [📖]

[On hover/click]
বাংলা: উচ্চ রক্তচাপ
```

**React Implementation:**
```typescript
<HoverCard>
  <HoverCardTrigger>
    <span>{englishText}</span>
    <HelpCircle className="h-4 w-4 opacity-50" />
  </HoverCardTrigger>
  <HoverCardContent>
    <p className="text-sm">{bengaliText}</p>
  </HoverCardContent>
</HoverCard>
```

### Pattern 4: Side-by-Side (For Comparison)

**Best for learning/training**

```
┌─────────────────────────────┐
│ English          | Bengali   │
├─────────────────────────────┤
│ Hypertension     | উচ্চ রক্তচাপ │
│ Fever            | জ্বর       │
│ Medication       | ওষুধ      │
└─────────────────────────────┘
```

---

## Typography & Hierarchy

### Font Selection

**For Bengali Text:**
- Recommended: Noto Sans Bengali (Google Fonts)
- Fallback: DejaVu Sans, Arial Unicode MS
- Don't use: Comic Sans, Decorative fonts

**For English Text:**
- Recommended: Inter, Roboto, or system fonts
- Ensure consistency with brand

### Size & Weight Hierarchy

```
┌─────────────────────────────────────┐
│ Title (Bilingual)                   │
│ ← 24px, Semibold (Primary)          │
│ ← 14px, Regular, Italic (Secondary) │
│                                     │
│ Body Text (Bilingual)               │
│ ← 16px, Regular (Primary)           │
│ ← 14px, Regular, Italic (Secondary) │
│                                     │
│ Small Text (Bilingual)              │
│ ← 14px, Medium (Primary)            │
│ ← 12px, Regular, Italic (Secondary) │
└─────────────────────────────────────┘
```

### Tailwind CSS Typography Scale

```typescript
// Title
<div className="space-y-1">
  <p className="text-2xl font-semibold text-foreground">বিশ্লেষণ ফলাফল</p>
  <p className="text-sm font-normal italic text-muted-foreground">Analysis Results</p>
</div>

// Body
<div className="space-y-1">
  <p className="text-base font-normal text-foreground">উচ্চ রক্তচাপ সনাক্ত</p>
  <p className="text-sm font-normal italic text-muted-foreground">Hypertension detected</p>
</div>

// Small
<div className="space-y-1">
  <p className="text-sm font-medium text-foreground">গুরুতর সতর্কতা</p>
  <p className="text-xs font-normal italic text-muted-foreground">Severe warning</p>
</div>
```

---

## Color Coding for Medical Context

### Severity Levels

| Level | Color | Hex | Usage |
|-------|-------|-----|-------|
| Mild | Green | #10B981 | Minor conditions, routine |
| Moderate | Orange | #F59E0B | Requires attention |
| Severe | Red | #EF4444 | Urgent care needed |
| Neutral | Blue | #3B82F6 | Information, tips |
| Critical | Deep Red | #DC2626 | Emergency |

### Implementation

```typescript
const severityColorMap = {
  mild: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-l-4 border-green-500',
    text: 'text-green-900 dark:text-green-100',
    icon: '✓',
  },
  moderate: {
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    border: 'border-l-4 border-orange-500',
    text: 'text-orange-900 dark:text-orange-100',
    icon: '⚠️',
  },
  severe: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-l-4 border-red-500',
    text: 'text-red-900 dark:text-red-100',
    icon: '🚨',
  },
};

export const SeverityCard = ({ severity, content }) => {
  const styles = severityColorMap[severity];
  return (
    <div className={`${styles.bg} ${styles.border} p-4 rounded-lg`}>
      <div className={styles.text}>
        <span className="mr-2">{styles.icon}</span>
        <BilingualText content={content} />
      </div>
    </div>
  );
};
```

### Dark Mode Considerations

```typescript
// High contrast in dark mode
const darkModeTextColor = {
  primary: 'text-gray-100 dark:text-gray-50',  // Almost white
  secondary: 'text-gray-400 dark:text-gray-500', // Medium gray
  muted: 'text-gray-600 dark:text-gray-400',     // Darker gray
};

// Ensure WCAG AA compliance (4.5:1 contrast ratio minimum)
```

---

## Responsive Bilingual Design

### Mobile-First Approach

```css
/* Mobile (< 640px): Stacked layout */
@media (max-width: 640px) {
  .bilingual-container {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .bilingual-primary {
    font-size: 1rem;
  }
  
  .bilingual-secondary {
    font-size: 0.875rem;
  }
}

/* Tablet (640px - 1024px): Adjustable layout */
@media (min-width: 640px) and (max-width: 1024px) {
  .bilingual-container {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
  }
  
  .bilingual-secondary {
    max-width: 40%;
  }
}

/* Desktop (> 1024px): Full layout */
@media (min-width: 1024px) {
  .bilingual-container {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    align-items: center;
  }
  
  .bilingual-secondary {
    max-width: 50%;
  }
}
```

### Responsive Typography

```typescript
export const ResponsiveTitle = ({ content, language }) => (
  <h2 className="
    text-lg sm:text-xl md:text-2xl lg:text-3xl
    font-semibold md:font-bold
    leading-tight
  ">
    <BilingualText content={content} currentLanguage={language} />
  </h2>
);

export const ResponsiveBody = ({ content, language }) => (
  <p className="
    text-sm sm:text-base md:text-lg
    font-normal
    leading-relaxed md:leading-loose
  ">
    <BilingualText content={content} currentLanguage={language} />
  </p>
);
```

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

#### 1. Color Contrast

```css
/* ✓ Minimum 4.5:1 for normal text */
.primary-text {
  color: #000000; /* RGB(0,0,0) */
  background: #ffffff; /* RGB(255,255,255) */
  contrast-ratio: 21:1; /* Exceeds minimum */
}

/* ✓ Minimum 3:1 for large text (18pt+) */
.secondary-text {
  color: #666666; /* RGB(102,102,102) */
  background: #ffffff; /* RGB(255,255,255) */
  contrast-ratio: 7:1; /* Exceeds minimum */
}

/* ❌ Do not use */
.bad-contrast {
  color: #cccccc; /* RGB(204,204,204) */
  background: #ffffff; /* RGB(255,255,255) */
  contrast-ratio: 1.5:1; /* Too low */
}
```

#### 2. Language Tags

```jsx
// ✓ Correct: Use lang attribute for screen readers
<div lang="bn">
  <p>বাংলা টেক্সট</p>
</div>

<div lang="en">
  <p>English text</p>
</div>

// For bilingual content
<div>
  <p lang="bn">বাংলা টেক্সট</p>
  <p lang="en">English text</p>
</div>
```

#### 3. ARIA Labels

```jsx
export const BilingualText = ({ content, language }) => (
  <div
    role="region"
    aria-label={`${language === 'bn' ? 'Bengali' : 'English'} content`}
    lang={language === 'bn' ? 'bn' : 'en'}
  >
    {/* content */}
  </div>
);
```

#### 4. Focus and Keyboard Navigation

```css
/* ✓ Visible focus indicator */
button:focus-visible,
a:focus-visible {
  outline: 3px solid #0066cc;
  outline-offset: 2px;
}

/* ✓ Skip to main content link */
.skip-to-main {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
}

.skip-to-main:focus {
  top: 0;
}
```

**React Implementation:**
```typescript
export const AccessibleBilingualApp = () => (
  <>
    <a href="#main-content" className="skip-to-main">
      Skip to main content
    </a>
    <main id="main-content">
      {/* Your bilingual content */}
    </main>
  </>
);
```

---

## Animation & Micro-interactions

### Smooth Language Transitions

```typescript
export const BilingualTransition = ({ content, language, changing }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
    key={language}
  >
    <BilingualText content={content} currentLanguage={language} />
  </motion.div>
);
```

### Loading States

```typescript
export const BilingualSkeleton = ({ language }) => (
  <div className="space-y-2 animate-pulse">
    {/* Primary skeleton */}
    <div className="h-6 bg-gray-300 rounded w-3/4" />
    
    {/* Secondary skeleton (only in Bengali) */}
    {language === 'bn' && (
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    )}
  </div>
);
```

### Severity Indicator Animation

```typescript
export const SeverityIndicator = ({ severity }) => {
  const colors = {
    mild: 'bg-green-500',
    moderate: 'bg-orange-500',
    severe: 'bg-red-500',
  };

  return (
    <motion.div
      className={`${colors[severity]} h-2 rounded-full`}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      origin="left"
    />
  );
};
```

---

## Component Gallery

### Complete Example: Analysis Card

```typescript
export const AnalysisCard = ({ 
  title, 
  content, 
  severity, 
  icon, 
  language 
}) => {
  const severityStyles = {
    mild: {
      bg: 'bg-green-50 dark:bg-green-950/20',
      border: 'border-l-4 border-green-500',
      badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    },
    moderate: {
      bg: 'bg-orange-50 dark:bg-orange-950/20',
      border: 'border-l-4 border-orange-500',
      badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    },
    severe: {
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-l-4 border-red-500',
      badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    },
  };

  const styles = severityStyles[severity];

  return (
    <motion.div
      className={`${styles.bg} ${styles.border} rounded-lg p-6 space-y-4`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          {icon && <div className="mt-1 flex-shrink-0">{icon}</div>}
          <div className="flex-1">
            <BilingualText
              content={title}
              currentLanguage={language}
              type="title"
            />
          </div>
        </div>
        
        {/* Severity Badge */}
        <div className={`${styles.badge} px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0`}>
          {severity.toUpperCase()}
        </div>
      </div>

      {/* Content */}
      <div className={icon ? 'ml-8' : ''}>
        <BilingualText
          content={content}
          currentLanguage={language}
          type="body"
        />
      </div>

      {/* Action Button */}
      <div className={icon ? 'ml-8' : ''}>
        <button className="
          text-sm font-medium
          text-primary hover:text-primary/80
          transition-colors
          inline-flex items-center gap-1
        ">
          {language === 'bn' ? 'আরও জানুন' : 'Learn more'}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};
```

---

## Summary: Best Practices Checklist

- [ ] Use semantic HTML with language attributes
- [ ] Maintain 4.5:1 contrast ratio for primary, 3:1 for large text
- [ ] Stack bilingual text on mobile, adjust on tablet/desktop
- [ ] Use consistent font family (Noto Sans Bengali for Bengali)
- [ ] Provide clear visual hierarchy with weight and size
- [ ] Color-code severity with appropriate icons
- [ ] Test with screen readers (NVDA, JAWS, VoiceOver)
- [ ] Support keyboard navigation throughout
- [ ] Smooth transitions between language changes
- [ ] Include skip-to-content links
- [ ] Test with real Bengali speakers
- [ ] Load Bengali fonts from CDN (reduce initial payload)
- [ ] Support RTL layout if needed (future enhancement)
- [ ] A/B test with users in target demographic

---

## Resources

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Google Fonts Bengali](https://fonts.google.com/?subset=bengali)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Framer Motion Animations](https://www.framer.com/motion/)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
