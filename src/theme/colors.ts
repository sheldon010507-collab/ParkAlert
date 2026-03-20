// Material Design Color System
// Based on Material Design 3 (M3)

export const colors = {
  // Primary Palette
  primary: '#1A73E8',
  primaryContainer: '#D3E3FD',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#041E49',

  // Secondary Palette
  secondary: '#5F6368',
  secondaryContainer: '#E8EAED',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#202124',

  // Tertiary Palette
  tertiary: '#188038',
  tertiaryContainer: '#CEEAD6',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#0D652D',

  // Error Palette
  error: '#EA4335',
  errorContainer: '#FCE8E6',
  onError: '#FFFFFF',
  onErrorContainer: '#680003',

  // Warning Palette
  warning: '#FBBC05',
  warningContainer: '#FEF3C7',
  onWarning: '#202124',
  onWarningContainer: '#8C6B00',

  // Surface Palette
  surface: '#FFFFFF',
  surfaceVariant: '#F1F3F4',
  surfaceDim: '#E8EAED',
  onSurface: '#202124',
  onSurfaceVariant: '#5F6368',

  // Background
  background: '#F6F6F6',
  onBackground: '#202124',

  // Outline
  outline: '#DADCE0',
  outlineVariant: '#E8EAED',

  // Inverse
  inverseSurface: '#303134',
  inverseOnSurface: '#F8F9FA',
  inversePrimary: '#8AB4F8',

  // Elevation Shadows
  elevation1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 1,
  },
  elevation2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  elevation3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  elevation4: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
}

// Type colors for Warden
export const wardenColors = {
  council: '#EA4335',    // Red - most urgent
  private: '#FBBC05',    // Yellow - medium
  police: '#1A73E8',     // Blue - informational
}

export const wardenLabels: Record<string, string> = {
  council: 'Council',
  private: 'Private',
  police: 'Police',
}
