# Extreme Networks EDGE Theme Guide

This document provides the complete design system and theme specifications for maintaining aesthetic consistency across Extreme Networks applications.

## Technology Stack

- **CSS Framework**: Tailwind CSS v4 with CSS-first configuration
- **Fonts**: Google Fonts (Roboto, Roboto Mono, Poppins)
- **Design System**: Material Design 3 principles
- **Theme Support**: Light, Dark, and Custom branded themes (e.g., Kroger)

---

## Font Configuration

```css
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&family=Roboto:wght@300;400;500;700&family=Poppins:wght@400;600&display=swap');

:root {
  --font-family-sans: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-mono: 'Roboto Mono', 'SF Mono', Monaco, 'Cascadia Code', monospace;
}
```

### Typography Scale (Material Design)

| Token | Size | Usage |
|-------|------|-------|
| `--text-xs` | 0.75rem (12px) | Captions, labels |
| `--text-sm` | 0.875rem (14px) | Body small, buttons |
| `--text-base` | 1rem (16px) | Body text |
| `--text-lg` | 1.125rem (18px) | Subheadings |
| `--text-xl` | 1.25rem (20px) | H6 |
| `--text-2xl` | 1.5rem (24px) | H5 |
| `--text-3xl` | 1.875rem (30px) | H4 |
| `--text-4xl` | 2.25rem (36px) | H3 |
| `--text-5xl` | 3rem (48px) | H2 |
| `--text-6xl` | 6rem (96px) | H1 |

### Font Weights

```css
:root {
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

---

## Color System

### Dark Theme (Default)

Based on Material Design Dark Theme with `#121212` surface.

```css
:root {
  /* Base Colors */
  --background: #121212;
  --foreground: rgba(255, 255, 255, 0.87);

  /* Card & Popover */
  --card: #121212;
  --card-foreground: rgba(255, 255, 255, 0.87);
  --popover: #121212;
  --popover-foreground: rgba(255, 255, 255, 0.87);

  /* Primary: Material Violet 200 */
  --primary: #BB86FC;
  --primary-foreground: rgba(0, 0, 0, 0.87);

  /* Secondary: Material Teal 200 */
  --secondary: #03DAC5;
  --secondary-foreground: rgba(0, 0, 0, 0.87);

  /* Muted */
  --muted: #121212;
  --muted-foreground: rgba(255, 255, 255, 0.60);

  /* Accent */
  --accent: #121212;
  --accent-foreground: rgba(255, 255, 255, 0.87);

  /* Status Colors */
  --destructive: #CF6679;
  --destructive-foreground: rgba(0, 0, 0, 0.87);
  --success: #81C784;
  --success-foreground: rgba(0, 0, 0, 0.87);
  --warning: #FFB74D;
  --warning-foreground: rgba(0, 0, 0, 0.87);
  --info: #03DAC5;
  --info-foreground: rgba(0, 0, 0, 0.87);

  /* Interactive */
  --border: rgba(255, 255, 255, 0.12);
  --input: #121212;
  --input-background: #121212;
  --ring: #BB86FC;

  /* Chart Colors */
  --chart-1: #BB86FC;
  --chart-2: #03DAC5;
  --chart-3: #FFB74D;
  --chart-4: #CF6679;
  --chart-5: #81C784;

  --radius: 0.25rem;
}
```

### Light Theme

```css
.light {
  --background: #ffffff;
  --foreground: rgba(0, 0, 0, 0.87);
  --card: #ffffff;
  --card-foreground: rgba(0, 0, 0, 0.87);
  --popover: #ffffff;
  --popover-foreground: rgba(0, 0, 0, 0.87);

  /* Primary: Material Violet (light variant) */
  --primary: #6200EE;
  --primary-foreground: #ffffff;

  /* Secondary: Material Teal (light variant) */
  --secondary: #018786;
  --secondary-foreground: #ffffff;

  --muted: #ffffff;
  --muted-foreground: rgba(0, 0, 0, 0.60);
  --accent: #ffffff;
  --accent-foreground: rgba(0, 0, 0, 0.87);

  /* Status Colors */
  --destructive: #B00020;
  --destructive-foreground: #ffffff;
  --success: #00C853;
  --success-foreground: #ffffff;
  --warning: #FF6F00;
  --warning-foreground: #ffffff;
  --info: #018786;
  --info-foreground: #ffffff;

  --border: rgba(0, 0, 0, 0.12);
  --input: #ffffff;
  --ring: #6200EE;

  /* Chart Colors */
  --chart-1: #6200EE;
  --chart-2: #018786;
  --chart-3: #FF6F00;
  --chart-4: #B00020;
  --chart-5: #00C853;
}
```

