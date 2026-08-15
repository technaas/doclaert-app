import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';

import {
  clearStoredAuthSession,
  isInvalidRefreshTokenError,
  SESSION_EXPIRED_MESSAGE,
} from '@/src/lib/authSession';
import { queryClient } from '@/src/lib/queryClient';
import { supabase } from '@/src/lib/supabase';
import {
  STARTUP_AUTH_TIMEOUT_MS,
  startupLog,
  withTimeout,
} from '@/src/lib/startup';
import type { Profile } from '@/types';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  sessionNotice: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSessionNotice: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, company_id, role')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Profile not found');
  }

  return data as Profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  const recoveringRef = useRef(false);
  const intentionalLogoutRef = useRef(false);
  const signedOutHandledRef = useRef(false);
  const storageClearedRef = useRef(false);
  const hadSessionRef = useRef(false);
  const queryCacheClearedRef = useRef(false);
  const sessionExpiredNoticeSetRef = useRef(false);

  const clearAuthState = useCallback(() => {
    setSession(null);
    setUser(null);
    setProfile(null);
  }, []);

  const clearSessionNotice = useCallback(() => {
    setSessionNotice(null);
    sessionExpiredNoticeSetRef.current = false;
  }, []);

  const finishLoading = useCallback(() => {
    setLoading(false);
    startupLog('Auth loading finished');
  }, []);

  const clearQueryCacheOnce = useCallback(() => {
    if (queryCacheClearedRef.current) {
      return;
    }
    queryCacheClearedRef.current = true;
    queryClient.clear();
  }, []);

  const clearStorageOnce = useCallback(async () => {
    if (storageClearedRef.current) {
      return;
    }
    storageClearedRef.current = true;
    await clearStoredAuthSession();
  }, []);

  const setSessionExpiredNoticeOnce = useCallback(() => {
    if (sessionExpiredNoticeSetRef.current) {
      return;
    }
    sessionExpiredNoticeSetRef.current = true;
    setSessionNotice(SESSION_EXPIRED_MESSAGE);
  }, []);

  const applySignedInSession = useCallback(
    (nextSession: Session) => {
      signedOutHandledRef.current = false;
      storageClearedRef.current = false;
      queryCacheClearedRef.current = false;
      sessionExpiredNoticeSetRef.current = false;
      hadSessionRef.current = true;
      setSession(nextSession);
      setSessionNotice(null);
    },
    [],
  );

  const applySignedOutState = useCallback(
    (options: { showSessionExpired: boolean }) => {
      if (signedOutHandledRef.current) {
        return;
      }

      signedOutHandledRef.current = true;
      setSession(null);
      clearAuthState();

      if (options.showSessionExpired) {
        setSessionExpiredNoticeOnce();
      }

      clearQueryCacheOnce();
      intentionalLogoutRef.current = false;
    },
    [clearAuthState, clearQueryCacheOnce, setSessionExpiredNoticeOnce],
  );

  const loadUserProfile = useCallback(async (authUser: User) => {
    startupLog('Loading user profile', { userId: authUser.id });
    const profileData = await fetchProfile(authUser.id);
    setProfile(profileData);
    setUser(authUser);
    startupLog('Profile loaded');
  }, []);

  const recoverFromInvalidSession = useCallback(
    async (source?: unknown) => {
      if (recoveringRef.current || storageClearedRef.current) {
        return;
      }

      recoveringRef.current = true;

      try {
        startupLog('Invalid refresh token — clearing local session once', source);
        await clearStorageOnce();
        applySignedOutState({ showSessionExpired: true });
      } finally {
        recoveringRef.current = false;
      }
    },
    [applySignedOutState, clearStorageOnce],
  );

  const handleAuthErrorRef = useRef<(error: unknown) => Promise<boolean>>(async () => false);
  handleAuthErrorRef.current = async (error: unknown) => {
    if (!isInvalidRefreshTokenError(error)) {
      return false;
    }
    await recoverFromInvalidSession(error);
    return true;
  };

  const loadUserProfileRef = useRef(loadUserProfile);
  loadUserProfileRef.current = loadUserProfile;

  const applySignedOutStateRef = useRef(applySignedOutState);
  applySignedOutStateRef.current = applySignedOutState;

  const applySignedInSessionRef = useRef(applySignedInSession);
  applySignedInSessionRef.current = applySignedInSession;

  useEffect(() => {
    let mounted = true;

    startupLog('AUTH LISTENER CREATED');

    const initializeAuth = async () => {
      startupLog('Auth initialization started');

      try {
        const { data, error } = await withTimeout(
          supabase.auth.getSession(),
          STARTUP_AUTH_TIMEOUT_MS,
          'supabase.auth.getSession',
        );

        if (!mounted) {
          return;
        }

        if (error) {
          if (await handleAuthErrorRef.current(error)) {
            return;
          }
          startupLog('Auth getSession error (continuing signed out)', error);
          applySignedOutStateRef.current({ showSessionExpired: false });
          return;
        }

        const currentSession = data.session;
        startupLog('Session resolved', { hasSession: Boolean(currentSession) });

        if (currentSession?.user) {
          applySignedInSessionRef.current(currentSession);
          try {
            await withTimeout(
              loadUserProfileRef.current(currentSession.user),
              STARTUP_AUTH_TIMEOUT_MS,
              'fetchProfile',
            );
          } catch (profileError) {
            if (await handleAuthErrorRef.current(profileError)) {
              return;
            }
            startupLog('Profile load failed on startup (continuing)', profileError);
            setUser(currentSession.user);
            setProfile(null);
          }
        } else {
          signedOutHandledRef.current = true;
          clearAuthState();
        }
      } catch (error) {
        if (await handleAuthErrorRef.current(error)) {
          return;
        }
        startupLog('Auth initialization failed (continuing signed out)', error);
        if (mounted) {
          signedOutHandledRef.current = true;
          clearAuthState();
        }
      } finally {
        if (mounted) {
          finishLoading();
        }
      }
    };

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted || recoveringRef.current) {
        return;
      }

      const hasUser = Boolean(nextSession?.user);

      if (event === 'SIGNED_OUT' && !hasUser) {
        if (signedOutHandledRef.current) {
          return;
        }

        startupLog('Auth state change', { event, hasSession: false });

        applySignedOutStateRef.current({
          showSessionExpired: hadSessionRef.current && !intentionalLogoutRef.current,
        });
        return;
      }

      if (!hasUser) {
        if (signedOutHandledRef.current) {
          return;
        }

        startupLog('Auth state change', { event, hasSession: false });

        applySignedOutStateRef.current({
          showSessionExpired:
            event !== 'INITIAL_SESSION' &&
            hadSessionRef.current &&
            !intentionalLogoutRef.current,
        });
        return;
      }

      startupLog('Auth state change', { event, hasSession: true });

      applySignedInSessionRef.current(nextSession);

      if (event === 'INITIAL_SESSION') {
        return;
      }

      setTimeout(() => {
        if (!mounted || recoveringRef.current) {
          return;
        }

        void (async () => {
          try {
            await loadUserProfileRef.current(nextSession.user);
          } catch (profileError) {
            if (await handleAuthErrorRef.current(profileError)) {
              return;
            }
            startupLog('Profile load failed on auth event', profileError);
            setUser(nextSession.user);
            setProfile(null);
          }
        })();
      }, 0);
    });

    const authSafetyTimer = setTimeout(() => {
      if (mounted) {
        startupLog('Auth safety timeout — forcing loading complete');
        finishLoading();
      }
    }, STARTUP_AUTH_TIMEOUT_MS + 1000);

    return () => {
      mounted = false;
      clearTimeout(authSafetyTimer);
      subscription.unsubscribe();
      startupLog('AUTH LISTENER DESTROYED');
    };
  }, [clearAuthState, finishLoading]);

  const login = useCallback(
    async (email: string, password: string) => {
      signedOutHandledRef.current = false;
      storageClearedRef.current = false;
      hadSessionRef.current = false;
      queryCacheClearedRef.current = false;
      sessionExpiredNoticeSetRef.current = false;
      clearSessionNotice();
      startupLog('Login started');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (await handleAuthErrorRef.current(error)) {
          throw new Error(SESSION_EXPIRED_MESSAGE);
        }
        throw new Error(error.message);
      }

      if (!data.session || !data.user) {
        throw new Error('Login failed. No session returned.');
      }

      applySignedInSession(data.session);
      await loadUserProfile(data.user);
      startupLog('Login complete');
    },
    [applySignedInSession, clearSessionNotice, loadUserProfile],
  );

  const logout = useCallback(async () => {
    intentionalLogoutRef.current = true;
    clearSessionNotice();
    startupLog('Logout started');

    try {
      const { error } = await supabase.auth.signOut();
      if (error && !isInvalidRefreshTokenError(error)) {
        throw new Error(error.message);
      }
    } catch (error) {
      if (!isInvalidRefreshTokenError(error)) {
        intentionalLogoutRef.current = false;
        throw error instanceof Error ? error : new Error('Logout failed.');
      }
      await clearStorageOnce();
    }

    applySignedOutState({ showSessionExpired: false });
    hadSessionRef.current = false;
    startupLog('Logout complete');
  }, [applySignedOutState, clearSessionNotice, clearStorageOnce]);

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      loading,
      sessionNotice,
      login,
      logout,
      clearSessionNotice,
    }),
    [session, user, profile, loading, sessionNotice, login, logout, clearSessionNotice],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
