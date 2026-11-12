import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cardStyle, colors, spacing, typography } from '@/src/constants/theme';
import { useSupportContacts } from '@/src/hooks/useSupportContacts';
import { openExternalUrl } from '@/src/lib/openExternalUrl';

export function HelpSupportScreen() {
  const { view, loading } = useSupportContacts();

  const options = [
    {
      label: 'WhatsApp',
      value: view.whatsappDisplay,
      url: view.whatsappUrl,
      unavailableMessage: 'WhatsApp could not be opened on this device.',
    },
    {
      label: 'Call',
      value: view.callDisplay,
      url: view.callUrl,
      unavailableMessage: 'No phone app is available on this device.',
    },
    {
      label: 'Email',
      value: view.emailDisplay,
      url: view.emailUrl,
      unavailableMessage: 'No email app is available on this device.',
    },
    {
      label: 'Website',
      value: view.websiteDisplay,
      url: view.websiteUrl,
      unavailableMessage: 'No browser is available to open the DocAlert website.',
    },
  ] as const;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Contact Technaas Solutions for help with DocAlert. Each option opens the matching app
          on this device.
        </Text>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Updating contact details…</Text>
          </View>
        ) : null}
        <View style={styles.card}>
          {options.map((option) => (
            <Pressable
              key={option.label}
              style={styles.row}
              accessibilityRole="link"
              onPress={() => void openExternalUrl(option.url, option.unavailableMessage)}>
              <Text style={styles.label}>{option.label}</Text>
              <Text style={styles.value}>{option.value}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  intro: {
    ...typography.body,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
  },
  card: {
    ...cardStyle,
    paddingVertical: spacing.sm,
  },
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
