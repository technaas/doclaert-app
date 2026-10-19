import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cardStyle, colors, spacing, typography } from '@/src/constants/theme';
import { openExternalUrl } from '@/src/lib/openExternalUrl';
import {
  DOCALERT_WEBSITE_URL,
  SUPPORT_EMAIL_DISPLAY,
  SUPPORT_EMAIL_URL,
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_URL,
  SUPPORT_WHATSAPP_URL,
} from '@/src/lib/supportContacts';

const OPTIONS = [
  {
    label: 'WhatsApp',
    value: SUPPORT_PHONE_DISPLAY,
    url: SUPPORT_WHATSAPP_URL,
    unavailableMessage: 'WhatsApp could not be opened on this device.',
  },
  {
    label: 'Call',
    value: SUPPORT_PHONE_DISPLAY,
    url: SUPPORT_PHONE_URL,
    unavailableMessage: 'No phone app is available on this device.',
  },
  {
    label: 'Email',
    value: SUPPORT_EMAIL_DISPLAY,
    url: SUPPORT_EMAIL_URL,
    unavailableMessage: 'No email app is available on this device.',
  },
  {
    label: 'Website',
    value: DOCALERT_WEBSITE_URL,
    url: DOCALERT_WEBSITE_URL,
    unavailableMessage: 'No browser is available to open the DocAlert website.',
  },
] as const;

export function HelpSupportScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Contact Technaas Solutions for help with DocAlert. Each option opens the matching app
          on this device.
        </Text>
        <View style={styles.card}>
          {OPTIONS.map((option) => (
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
