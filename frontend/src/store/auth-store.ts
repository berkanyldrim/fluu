import { create } from 'zustand';

import { ApiError } from '@/lib/api-client';
import {
  AuthTokens,
  AuthUser,
  getMeRequest,
  loginRequest,
  logoutRequest,
  Profile,
  refreshRequest,
  registerRequest,
} from '@/lib/auth-api';
import { deleteSecureItem, getSecureItem, setSecureItem } from '@/lib/secure-storage';

const ACCESS_TOKEN_KEY = 'fluu.accessToken';
const REFRESH_TOKEN_KEY = 'fluu.refreshToken';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  profile: Profile | null;

  hydrate: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  refreshMe: () => Promise<void>;
  setProfile: (profile: Profile) => void;
  markEmailVerified: () => void;
  /** 401 alırsa bir kez refresh deneyip isteği tekrar dener, gene başarısızsa oturumu kapatır. */
  authorizedRequest: <T>(fn: (accessToken: string) => Promise<T>) => Promise<T>;
};

async function persistTokens(tokens: AuthTokens) {
  await Promise.all([
    setSecureItem(ACCESS_TOKEN_KEY, tokens.accessToken),
    setSecureItem(REFRESH_TOKEN_KEY, tokens.refreshToken),
  ]);
}

async function clearTokens() {
  await Promise.all([deleteSecureItem(ACCESS_TOKEN_KEY), deleteSecureItem(REFRESH_TOKEN_KEY)]);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  accessToken: null,
  refreshToken: null,
  user: null,
  profile: null,

  async hydrate() {
    const [accessToken, refreshToken] = await Promise.all([
      getSecureItem(ACCESS_TOKEN_KEY),
      getSecureItem(REFRESH_TOKEN_KEY),
    ]);

    if (!accessToken || !refreshToken) {
      set({ status: 'unauthenticated' });
      return;
    }

    set({ accessToken, refreshToken });

    try {
      await get().refreshMe();
    } catch {
      await get().logout();
    }
  },

  async register(email, password) {
    const result = await registerRequest(email, password);
    await persistTokens(result);
    set({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
      profile: null,
      status: 'authenticated',
    });
  },

  async login(email, password) {
    const result = await loginRequest(email, password);
    await persistTokens(result);
    set({ accessToken: result.accessToken, refreshToken: result.refreshToken, status: 'authenticated' });
    await get().refreshMe();
  },

  async logout() {
    const refreshToken = get().refreshToken;
    if (refreshToken) {
      // Sunucudaki refresh token'ı geçersizleştirmek best-effort — istek başarısız olsa bile
      // (ör. offline) kullanıcı cihazında oturumu kapatabilmeli, engelleme.
      await logoutRequest(refreshToken).catch(() => {});
    }
    await clearTokens();
    set({ status: 'unauthenticated', accessToken: null, refreshToken: null, user: null, profile: null });
  },

  async refreshAccessToken() {
    const currentRefreshToken = get().refreshToken;
    if (!currentRefreshToken) return null;

    try {
      const tokens = await refreshRequest(currentRefreshToken);
      await persistTokens(tokens);
      set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
      return tokens.accessToken;
    } catch {
      return null;
    }
  },

  async refreshMe() {
    const accessToken = get().accessToken;
    if (!accessToken) throw new ApiError(401, 'Oturum bulunamadı');
    const { user, profile } = await get().authorizedRequest((token) => getMeRequest(token));
    set({ user, profile, status: 'authenticated' });
  },

  setProfile(profile) {
    set({ profile });
  },

  markEmailVerified() {
    const user = get().user;
    if (user) set({ user: { ...user, isEmailVerified: true } });
  },

  async authorizedRequest(fn) {
    const accessToken = get().accessToken;
    if (!accessToken) throw new ApiError(401, 'Oturum bulunamadı');

    try {
      return await fn(accessToken);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        const newToken = await get().refreshAccessToken();
        if (!newToken) {
          await get().logout();
          throw error;
        }
        return fn(newToken);
      }
      throw error;
    }
  },
}));
