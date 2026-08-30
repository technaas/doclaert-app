import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing } from '@/src/constants/theme';

type ListCardTone = 'default' | 'warning' | 'danger';

type ListCardProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  onPress?: () => void;
  tone?: ListCardTone;
  leading?: ReactNode;
  badges?: ReactNode;
  footer?: ReactNode;
  accessibilityLabel?: string;
};

const TONE_STYLES: Record<
  ListCardTone,
  { bg: string; border: string; accent?: string }
> = {
  default: {
    bg: colors.background,
    border: colors.border,
  },
  warning: {
    bg: colors.warningLight,
    border: '#FED7AA',
    accent: colors.warning,
  },
  danger: {
    bg: colors.dangerLight,
    border: '#FECACA',
    accent: colors.danger,
  },
};

export function ListCard({
  title,
  subtitle,
  meta,
  onPress,
  tone = 'default',
  leading,
  badges,
  footer,
  accessibilityLabel,
}: ListCardProps) {
  const toneStyle = TONE_STYLES[tone];

  const content = (
    <View style={styles.inner}>
        <View style={[styles.header, leading ? styles.headerWithLeading : null]}>
          {leading ? <View style={styles.leading}>{leading}</View> : null}
          <View style={styles.titleWrap}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {onPress ? (
            <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
          ) : null}
        </View>

        {meta ? (
          <Text style={styles.meta} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}

        {badges ? <View style={styles.badges}>{badges}</View> : null}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
  );

  const cardStyle = [
    styles.card,
    { backgroundColor: toneStyle.bg, borderColor: toneStyle.border },
    tone === 'danger' && [styles.cardAccent, { borderLeftColor: toneStyle.accent }],
    tone === 'warning' && [styles.cardAccent, { borderLeftColor: toneStyle.accent }],
  ];

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}>
        {content}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.cardSoft,
  },
  cardAccent: {
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  inner: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerWithLeading: {
    alignItems: 'center',
  },
  leading: {
    marginTop: 1,
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 22,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  meta: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.textSubtle,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
