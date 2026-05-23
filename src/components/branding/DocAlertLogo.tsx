import { Image } from 'expo-image';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, spacing } from '@/src/constants/theme';

const logoSource = require('@/assets/images/docalert-logo.png');

type DocAlertLogoProps = {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  showTagline?: boolean;
  style?: StyleProp<ViewStyle>;
};

const SIZES = {
  sm: 40,
  md: 72,
  lg: 120,
} as const;

export function DocAlertLogo({
  size = 'md',
  showWordmark = false,
  showTagline = false,
  style,
}: DocAlertLogoProps) {
  const imageSize = SIZES[size];

  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={logoSource}
        style={{ width: imageSize, height: imageSize }}
        contentFit="contain"
        transition={150}
        accessibilityLabel="DocAlert logo"
      />
      {showWordmark ? (
        <Text style={[styles.wordmark, size === 'lg' && styles.wordmarkLg]}>DocAlert</Text>
      ) : null}
      {showTagline ? (
        <Text style={styles.tagline}>Compliance & Expiry Management</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  wordmark: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  wordmarkLg: {
    fontSize: 28,
  },
  tagline: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
});
