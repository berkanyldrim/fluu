import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// expo-secure-store native'de Keychain/Keystore kullanır ama web'de hiç desteklenmez — web
// çıktısı (bkz. app.json "web") için localStorage'a düşüyoruz. Token'lar için web'de bu kadarı
// yeterli (aynı origin, XSS dışı bir tehdit modeli için native kadar güçlü değil ama proje şu an
// için web'i ikincil bir hedef olarak görüyor, bkz. FRONTEND.md stack).
export async function getSecureItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function deleteSecureItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
