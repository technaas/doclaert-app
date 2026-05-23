import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  DOCUMENT_STATUS_LABEL,
  formatDaysRemaining,
  statusBadgeTone,
} from '@/src/lib/documentStatus';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { colors, radius, spacing } from '@/src/constants/theme';
import type { DocumentListItem } from '@/src/types/documents';

type DocumentCardProps = {
  document: DocumentListItem;
  onPress: () => void;
};

function DocumentCardComponent({ document, onPress }: DocumentCardProps) {
  const tone = statusBadgeTone(document.displayStatus);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.name}>{document.documentLabel}</Text>
          <Text style={styles.linked}>Linked to: {document.linkedTo}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </View>

      <Text style={styles.meta}>
        {document.brandName} · {document.branchName}
      </Text>

      <View style={styles.footer}>
        <View>
          <Text style={styles.expiryLabel}>Expiry</Text>
          <Text style={styles.expiryValue}>{document.expiryDate ?? '—'}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.days}>{formatDaysRemaining(document.daysRemaining)}</Text>
          <StatusBadge
            label={DOCUMENT_STATUS_LABEL[document.displayStatus]}
            tone={tone}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  titleWrap: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  linked: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textMuted,
  },
  meta: {
    fontSize: 12,
    color: colors.textSubtle,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  expiryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  expiryValue: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  days: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
});

export const DocumentCard = memo(DocumentCardComponent);
