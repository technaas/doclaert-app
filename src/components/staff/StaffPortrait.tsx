import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/src/constants/theme';
import { createFreshSignedUrl } from '@/src/lib/documentStorage';
import { staffInitials } from '@/src/lib/staffPhoto';

type StaffPortraitProps = {
  photoUrl?: string | null;
  name: string;
  size?: 'detail' | 'compact';
};

export function StaffPortrait({ photoUrl, name, size = 'detail' }: StaffPortraitProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const raw = photoUrl?.trim() ?? '';
    if (!raw) {
      setResolvedUrl(null);
      return;
    }

    void createFreshSignedUrl(raw)
      .then((url) => {
        if (!cancelled) setResolvedUrl(url);
      })
      .catch(() => {
        if (!cancelled) setResolvedUrl(raw);
      });

    return () => {
      cancelled = true;
    };
  }, [photoUrl]);

  const compact = size === 'compact';

  return (
    <View
      style={[styles.frame, compact && styles.frameCompact]}
      accessibilityLabel={`${name} photo`}>
      {resolvedUrl ? (
        <Image
          source={{ uri: resolvedUrl }}
          style={styles.image}
          contentFit="cover"
          transition={150}
          accessibilityLabel={name}
        />
      ) : (
        <View style={styles.fallback}>
          <Text style={[styles.initials, compact && styles.initialsCompact]}>
            {staffInitials(name)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: 126,
    height: 168,
    borderRadius: radius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
  },
  frameCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  initials: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1,
  },
  initialsCompact: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
