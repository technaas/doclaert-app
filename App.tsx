import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AlertBadgeProvider } from '@/src/context/AlertBadgeContext';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { QueryProvider } from '@/src/providers/QueryProvider';
import { isInvalidRefreshTokenMessage } from '@/src/lib/authSession';
import {
  STARTUP_SPLASH_TIMEOUT_MS,
  startupLog,
} from '@/src/lib/startup';
import {
  flushPendingNotificationNavigation,
  navigationRef,
} from '@/src/navigation/navigationRef';
import { RootNavigator } from '@/src/navigation/RootNavigator';

startupLog('App module loaded');

LogBox.ignoreLogs([
  'Invalid Refresh Token',
  'Refresh Token Not Found',
  'AuthApiError',
  'expo-notifications',
  'Android Push notifications',
  'not fully supported in Expo Go',
]);

const originalConsoleWarn = console.warn.bind(console);
const originalConsoleError = console.error.bind(console);

function formatConsoleArgs(args: unknown[]): string {
  return args
    .map((arg) => {
      if (arg instanceof Error) {
        return arg.message;
      }
      if (typeof arg === 'string') {
        return arg;
      }
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    })
    .join(' ');
}

function shouldSuppressRuntimeMessage(text: string): boolean {
  return isInvalidRefreshTokenMessage(text) || /expo-notifications/i.test(text);
}

console.warn = (...args: unknown[]) => {
  const text = formatConsoleArgs(args);
  if (shouldSuppressRuntimeMessage(text)) {
    startupLog('Suppressed expected runtime warning');
    return;
  }
  originalConsoleWarn(...args);
};

console.error = (...args: unknown[]) => {
  const text = formatConsoleArgs(args);
  if (shouldSuppressRuntimeMessage(text)) {
    startupLog('Suppressed expected runtime warning');
    return;
  }
  originalConsoleError(...args);
};

void SplashScreen.preventAutoHideAsync().catch((error) => {
  startupLog('preventAutoHideAsync skipped', error);
});

async function hideSplashScreen(reason: string): Promise<void> {
  try {
    startupLog(`Hiding splash screen (${reason})`);
    await SplashScreen.hideAsync();
    startupLog('Splash screen hidden');
  } catch (error) {
    startupLog('Splash hide failed (non-blocking)', error);
  }
}

function AppNavigation() {
  const { loading: authLoading } = useAuth();
  const splashHiddenRef = useRef(false);
  const [forceReady, setForceReady] = useState(false);

  const isReady = !authLoading || forceReady;

  const hideSplashOnce = useCallback(async (reason: string) => {
    if (splashHiddenRef.current) {
      return;
    }
    splashHiddenRef.current = true;
    await hideSplashScreen(reason);
  }, []);

  useEffect(() => {
    startupLog('Auth loading state', { authLoading });
  }, [authLoading]);

  useEffect(() => {
    if (!authLoading) {
      startupLog('Auth ready — scheduling splash hide');
      void hideSplashOnce('auth-ready');
    }
  }, [authLoading, hideSplashOnce]);

  useEffect(() => {
    const timer = setTimeout(() => {
      startupLog('Splash timeout fallback — continuing startup');
      setForceReady(true);
      void hideSplashOnce('timeout');
    }, STARTUP_SPLASH_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [hideSplashOnce]);

  useEffect(() => {
    if (isReady) {
      void hideSplashOnce('app-ready');
    }
  }, [isReady, hideSplashOnce]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          startupLog('NavigationContainer ready');
          flushPendingNotificationNavigation();
        }}>
        <AlertBadgeProvider>
          <RootNavigator authTimedOut={forceReady && authLoading} />
          <StatusBar style="dark" />
        </AlertBadgeProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default function App() {
  startupLog('Rendering App root');
  return (
    <QueryProvider>
      <AuthProvider>
        <AppNavigation />
      </AuthProvider>
    </QueryProvider>
  );
}
