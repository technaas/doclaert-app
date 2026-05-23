import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/src/constants/theme';

type DocumentImagePreviewModalProps = {
  visible: boolean;
  uri: string;
  title?: string;
  onClose: () => void;
  onError: (message: string) => void;
  onOpenInBrowser: () => void;
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;

function ZoomableImage({
  uri,
  onLoad,
  onLoadError,
}: {
  uri: string;
  onLoad: () => void;
  onLoadError: () => void;
}) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      const next = savedScale.value * event.scale;
      scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE * 0.5, next));
    })
    .onEnd(() => {
      if (scale.value < MIN_SCALE) {
        scale.value = withTiming(MIN_SCALE);
        savedScale.value = MIN_SCALE;
        return;
      }
      if (scale.value > MAX_SCALE) {
        scale.value = withTiming(MAX_SCALE);
        savedScale.value = MAX_SCALE;
        return;
      }
      savedScale.value = scale.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withTiming(1);
        savedScale.value = 1;
      } else {
        scale.value = withTiming(2);
        savedScale.value = 2;
      }
    });

  const composed = Gesture.Simultaneous(pinch, doubleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.zoomContainer, animatedStyle]}>
        <Image
          source={{ uri }}
          style={styles.image}
          contentFit="contain"
          transition={200}
          onLoad={onLoad}
          onError={onLoadError}
        />
      </Animated.View>
    </GestureDetector>
  );
}

export function DocumentImagePreviewModal({
  visible,
  uri,
  title,
  onClose,
  onError,
  onOpenInBrowser,
}: DocumentImagePreviewModalProps) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const handleLoadError = useCallback(() => {
    setLoading(false);
    setFailed(true);
    onError('Unable to load this image preview.');
  }, [onError]);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    setLoading(true);
    setFailed(false);
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable
            style={styles.closeButton}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Close preview">
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
          {title ? (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          ) : null}
        </View>

        <View style={styles.body}>
          {loading && !failed ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : null}

          {failed ? (
            <View style={styles.fallback}>
              <Text style={styles.fallbackText}>Preview unavailable for this image.</Text>
              <Pressable style={styles.fallbackButton} onPress={onOpenInBrowser}>
                <Text style={styles.fallbackButtonText}>Open in Browser</Text>
              </Pressable>
            </View>
          ) : (
            <ZoomableImage
              uri={uri}
              onLoad={handleLoadEnd}
              onLoadError={handleLoadError}
            />
          )}
        </View>

        <Text style={[styles.hint, { paddingBottom: insets.bottom + spacing.md }]}>
          Pinch or double-tap to zoom
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  zoomContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94A3B8',
    paddingTop: spacing.sm,
  },
  fallback: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  fallbackText: {
    fontSize: 14,
    color: '#E2E8F0',
    textAlign: 'center',
  },
  fallbackButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
  },
  fallbackButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
});
