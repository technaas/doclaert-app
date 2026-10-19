import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  privacyPolicyContacts,
  privacyPolicyIntroLinks,
  privacyPolicySections,
  privacyPolicyWebLink,
  PRIVACY_POLICY_EFFECTIVE_DATE,
  type PrivacyLink,
} from '@/src/content/privacyPolicy';
import { colors, spacing, typography } from '@/src/constants/theme';
import { openExternalUrl } from '@/src/lib/openExternalUrl';

function ContactLink({ link }: { link: PrivacyLink }) {
  return (
    <Text
      style={styles.link}
      accessibilityRole="link"
      onPress={() => void openExternalUrl(link.url, link.unavailableMessage)}>
      {link.label}
    </Text>
  );
}

export function PrivacyPolicyScreen() {
  const [websiteLink, emailLink] = privacyPolicyIntroLinks;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>DocAlert — Privacy Policy</Text>
        <Text style={styles.meta}>Provided by Technaas Solutions</Text>
        <Text style={styles.meta}>Effective Date: {PRIVACY_POLICY_EFFECTIVE_DATE}</Text>
        <Text style={styles.meta}>
          Website: <ContactLink link={websiteLink} />
        </Text>
        <Text style={styles.meta}>
          Contact: <ContactLink link={emailLink} />
        </Text>

        <Text style={styles.webHint}>
          A public copy is intended at{' '}
          <ContactLink link={privacyPolicyWebLink} />. The text on this screen is the
          DocAlert Privacy Policy.
        </Text>

        {privacyPolicySections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.paragraphs.map((paragraph) => (
              <Text key={paragraph} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Contact Us</Text>
          <Text style={styles.paragraph}>
            For questions relating to DocAlert, technical support, privacy concerns, or data
            requests, contact:
          </Text>
          <Text style={styles.paragraph}>Technaas Solutions</Text>
          {privacyPolicyContacts.map((link) => (
            <ContactLink key={link.label} link={link} />
          ))}
        </View>

        <Text style={styles.copyright}>© 2026 Technaas Solutions. All rights reserved.</Text>
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
    gap: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  title: {
    ...typography.sectionTitle,
    fontSize: 22,
  },
  meta: {
    ...typography.body,
    color: colors.textMuted,
  },
  webHint: {
    ...typography.body,
    marginTop: spacing.md,
  },
  section: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.sectionTitle,
  },
  paragraph: {
    ...typography.body,
  },
  link: {
    ...typography.body,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  copyright: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
});
