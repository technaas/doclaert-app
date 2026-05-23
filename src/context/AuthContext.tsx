import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '@/src/lib/supabase';
import {
  STARTUP_AUTH_TIMEOUT_MS,
  startupLog,
  withTimeout,
} from '@/src/lib/startup';
import type { Profile } from '@/src/types';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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

  const loadUserProfile = useCallback(async (authUser: User) => {
    startupLog('Loading user profile', { userId: authUser.id });
    const profileData = await fetchProfile(authUser.id);
    setProfile(profileData);
    setUser(authUser);
    startupLog('Profile loaded');
  }, []);

  const clearAuthState = useCallback(() => {
    setSession(null);
    setUser(null);
    setProfile(null);
  }, []);

  const finishLoading = useCallback(() => {
    setLoading(false);
    startupLog('Auth loading finished');
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      startupLog('Auth initialization started');

      try {
        const {
          data: { session: currentSession },
        } = await withTimeout(
          supabase.auth.getSession(),
          STARTUP_AUTH_TIMEOUT_MS,
          'supabase.auth.getSession',
        );

        if (!mounted) {
          return;
        }

        setSession(currentSession);
        startupLog('Session resolved', { hasSession: Boolean(currentSession) });

        if (currentSession?.user) {
          try {
            await withTimeout(
              loadUserProfile(currentSession.user),
              STARTUP_AUTH_TIMEOUT_MS,
              'fetchProfile',
            );
          } catch (profileError) {
            startupLog('Profile load failed on startup (continuing)', profileError);
            setUser(currentSession.user);
            setProfile(null);
          }
        } else {
          clearAuthState();
        }
      } catch (error) {
        startupLog('Auth initialization failed (continuing)', error);
        if (mounted) {
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
      if (!mounted) {
        return;
      }

      startupLog('Auth state change', { event, hasSession: Boolean(nextSession) });
      setSession(nextSession);

      if (!nextSession?.user) {
        clearAuthState();
        return;
      }

      // Defer Supabase calls to avoid deadlocking getSession() during INITIAL_SESSION.
      if (event === 'INITIAL_SESSION') {
        return;
      }

      setTimeout(() => {
        if (!mounted) {
          return;
        }

        void (async () => {
          try {
            await loadUserProfile(nextSession.user);
          } catch (profileError) {
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
    };
  }, [clearAuthState, finishLoading, loadUserProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      startupLog('Login started');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.session || !data.user) {
        throw new Error('Login failed. No session returned.');
      }

      setSession(data.session);
      await loadUserProfile(data.user);
      startupLog('Login complete');
    },
    [loadUserProfile],
  );

  const logout = useCallback(async () => {
    startupLog('Logout started');
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    clearAuthState();
    startupLog('Logout complete');
  }, [clearAuthState]);

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      loading,
      login,
      logout,
    }),
    [session, user, profile, loading, login, logout],
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
