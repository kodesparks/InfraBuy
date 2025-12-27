export const colors = {
  // Primary gradient colors (exact codes from user)
  primary: '#3B58EB', // Main primary
  primaryGradient: ['#3B58EB', '#723FED', '#6D41ED', '#4454EC', '#6C41EC', '#763DED', '#335CEB'],
  primaryLight: '#723FED', // Lighter purple
  primaryDark: '#335CEB', // Darker blue
  
  // Secondary colors
  secondary: '#4454EC', // Blue
  secondaryLight: '#6C41EC', // Light blue
  secondaryDark: '#3B58EB', // Dark blue
  
  // Accent colors
  accent: '#10B981', // Green for success/delivered
  accentLight: '#34D399', // Light green
  accentWarning: '#F59E0B', // Orange for warnings/offers
  accentInfo: '#3B82F6', // Blue for info
  
  // Background colors (light theme only)
  background: '#FFFFFF',
  backgroundLight: '#F8FAFC',
  backgroundDark: '#F1F5F9',
  
  // Text colors
  text: '#1F2937', // Primary text color (alias for textPrimary)
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textWhite: '#FFFFFF',
  
  // Status colors
  success: '#10B981', // Green
  warning: '#F59E0B', // Orange
  info: '#3B82F6', // Blue
  error: '#EF4444', // Red
  
  // Border and divider colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',
  
  // Card colors
  card: '#FFFFFF',
  cardLight: '#F8FAFC',
  
  // Navigation colors
  tabActive: '#3B58EB',
  tabInactive: '#9CA3AF',
  
  // Legacy colors (for backward compatibility)
  white: '#FFFFFF',
  black: '#000000',
  lightGray: '#F5F5F5',
  darkGray: '#666666',
};

export const typography = {
  heading: { 
    fontSize: 24, 
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 30,
  },
  heading2: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  heading3: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  body: { 
    fontSize: 16,
    color: colors.textPrimary,
  },
  bodySmall: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    color: colors.textLight,
  },
  link: {
    fontSize: 16,
    color: colors.primary,
    textAlign: 'center',
    marginTop: 20,
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
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};
