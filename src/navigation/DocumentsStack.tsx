import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DocumentDetailScreen } from '@/src/screens/documents/DocumentDetailScreen';
import { DocumentsScreen } from '@/src/screens/documents/DocumentsScreen';

export type DocumentsStackParamList = {
  DocumentsList: undefined;
  DocumentDetail: { documentId: string };
};

const Stack = createNativeStackNavigator<DocumentsStackParamList>();

export function DocumentsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DocumentsList"
        component={DocumentsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DocumentDetail"
        component={DocumentDetailScreen}
        options={{
          presentation: 'modal',
          title: 'Document Details',
          headerTintColor: '#2563EB',
        }}
      />
    </Stack.Navigator>
  );
}
