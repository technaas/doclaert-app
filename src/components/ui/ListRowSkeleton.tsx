import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { cardStyle, colors, radius, spacing } from '@/src/constants/theme';

function SkeletonBlock({
  style,
  opacity,
}: {
  style: object;
  opacity: Animated.Value;
}) {
  return (
    <Animated.View style={[styles.block, style, { opacity }]} />
  );
}

export function ListRowSkeleton() {
  const pulse = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.55,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <View style={styles.card}>
      <SkeletonBlock style={styles.title} opacity={pulse} />
      <SkeletonBlock style={styles.line} opacity={pulse} />
      <SkeletonBlock style={styles.lineShort} opacity={pulse} />
      <View style={styles.row}>
        <SkeletonBlock style={styles.pill} opacity={pulse} />
        <SkeletonBlock style={styles.pill} opacity={pulse} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardStyle,
    padding: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  block: {
    backgroundColor: colors.skeleton,
    borderRadius: 6,
  },
  title: {
    width: '55%',
    height: 16,
  },
  line: {
    width: '80%',
    height: 12,
  },
  lineShort: {
    width: '45%',
    height: 12,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  pill: {
    width: 72,
    height: 22,
    borderRadius: 11,
  },
});
