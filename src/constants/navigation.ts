import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { colors, typography } from '@/src/constants/theme';

export const stackScreenOptions: NativeStackNavigationOptions = {
  headerTintColor: colors.primary,
  headerTitleStyle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  headerBackTitle: 'Back',
  headerShadowVisible: false,
  headerStyle: {
    backgroundColor: colors.background,
  },
  contentStyle: {
    backgroundColor: colors.background,
  },
  animation: 'slide_from_right',
};

export const modalScreenOptions: NativeStackNavigationOptions = {
  ...stackScreenOptions,
  presentation: 'modal',
  animation: 'slide_from_bottom',
};
