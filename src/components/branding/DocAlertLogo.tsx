import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { spacing } from '@/src/constants/theme';

const lockupSource = require('@/assets/images/docalert-logo.png');
const markSource = require('@/assets/images/docalert-mark.png');

type DocAlertLogoProps = {
  variant?: 'lockup' | 'mark';
  size?: 'sm' | 'md' | 'lg';
  /** @deprecated Lockup artwork already includes the wordmark. */
  showWordmark?: boolean;
  /** @deprecated Lockup artwork already includes the tagline. */
  showTagline?: boolean;
  style?: StyleProp<ViewStyle>;
};

const LOCKUP_SIZES = {
  sm: 140,
  md: 200,
  lg: 260,
} as const;

const MARK_SIZES = {
  sm: 36,
  md: 48,
  lg: 72,
} as const;

export function DocAlertLogo({
  variant = 'lockup',
  size = 'md',
  style,
}: DocAlertLogoProps) {
  const imageSize = variant === 'mark' ? MARK_SIZES[size] : LOCKUP_SIZES[size];

  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={variant === 'mark' ? markSource : lockupSource}
        style={{ width: imageSize, height: imageSize }}
        contentFit="contain"
        transition={150}
        accessibilityLabel="DocAlert logo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.sm,
  },
});