### Sidebar Colors

```css
/* Dark Theme Sidebar */
:root {
  --sidebar: #121212;
  --sidebar-foreground: rgba(255, 255, 255, 0.87);
  --sidebar-primary: #BB86FC;
  --sidebar-primary-foreground: rgba(0, 0, 0, 0.87);
  --sidebar-accent: #121212;
  --sidebar-accent-foreground: rgba(255, 255, 255, 0.87);
  --sidebar-border: rgba(255, 255, 255, 0.12);
  --sidebar-ring: #BB86FC;
}

/* Light Theme Sidebar */
.light {
  --sidebar: #ffffff;
  --sidebar-foreground: rgba(0, 0, 0, 0.87);
  --sidebar-primary: #6200EE;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #ffffff;
  --sidebar-accent-foreground: rgba(0, 0, 0, 0.87);
  --sidebar-border: rgba(0, 0, 0, 0.12);
  --sidebar-ring: #6200EE;
}
```

---

## Surface Elevation (Material Design)

For depth and hierarchy, use white overlays on dark surfaces:

```css
:root {
  --surface-0dp: #121212;
  --surface-1dp: rgba(255, 255, 255, 0.05);
  --surface-2dp: rgba(255, 255, 255, 0.07);
  --surface-3dp: rgba(255, 255, 255, 0.08);
  --surface-4dp: rgba(255, 255, 255, 0.09);
  --surface-6dp: rgba(255, 255, 255, 0.11);
  --surface-8dp: rgba(255, 255, 255, 0.12);
  --surface-12dp: rgba(255, 255, 255, 0.14);
  --surface-16dp: rgba(255, 255, 255, 0.15);
  --surface-24dp: rgba(255, 255, 255, 0.16);
}
```

---

## Kroger Brand Theme (Example Custom Theme)

This demonstrates how to create custom branded themes:

```css
.theme-kroger {
  /* Base */
  --background: #ffffff !important;
  --foreground: #1A1F2E !important;
  --card: #F7F8F8 !important;
  --card-foreground: #1A1F2E !important;

  /* Brand Colors */
  --primary: #084999 !important; /* Official Kroger blue (Pantone 2728 C) */
  --primary-foreground: #ffffff !important;
  --secondary: #32373c !important;
  --secondary-foreground: #ffffff !important;
  --accent: #64C2EA !important; /* Light blue accent */
  --accent-foreground: #ffffff !important;

  /* Status */
  --destructive: #DC2626 !important;
  --success: #0C8542 !important;
  --warning: #D97706 !important;
  --info: #0369A1 !important;

  /* Sidebar - Dark blue for contrast */
  --sidebar: #05316B !important;
  --sidebar-foreground: #ffffff !important;
  --sidebar-primary: #64C2EA !important;
  --sidebar-accent: rgba(100, 194, 234, 0.15) !important;
  --sidebar-border: rgba(255, 255, 255, 0.1) !important;

  /* Custom font for Kroger */
  --font-family-sans: 'Poppins', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif !important;
}
```

---

## Semantic Token System

For complex branded themes, use semantic tokens for consistent theming:

### Background Tokens
```css
--background-default    /* Main page background */
--background-secondary  /* Card/section backgrounds */
--background-inverse    /* Inverted sections */
```

### Surface Tokens
```css
--surface-primary       /* Primary content areas */
--surface-secondary     /* Secondary content areas */
--surface-elevated      /* Elevated components (modals, dropdowns) */
```

### Text Tokens
```css
--text-primary          /* Main text */
--text-secondary        /* Supporting text */
--text-muted            /* Disabled/placeholder text */
--text-inverse          /* Text on dark backgrounds */
--text-on-brand         /* Text on brand-colored backgrounds */
```

### Status Tokens
```css
--status-success        /* Success color */
--status-success-bg     /* Success background tint */
--status-warning        /* Warning color */
--status-warning-bg     /* Warning background tint */
--status-error          /* Error color */
--status-error-bg       /* Error background tint */
--status-info           /* Info color */
--status-info-bg        /* Info background tint */
```

