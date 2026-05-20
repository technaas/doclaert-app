import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/constants/theme';
import { useAlertBadge } from '@/src/context/AlertBadgeContext';

export function NotificationBell() {
  const navigation = useNavigation();
  const { count } = useAlertBadge();

  const openAlerts = () => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('Alerts' as never);
      return;
    }
    navigation.navigate('Alerts' as never);
  };

  return (
    <Pressable
      style={styles.button}
      onPress={openAlerts}
      hitSlop={8}
      accessibilityLabel="Open alerts"
      accessibilityRole="button">
      <Ionicons name="notifications-outline" size={24} color={colors.text} />
      {count > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: '700',
  },
});
