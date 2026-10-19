import { Alert, Linking } from 'react-native';

export async function openExternalUrl(
  url: string,
  unavailableMessage: string,
): Promise<void> {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Unable to open', unavailableMessage);
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert('Unable to open', unavailableMessage);
  }
}
