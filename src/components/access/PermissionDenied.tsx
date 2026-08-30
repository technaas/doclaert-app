import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/src/constants/theme';

export function PermissionDenied() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Access denied</Text>
      <Text style={styles.message}>Your role does not include this module.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
