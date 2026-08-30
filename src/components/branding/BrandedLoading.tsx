import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { DocAlertLogo } from '@/src/components/branding/DocAlertLogo';
import { colors, spacing } from '@/src/constants/theme';

type BrandedLoadingProps = {
  showTagline?: boolean;
};

export function BrandedLoading(_props?: BrandedLoadingProps) {
  return (
    <View style={styles.container}>
      <DocAlertLogo variant="lockup" size="lg" />
      <ActivityIndicator
        style={styles.spinner}
        size="small"
        color={colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl,
  },
  spinner: {
    marginTop: spacing.xxl,
  },
});
