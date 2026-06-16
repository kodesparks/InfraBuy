export const colors = {
  // 1. Primary & Gradient (Material Design Tokens)
  primary: '#6731e2',
  secondary: '#0057bd',
  primaryGradient: ['#6731e2', '#ab8eff'], // Gradient for CTAs
  
  // 2. Surface Philosophy (The "No-Line" Rule)
  background: '#ECF0F3', // Premium Soft UI Base
  surface: '#ECF0F3', 
  surface_bright: '#f1f4f6',
  surface_container_low: '#e5e9eb', // Sectioning (alternate to white)
  surface_container: '#dee2e5',
  surface_container_high: '#d7dce0',
  surface_container_highest: '#cfd5d9',
  surface_container_lowest: '#ECF0F3', // Premium Card Color (Matches background for Soft UI)

  // 3. Text & Content (Editorial Authority)
  on_surface: '#2c2f31', // Grey-black for professional feel
  on_surface_variant: '#595c5e', // Use for secondary titles
  textPrimary: '#2c2f31',
  textSecondary: '#595c5e',
  textLight: '#8a8d8f',
  textWhite: '#ffffff',

  // 4. Accent & Alerts
  tertiary: '#9d365e', // Nuanced callouts
  error: '#b41340', // Critical alerts
  success: '#10B981', 
  warning: '#F59E0B', 
  info: '#3B82F6',

  // 5. Navigation & Interaction
  outline_variant: 'rgba(44, 47, 49, 0.15)', // "Ghost Border" at 15% opacity
  white: '#ffffff',
  black: '#2c2f31', // Swapped pure black for SPEC-defined grey-black
  lightGray: '#f5f7f9',
  darkGray: '#595c5e',
};

export const typography = {
  // Display & Headlines (700 Bold, Authoritative)
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.on_surface,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  heading2: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.on_surface,
    lineHeight: 28,
  },
  heading3: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.on_surface,
  },
  // Secondary Titles (500 Medium, on_surface_variant)
  title_md: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.on_surface_variant,
  },
  // Body (Generous line-heights 1.5x)
  body: {
    fontSize: 16,
    color: colors.on_surface,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    color: colors.on_surface_variant,
    lineHeight: 21,
  },
  // Labels (Uppercase metadata, +5% letter spacing)
  label_sm: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.textLight,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textWhite,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 32, // 2rem specification
  full: 9999,
};

// "Cloud Shadow" specification for floating elements
export const shadows = {
  cloud: {
    // Shadow for iOS - Premium Diffuse Elevation
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    // Elevation for Android
    elevation: 8,
  }
};


