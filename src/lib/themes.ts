/**
 * Theme Configuration
 * Supports: Default, Dark, Miami Vice (80s neon), Pirate, and MI5 themes
 */

export type ThemeMode = 'default' | 'dark' | 'synthwave' | 'pirate' | 'mi5' | 'kroger';

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
  },
  synthwave: {
    name: 'synthwave',
    displayName: 'Miami Vice',
    emoji: '🌴',
    colors: {
      // Miami Vice inspired - #FF2BD6 (primary pink neon)
      primary: '316 100% 58%', // #FF2BD6
      primaryForeground: '225 50% 7%', // #070A1A (dark text on pink)
      // Secondary with cyan neon
      secondary: '186 100% 50%', // #00E5FF (cyan neon)
      secondaryForeground: '225 44% 12%', // #0B1030
      // Deep space background - #070A1A
      background: '225 50% 7%', // #070A1A
      foreground: '216 100% 97%', // #F2F6FF (primary text)
      // Card surfaces - #0B1030, #101A46
      card: '225 44% 12%', // #0B1030 (surface1)
      cardForeground: '216 100% 97%', // #F2F6FF
      popover: '225 44% 12%', // #0B1030
      popoverForeground: '216 100% 97%', // #F2F6FF
      // Muted using surface2 - #101A46
      muted: '224 64% 17%', // #101A46 (surface2)
      mutedForeground: '216 100% 85%', // rgba(242, 246, 255, 0.78) - secondary text
      // Accent cyan
      accent: '186 100% 50%', // #00E5FF (cyan neon)
      accentForeground: '225 44% 12%', // #0B1030
      // Danger state - #FF3B6B
      destructive: '348 100% 62%', // #FF3B6B
      destructiveForeground: '216 100% 97%', // #F2F6FF
      // Border with cyan at 22% opacity - rgba(0, 229, 255, 0.22)
      border: '186 100% 50%', // #00E5FF base (opacity applied in CSS)
      input: '225 50% 7%', // #070A1A (dark input bg)
      ring: '316 100% 58%' // #FF2BD6 (pink focus ring at 70% opacity)
    }
  },
  pirate: {
    name: 'pirate',
    displayName: 'Pirate',
    emoji: '🏴‍☠️',
    colors: {
      // Treasure gold primary - #D4AF37
      primary: '45 65% 52%', // #D4AF37 (treasure gold)
      primaryForeground: '20 45% 7%', // #1A0F0A (dark text on gold)
      // Deep crimson secondary - #8B0000
      secondary: '0 100% 27%', // #8B0000 (dark red)
      secondaryForeground: '38 56% 89%', // #F5E6D3 (bone white)
      // Dark wood background - #1A0F0A
      background: '20 45% 7%', // #1A0F0A (very dark brown)
      foreground: '38 56% 89%', // #F5E6D3 (weathered bone/cream)
      // Aged wood card surfaces - #2B1810
      card: '18 45% 13%', // #2B1810 (aged wood)
      cardForeground: '38 56% 89%', // #F5E6D3 (bone white)
      popover: '18 45% 13%', // #2B1810 (aged wood)
      popoverForeground: '38 56% 89%', // #F5E6D3
      // Muted brown
      muted: '25 40% 20%', // Dark brown
      mutedForeground: '38 45% 70%', // Light tan
      // Rusty red accent - #A52A2A
      accent: '0 59% 41%', // #A52A2A (rusty red/brown)
      accentForeground: '38 56% 89%', // #F5E6D3
      // Blood red destructive - #DC143C
      destructive: '348 83% 47%', // #DC143C (crimson)
      destructiveForeground: '38 56% 89%', // #F5E6D3
      // Rusty gold borders - #B8860B
      border: '43 89% 38%', // #B8860B (dark goldenrod)
      input: '18 45% 13%', // #2B1810 (aged wood input bg)
      ring: '45 65% 52%' // #D4AF37 (gold focus ring)
    }
  },
  mi5: {
    name: 'mi5',
    displayName: 'MI5',
    emoji: '🕵️',
    colors: {
      // Mission Impossible iconic red - #D30000
      primary: '0 100% 41%', // #D30000 (MI red)
      primaryForeground: '0 0% 100%', // #FFFFFF (white text on red)
      // Dark red secondary - #8B0000
      secondary: '0 100% 27%', // #8B0000 (dark red)
      secondaryForeground: '0 0% 91%', // #E8E8E8 (light gray)
      // Very dark background - #0A0A0A
      background: '0 0% 4%', // #0A0A0A (near black)
      foreground: '0 0% 91%', // #E8E8E8 (light gray)
      // Dark card surfaces - #1A1A1A
      card: '0 0% 10%', // #1A1A1A (dark gray)
      cardForeground: '0 0% 91%', // #E8E8E8
      popover: '0 0% 10%', // #1A1A1A
      popoverForeground: '0 0% 91%', // #E8E8E8
      // Muted dark gray
      muted: '0 0% 15%', // #262626
      mutedForeground: '0 0% 70%', // #B3B3B3
      // Steel blue accent - #4A90A4
      accent: '196 38% 47%', // #4A90A4 (steel blue)
      accentForeground: '0 0% 100%', // #FFFFFF
      // Bright red destructive - #FF0000
      destructive: '0 100% 50%', // #FF0000 (bright red)
      destructiveForeground: '0 0% 100%', // #FFFFFF
      // Red borders with opacity
      border: '0 100% 41%', // #D30000 (MI red)
      input: '0 0% 10%', // #1A1A1A (dark input bg)
      ring: '0 100% 41%' // #D30000 (red focus ring)
    }
  },
  kroger: {
    name: 'kroger',
    displayName: 'Kroger',
    emoji: '🛒',
    colors: {
      // Legacy tokens (maintained for backward compatibility)
      // Kroger brand blue - #084999 (Official Pantone 2728 C)
      primary: '217 92% 32%', // #084999 (NEW: Official Kroger brand blue)
      primaryForeground: '0 0% 100%', // #FFFFFF (white text on blue)
      // Dark gray buttons - #32373c
      secondary: '210 10% 23%', // #32373c (dark gray for buttons)
      secondaryForeground: '0 0% 100%', // #FFFFFF
      // Clean white background
      background: '0 0% 100%', // #FFFFFF (white)
      foreground: '220 25% 14%', // #1A1F2E (NEW: dark gray for better readability)
      // Card surfaces - light gray - #F7F8F8
      card: '200 17% 98%', // #F7F8F8 (light gray)
      cardForeground: '220 25% 14%', // #1A1F2E
      popover: '0 0% 100%', // #FFFFFF
      popoverForeground: '220 25% 14%', // #1A1F2E
      // Muted light gray
      muted: '200 17% 98%', // #F7F8F8 (light gray)
      mutedForeground: '218 17% 35%', // #4A5568 (medium gray)
      // Accent light blue - #64C2EA
      accent: '196 75% 66%', // #64C2EA (light blue)
      accentForeground: '0 0% 100%', // #FFFFFF
      // Destructive red
      destructive: '0 84.2% 60.2%', // Red
      destructiveForeground: '0 0% 100%', // #FFFFFF
      // Subtle borders
      border: '0 0% 92%', // Very subtle gray border
      input: '0 0% 100%', // #FFFFFF (white input bg)
      ring: '196 75% 66%', // #64C2EA (light blue focus ring)

      // Semantic tokens - Background
      backgroundDefault: '0 0% 100%', // #FFFFFF
      backgroundSecondary: '200 17% 98%', // #F7F8F8
      backgroundInverse: '220 25% 14%', // #1A1F2E

      // Semantic tokens - Surface
      surfacePrimary: '0 0% 100%', // #FFFFFF
      surfaceSecondary: '200 17% 98%', // #F7F8F8
      surfaceElevated: '0 0% 100%', // #FFFFFF

      // Semantic tokens - Brand
      brandPrimary: '217 92% 32%', // #084999 (Official Kroger blue)
      brandPrimaryHover: '217 92% 25%', // #06387A (20% darker)
      brandPrimaryActive: '217 92% 21%', // #052D66 (35% darker)
      brandSecondary: '196 75% 66%', // #64C2EA (light blue)
      brandSecondaryHover: '196 75% 59%', // #4AB3E0

      // Semantic tokens - Text
      textPrimary: '220 25% 14%', // #1A1F2E
      textSecondary: '218 17% 35%', // #4A5568
      textMuted: '220 14% 51%', // #718096
      textInverse: '0 0% 100%', // #FFFFFF
      textOnBrand: '0 0% 100%', // #FFFFFF

      // Semantic tokens - Border
      borderDefault: '0 0% 0%', // rgba(0, 0, 0, 0.08) - opacity applied in CSS
      borderSubtle: '0 0% 0%', // rgba(0, 0, 0, 0.04) - opacity applied in CSS
      borderFocus: '217 92% 32%', // #084999

      // Semantic tokens - Status
      statusSuccess: '150 82% 29%', // #0C8542
      statusSuccessBg: '150 53% 93%', // #E6F7ED
      statusWarning: '30 92% 44%', // #D97706
      statusWarningBg: '37 89% 95%', // #FEF3E6
      statusError: '0 73% 51%', // #DC2626
      statusErrorBg: '0 86% 95%', // #FEE6E6
      statusInfo: '199 94% 32%', // #0369A1
      statusInfoBg: '199 61% 94%', // #E6F3F9

      // Semantic tokens - Table
      tableHeaderBg: '200 17% 98%', // #F7F8F8
      tableHeaderText: '218 17% 35%', // #4A5568
      tableHeaderBorder: '0 0% 0%', // rgba(0, 0, 0, 0.08) - opacity applied in CSS
      tableRowBg: '0 0% 100%', // #FFFFFF
      tableRowHover: '217 92% 32%', // rgba(8, 73, 153, 0.04) - opacity applied in CSS
      tableRowSelected: '217 92% 32%', // rgba(8, 73, 153, 0.08) - opacity applied in CSS
      tableRowBorder: '0 0% 0%', // rgba(0, 0, 0, 0.06) - opacity applied in CSS
      tableCellText: '220 25% 14%', // #1A1F2E
      tableCellMuted: '220 14% 51%', // #718096

      // Semantic tokens - Button
      buttonPrimaryBg: '217 92% 32%', // #084999
      buttonPrimaryHover: '217 92% 25%', // #06387A
      buttonPrimaryActive: '217 92% 21%', // #052D66
      buttonPrimaryText: '0 0% 100%', // #FFFFFF
      buttonSecondaryBg: '200 17% 98%', // #F7F8F8
      buttonSecondaryHover: '220 16% 91%', // #E5E7EB
      buttonSecondaryActive: '220 13% 82%', // #D1D5DB
      buttonSecondaryText: '220 25% 14%', // #1A1F2E
      buttonOutlineBorder: '217 92% 32%', // rgba(8, 73, 153, 0.3) - opacity applied in CSS
      buttonOutlineHoverBg: '217 92% 32%', // rgba(8, 73, 153, 0.04) - opacity applied in CSS

      // Semantic tokens - Navigation
      navBackground: '217 92% 32%', // #084999
      navText: '0 0% 100%', // #FFFFFF
      navTextMuted: '0 0% 100%', // rgba(255, 255, 255, 0.7) - opacity applied in CSS
      navItemHover: '0 0% 100%', // rgba(255, 255, 255, 0.1) - opacity applied in CSS
      navItemActive: '196 75% 66%', // #64C2EA
      navBorder: '0 0% 100%', // rgba(255, 255, 255, 0.1) - opacity applied in CSS

      // Semantic tokens - Form
      formLabelText: '220 25% 14%', // #1A1F2E
      formLabelRequired: '0 73% 51%', // #DC2626
      inputBg: '0 0% 100%', // #FFFFFF
      inputBorder: '0 0% 0%', // rgba(0, 0, 0, 0.15) - opacity applied in CSS
      inputBorderHover: '217 92% 32%', // rgba(8, 73, 153, 0.3) - opacity applied in CSS
      inputBorderFocus: '217 92% 32%', // #084999
      inputText: '220 25% 14%', // #1A1F2E
      inputPlaceholder: '220 14% 51%', // #718096
      inputDisabledBg: '200 17% 98%', // #F7F8F8
      inputDisabledText: '220 13% 69%', // #A0AEC0
      inputErrorBorder: '0 73% 51%', // #DC2626
      inputErrorBg: '0 73% 51%', // rgba(220, 38, 38, 0.02) - opacity applied in CSS

      // Semantic tokens - Link
      linkDefault: '217 92% 32%', // #084999
      linkHover: '217 92% 25%', // #06387A
      linkVisited: '258 90% 43%', // #5B21B6 (purple)
      linkActive: '217 92% 21%' // #052D66
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
  root.classList.remove('theme-default', 'theme-dark', 'theme-synthwave', 'theme-pirate', 'theme-mi5', 'theme-kroger');
  root.classList.add(`theme-${theme}`);
}

export function getStoredTheme(): ThemeMode {
  const stored = localStorage.getItem('theme') as ThemeMode;
  return stored && themes[stored] ? stored : 'default';
}
