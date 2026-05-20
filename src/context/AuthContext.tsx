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
    const profileData = await fetchProfile(authUser.id);
    setProfile(profileData);
    setUser(authUser);
  }, []);

  const clearAuthState = useCallback(() => {
    setSession(null);
    setUser(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(currentSession);

        if (currentSession?.user) {
          await loadUserProfile(currentSession.user);
        } else {
          clearAuthState();
        }
      } catch {
        if (mounted) {
          clearAuthState();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;

      setSession(nextSession);

      if (nextSession?.user) {
        try {
          await loadUserProfile(nextSession.user);
        } catch {
          clearAuthState();
        }
      } else {
        clearAuthState();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [clearAuthState, loadUserProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
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
    },
    [loadUserProfile],
  );

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    clearAuthState();
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
