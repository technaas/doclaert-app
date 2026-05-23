import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const colors = {
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceElevated: '#FFFFFF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  text: '#111827',
  textMuted: '#6B7280',
  textSubtle: '#9CA3AF',
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#EFF6FF',
  primaryMuted: '#DBEAFE',
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
  warning: '#EA580C',
  warningLight: '#FFF7ED',
  success: '#059669',
  successLight: '#ECFDF5',
  skeleton: '#E5E7EB',
  skeletonHighlight: '#F3F4F6',
  headerAccent: '#2563EB',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const typography = {
  screenTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  label: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.6,
  },
  body: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
} as const;

export const shadows = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
    default: {},
  }),
  cardSoft: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
    },
    android: { elevation: 1 },
    default: {},
  }),
} as const;

export const cardStyle: ViewStyle = {
  backgroundColor: colors.surfaceElevated,
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: colors.border,
  ...shadows.card,
};

export const headerStyles = {
  accentBar: {
    height: 3,
    backgroundColor: colors.headerAccent,
    borderRadius: radius.full,
    width: 40,
    marginBottom: spacing.sm,
  } satisfies ViewStyle,
};
