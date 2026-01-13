/**
 * Theme Configuration
 * Supports: Default and Dark themes
 */

export type ThemeMode = 'default' | 'dark';

export interface Theme {
  name: string;
  displayName: string;
  colors: {
    // Legacy tokens (maintained for backward compatibility)
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;

    // Semantic tokens - Background
    backgroundDefault?: string;
    backgroundSecondary?: string;
    backgroundInverse?: string;

    // Semantic tokens - Surface
    surfacePrimary?: string;
    surfaceSecondary?: string;
    surfaceElevated?: string;

    // Semantic tokens - Brand
    brandPrimary?: string;
    brandPrimaryHover?: string;
    brandPrimaryActive?: string;
    brandSecondary?: string;
    brandSecondaryHover?: string;

    // Semantic tokens - Text
    textPrimary?: string;
    textSecondary?: string;
    textMuted?: string;
    textInverse?: string;
    textOnBrand?: string;

    // Semantic tokens - Border
    borderDefault?: string;
    borderSubtle?: string;
    borderFocus?: string;

    // Semantic tokens - Status
    statusSuccess?: string;
    statusSuccessBg?: string;
    statusWarning?: string;
    statusWarningBg?: string;
    statusError?: string;
    statusErrorBg?: string;
    statusInfo?: string;
    statusInfoBg?: string;

    // Semantic tokens - Table
    tableHeaderBg?: string;
    tableHeaderText?: string;
    tableHeaderBorder?: string;
    tableRowBg?: string;
    tableRowHover?: string;
    tableRowSelected?: string;
    tableRowBorder?: string;
    tableCellText?: string;
    tableCellMuted?: string;

    // Semantic tokens - Button
    buttonPrimaryBg?: string;
    buttonPrimaryHover?: string;
    buttonPrimaryActive?: string;
    buttonPrimaryText?: string;
    buttonSecondaryBg?: string;
    buttonSecondaryHover?: string;
    buttonSecondaryActive?: string;
    buttonSecondaryText?: string;
    buttonOutlineBorder?: string;
    buttonOutlineHoverBg?: string;

    // Semantic tokens - Navigation
    navBackground?: string;
    navText?: string;
    navTextMuted?: string;
    navItemHover?: string;
    navItemActive?: string;
    navBorder?: string;

    // Semantic tokens - Form
    formLabelText?: string;
    formLabelRequired?: string;
    inputBg?: string;
    inputBorder?: string;
    inputBorderHover?: string;
    inputBorderFocus?: string;
    inputText?: string;
    inputPlaceholder?: string;
    inputDisabledBg?: string;
    inputDisabledText?: string;
    inputErrorBorder?: string;
    inputErrorBg?: string;

    // Semantic tokens - Link
    linkDefault?: string;
    linkHover?: string;
    linkVisited?: string;
    linkActive?: string;
  };
  emoji?: string;
}

export const themes: Record<ThemeMode, Theme> = {
  default: {
    name: 'default',
    displayName: 'Default',
    emoji: '🌐',
    colors: {
      primary: '222.2 47.4% 11.2%',
      primaryForeground: '210 40% 98%',
      secondary: '210 40% 96.1%',
      secondaryForeground: '222.2 47.4% 11.2%',
      background: '0 0% 100%',
      foreground: '222.2 47.4% 11.2%',
      card: '0 0% 100%',
      cardForeground: '222.2 47.4% 11.2%',
      popover: '0 0% 100%',
      popoverForeground: '222.2 47.4% 11.2%',
      muted: '210 40% 96.1%',
      mutedForeground: '215.4 16.3% 46.9%',
      accent: '210 40% 96.1%',
      accentForeground: '222.2 47.4% 11.2%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
      border: '214.3 31.8% 91.4%',
      input: '214.3 31.8% 91.4%',
      ring: '222.2 47.4% 11.2%'
    }
  },
  dark: {
    name: 'dark',
    displayName: 'Dark',
    emoji: '🌙',
    colors: {
      primary: '210 40% 98%',
      primaryForeground: '222.2 47.4% 11.2%',
      secondary: '217.2 32.6% 17.5%',
      secondaryForeground: '210 40% 98%',
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%',
      card: '222.2 84% 4.9%',
      cardForeground: '210 40% 98%',
      popover: '222.2 84% 4.9%',
      popoverForeground: '210 40% 98%',
      muted: '217.2 32.6% 17.5%',
      mutedForeground: '215 20.2% 65.1%',
      accent: '217.2 32.6% 17.5%',
      accentForeground: '210 40% 98%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '210 40% 98%',
      border: '217.2 32.6% 17.5%',
      input: '217.2 32.6% 17.5%',
      ring: '212.7 26.8% 83.9%'
    }
  }
};

export function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  const selectedTheme = themes[theme];

  // Apply CSS variables
  Object.entries(selectedTheme.colors).forEach(([key, value]) => {
    const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });

  // Store preference
  localStorage.setItem('theme', theme);

  // Add theme class for additional styling
  root.classList.remove('theme-default', 'theme-dark');
  root.classList.add(`theme-${theme}`);
}

export function getStoredTheme(): ThemeMode {
  const stored = localStorage.getItem('theme') as ThemeMode;
  return stored && themes[stored] ? stored : 'default';
}