### Button Tokens
```css
--button-primary-bg
--button-primary-hover
--button-primary-active
--button-primary-text
--button-secondary-bg
--button-secondary-hover
--button-secondary-text
```

### Table Tokens
```css
--table-header-bg
--table-header-text
--table-row-bg
--table-row-hover
--table-row-selected
--table-row-border
```

---

## CSS Utility Classes

### Status Colors
```css
.status-healthy    /* color: var(--success) */
.status-warning    /* color: var(--warning) */
.status-critical   /* color: var(--destructive) */

.bg-status-healthy /* Success background with contrast text */
.bg-status-warning /* Warning background with contrast text */
.bg-status-critical /* Destructive background with contrast text */
```

### Text Emphasis (Material Design)
```css
.text-high-emphasis    /* 87% opacity - primary text */
.text-medium-emphasis  /* 60% opacity - secondary text */
.text-disabled         /* 38% opacity - disabled text */
```

### Surface Elevation
```css
.surface-0dp  /* Base surface, no elevation */
.surface-1dp  /* Slight elevation (cards) */
.surface-2dp  /* Medium elevation (raised cards) */
.surface-4dp  /* High elevation (modals) */
.surface-8dp  /* Highest elevation (dialogs) */
```

### Material Typography
```css
.text-headline-1 through .text-headline-6
.text-subtitle-1, .text-subtitle-2
.text-body-1, .text-body-2
.text-button
.text-caption
.text-overline
```

---

## Transitions

All theme transitions use Material Design easing:

```css
transition: background-color 200ms cubic-bezier(0.4, 0, 0.2, 1),
            color 200ms cubic-bezier(0.4, 0, 0.2, 1),
            border-color 200ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## Accessibility

### High Contrast Support
```css
@media (prefers-contrast: high) {
  :root {
    --foreground: rgba(255, 255, 255, 1.0);
    --primary: #D1C4E9;
    --secondary: #B2DFDB;
    --border: rgba(255, 255, 255, 0.38);
  }
}
```

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Branding Configuration

```typescript
interface BrandConfig {
  name: string;        // Short name: "EDGE"
  fullName: string;    // Full name: "Extreme Platform ONE | EDGE"
  tagline?: string;    // "Edge Data Gateway Engine"
  logo: string;        // Path to logo SVG
  icon: string;        // Path to favicon
}
```

---

## Color Reference Quick Guide

### Dark Theme Palette
| Purpose | Color | Hex |
|---------|-------|-----|
| Background | Material Dark | `#121212` |
| Primary | Violet 200 | `#BB86FC` |
| Secondary | Teal 200 | `#03DAC5` |
| Error | Pink 200 | `#CF6679` |
| Success | Green 300 | `#81C784` |
| Warning | Amber 300 | `#FFB74D` |
| Text High | White 87% | `rgba(255,255,255,0.87)` |
| Text Medium | White 60% | `rgba(255,255,255,0.60)` |
| Dividers | White 12% | `rgba(255,255,255,0.12)` |

### Light Theme Palette
| Purpose | Color | Hex |
|---------|-------|-----|
| Background | White | `#ffffff` |
| Primary | Violet 600 | `#6200EE` |
| Secondary | Teal 700 | `#018786` |
| Error | Red 900 | `#B00020` |
| Success | Green A700 | `#00C853` |
| Warning | Amber 800 | `#FF6F00` |
| Text High | Black 87% | `rgba(0,0,0,0.87)` |
| Text Medium | Black 60% | `rgba(0,0,0,0.60)` |
| Dividers | Black 12% | `rgba(0,0,0,0.12)` |

---

## Implementation Notes

1. **Theme Switching**: Themes are applied by adding class to `<html>` element: `.light`, `.dark`, or `.theme-kroger`
2. **CSS Variables**: All colors use CSS custom properties for runtime switching
3. **Tailwind v4**: Uses CSS-first configuration via `@theme inline` directive
4. **No Scrollbars**: Application hides scrollbars by default (use `.show-scrollbar` class when needed)

---

## Usage with Claude Code

When building a new app for the same company, copy the relevant CSS variables into your `globals.css` or equivalent stylesheet. Ensure you:

1. Import the Google Fonts
2. Set up the CSS custom properties in `:root`
3. Create `.light` and `.dark` class variants
4. Use the same transition timing for theme changes
5. Follow the Material Design elevation system for depth

This ensures visual consistency across all Extreme Networks applications.
