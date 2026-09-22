# Kids' Hotline — OneTimeOneTime Streaming App
## Complete Project Export
**Generated:** 2026-06-12
**Platform:** Expo (React Native) + Express backend
**Target API:** https://onetimeonetime.com

---

## Asset Manifest

| Path | Description |
|------|-------------|
| `assets/images/logo.webp` | One Time One Time logo (header + login) |
| `assets/images/icon.png` | App icon |
| `assets/images/splash-icon.png` | Splash screen icon |
| `assets/images/favicon.png` | Web favicon |
| `assets/images/android-icon-foreground.png` | Android adaptive icon foreground |
| `assets/images/android-icon-background.png` | Android adaptive icon background |
| `assets/images/android-icon-monochrome.png` | Android monochrome icon |

---

## Rebuild Blueprint

1. `npx create-expo-app my-app --template blank-typescript`
2. Copy all source files below into correct paths
3. Copy all assets into `assets/images/`
4. Copy `app.json` and `eas.json` to project root
5. Replace `package.json` with the one below
6. Run `npm install`
7. Set up environment: `BUNNY_API_KEY`, `SESSION_SECRET` (server-side secrets)
8. Start backend: `npm run server:dev` (port 5000)
9. Start frontend: `npm run expo:dev` (port 8081)
10. Scan QR from Expo Go to test on device

**Key decisions:**
- App always runs in dark mode (`useTheme` always returns `colors.dark`)
- `parentCategoryId` field on `/api/video-categories` drives two-level navigation (NOT `parentId`)
- Category section IDs are prefixed `content-<rawId>`; `parentCategoryId` on sections stores the raw ID (no prefix)
- Parent categories with no direct items (all items live in subcategories) are still shown as primary chips by propagating `categoryIdsWithContent` upward
- Android thumbnail flicker fixed: `recyclingKey={item.id}` + `priority="normal"` in ContentCard
- Vimeo videos use HTML injection via WebView (`source={{ html }}`) — NOT `source={{ uri }}` — to work around iOS react-native-webview bug
- Audio on web uses blob URL trick to support auth headers (HTML5 Audio doesn't support custom headers)
- Server (`server/routes.ts`) is empty — the app talks directly to `https://onetimeonetime.com`, the local server only serves the landing page and Expo manifests

---

## Source Files

### `client/index.js`
```js
import { registerRootComponent } from "expo";

import App from "@/App";

registerRootComponent(App);
```

---

### `client/App.tsx`
```tsx
import React from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import RootStackNavigator from "@/navigation/RootStackNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <AuthProvider>
            <SafeAreaProvider>
              <GestureHandlerRootView style={styles.root}>
                <KeyboardProvider>
                  <NavigationContainer>
                    <RootStackNavigator />
                  </NavigationContainer>
                  <StatusBar style="auto" />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </SafeAreaProvider>
          </AuthProvider>
        </SettingsProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
```

---

### `client/constants/theme.ts`
```ts
import { Platform } from "react-native";

const primaryColor = "#1A2A3A";
const backgroundColor = "#161616";

export const AccentColors = {
  yellow: "#EDE518",
  blue: "#3B82F6",
  green: "#10B981",
  purple: "#8B5CF6",
  pink: "#EC4899",
  orange: "#F97316",
  red: "#EF4444",
  teal: "#14B8A6",
} as const;

export type AccentColorName = keyof typeof AccentColors;

export function getColors(accentColor: string) {
  return {
    light: {
      text: "#161616",
      textSecondary: "#666666",
      buttonText: "#161616",
      tabIconDefault: "#666666",
      tabIconSelected: accentColor,
      link: accentColor,
      primary: primaryColor,
      accent: accentColor,
      success: "#10B981",
      warning: "#F97316",
      destructive: "#EF4444",
      border: "#E2E8F0",
      backgroundRoot: "#FFFFFF",
      backgroundDefault: "#F5F5F5",
      backgroundSecondary: "#EEEEEE",
      backgroundTertiary: "#E0E0E0",
      inputBackground: "#FFFFFF",
      inputBorder: "#CCCCCC",
      cardBackground: "#FFFFFF",
      overlay: "rgba(22, 22, 22, 0.5)",
    },
    dark: {
      text: "#FFFFFF",
      textSecondary: "#AAAAAA",
      buttonText: "#161616",
      tabIconDefault: "#888888",
      tabIconSelected: accentColor,
      link: accentColor,
      primary: accentColor,
      accent: accentColor,
      success: "#34D399",
      warning: "#FB923C",
      destructive: "#F87171",
      border: "#333333",
      backgroundRoot: backgroundColor,
      backgroundDefault: "#1E1E1E",
      backgroundSecondary: "#2A2A2A",
      backgroundTertiary: "#333333",
      inputBackground: "#1E1E1E",
      inputBorder: "#444444",
      cardBackground: "#1E1E1E",
      overlay: "rgba(0, 0, 0, 0.7)",
    },
  };
}

export const Colors = getColors(AccentColors.yellow);

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
  inputHeight: 52,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
};

export const Typography = {
  h1: { fontSize: 32, lineHeight: 40, fontWeight: "700" as const },
  h2: { fontSize: 28, lineHeight: 36, fontWeight: "700" as const },
  h3: { fontSize: 24, lineHeight: 32, fontWeight: "600" as const },
  h4: { fontSize: 20, lineHeight: 28, fontWeight: "600" as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" as const },
  small: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "500" as const },
  link: { fontSize: 16, lineHeight: 24, fontWeight: "500" as const },
};

export const Shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "Georgia",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "'Open Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
```

---

### `client/contexts/AuthContext.tsx`
```tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import * as api from "@/lib/api";

interface AuthState {
  isAuthenticated: boolean;
  user: api.User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const { token, user } = await api.getStoredAuth();
      if (token && user) {
        setState({ isAuthenticated: true, user, token, isLoading: false });
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const data = await api.login(email, password);
        setState({ isAuthenticated: true, user: data.user, token: data.token, isLoading: false });
        return { success: true };
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : "Unable to connect. Please check your internet connection.";
        return { success: false, error: message };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await api.clearAuth();
    setState({ isAuthenticated: false, user: null, token: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

---

### `client/contexts/SettingsContext.tsx`
```tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AccentColorName, AccentColors } from "@/constants/theme";

const ACCENT_COLOR_KEY = "@onetimeonetime_accent_color";

interface SettingsContextType {
  accentColorName: AccentColorName;
  accentColor: string;
  setAccentColor: (colorName: AccentColorName) => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [accentColorName, setAccentColorName] = useState<AccentColorName>("yellow");

  useEffect(() => {
    loadStoredSettings();
  }, []);

  const loadStoredSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(ACCENT_COLOR_KEY);
      if (stored && stored in AccentColors) {
        setAccentColorName(stored as AccentColorName);
      }
    } catch {}
  };

  const setAccentColor = useCallback(async (colorName: AccentColorName) => {
    setAccentColorName(colorName);
    try {
      await AsyncStorage.setItem(ACCENT_COLOR_KEY, colorName);
    } catch {}
  }, []);

  const value: SettingsContextType = {
    accentColorName,
    accentColor: AccentColors[accentColorName],
    setAccentColor,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
```

---

### `client/lib/api.ts`
```ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://onetimeonetime.com";
const AUTH_TOKEN_KEY = "@onetimeonetime_auth_token";
const USER_DATA_KEY = "@onetimeonetime_user_data";
const VIEWED_CONTENT_KEY = "@onetimeonetime_viewed_content";
const SUBSCRIPTION_KEY = "@onetimeonetime_subscription";

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export interface SubscriptionStatus {
  subscriptionStatus: string;
  active: boolean;
  isWhitelisted?: boolean;
  trialDaysRemaining?: number | null;
}

export interface VideoCategory {
  id: string;
  name: string;
  parentCategoryId?: string | null;
}

export interface VideoItem {
  id: string;
  title: string;
  description?: string | null;
  mediaType?: "video" | "audio";
  storageType?: "local" | "bunny_storage" | "bunny" | "vimeo";
  thumbnailPath?: string | null;
  bunnyThumbnailUrl?: string | null;
  bunnyStorageUrl?: string | null;
  bunnyGuid?: string | null;
  vimeoVideoId?: string | null;
  vimeoThumbnailUrl?: string | null;
  categoryId?: string | null;
  status?: string;
  duration?: number | null;
  createdAt?: string;
  viewed?: boolean;
  viewCount?: number;
}

export interface StreamResponse {
  bunny?: boolean;
  bunnyStorage?: boolean;
  vimeo?: boolean;
  replit?: boolean;
  embedUrl?: string;
  cdnUrl?: string;
  streamUrl?: string;
  url?: string;
  hlsUrl?: string;
  vimeoVideoId?: string;
  mediaType?: "video" | "audio";
}

const BUNNY_CDN_BASE = "vz-2480b6a7-327.b-cdn.net";

export function extractHlsUrl(embedUrl?: string): string | null {
  if (!embedUrl) return null;
  const match = embedUrl.match(/\/embed\/\d+\/([a-f0-9-]+)/i);
  if (match && match[1]) {
    return `https://${BUNNY_CDN_BASE}/${match[1]}/playlist.m3u8`;
  }
  return null;
}

export interface VideoViewStatus {
  viewed: boolean;
}

export interface DocumentItem {
  id: string;
  title: string;
  description?: string | null;
  status?: string;
  pageCount?: number;
  allowDownload?: boolean;
  createdAt?: string;
}

export interface AlbumTrack {
  id: string;
  title: string;
  trackNumber: number;
  duration?: number | null;
}

export interface AlbumItem {
  id: string;
  title: string;
  description?: string | null;
  trackCount?: number;
  tracks?: AlbumTrack[];
  createdAt?: string;
}

export type ContentType = "video" | "audio" | "document" | "album";

export interface ContentItem {
  id: string;
  title: string;
  description?: string | null;
  type: ContentType;
  thumbnailUrl?: string | null;
  thumbnailRequiresAuth?: boolean;
  embedUrl?: string | null;
  duration?: number | null;
  pageCount?: number;
  trackCount?: number;
  category?: string;
  categoryId?: string | null;
  categoryName?: string | null;
  createdAt?: string;
  isNew?: boolean;
  viewCount?: number;
}

export interface CategorySection {
  id: string;
  name: string;
  type: ContentType;
  items: ContentItem[];
  parentCategoryId?: string | null;
}

async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem(AUTH_TOKEN_KEY);
}

async function makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    await clearAuth();
    throw new Error("Couldn't find account info. Double check credentials. You can reset your password at onetimeonetime.com/login");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed: ${response.status}`);
  }

  return response.json();
}

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const data = await makeRequest<{ token: string; user: User }>("/api/mobile/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  await Promise.all([
    AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token),
    AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user)),
  ]);

  return data;
}

export async function getStoredAuth(): Promise<{ token: string | null; user: User | null }> {
  try {
    const [token, userData] = await Promise.all([
      AsyncStorage.getItem(AUTH_TOKEN_KEY),
      AsyncStorage.getItem(USER_DATA_KEY),
    ]);
    return { token, user: userData ? JSON.parse(userData) : null };
  } catch {
    return { token: null, user: null };
  }
}

export async function clearAuth(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(AUTH_TOKEN_KEY),
    AsyncStorage.removeItem(USER_DATA_KEY),
    AsyncStorage.removeItem(SUBSCRIPTION_KEY),
  ]);
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus | null> {
  try {
    const data = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
    if (data) return JSON.parse(data);
  } catch {
    return null;
  }
  return null;
}

export async function checkSubscription(): Promise<SubscriptionStatus> {
  try {
    const response = await makeRequest<SubscriptionStatus>("/api/mobile/subscription");
    await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(response));
    return response;
  } catch {
    return { subscriptionStatus: "unknown", active: true, isWhitelisted: false };
  }
}

export async function refreshToken(): Promise<{ token: string }> {
  const data = await makeRequest<{ token: string }>("/api/mobile/refresh-token", { method: "POST" });
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
  return data;
}

export async function getUserInfo(): Promise<User> {
  return makeRequest<User>("/api/mobile/me");
}

export async function getVideoCategories(): Promise<VideoCategory[]> {
  return makeRequest<VideoCategory[]>("/api/video-categories");
}

export async function getVideos(): Promise<VideoItem[]> {
  return makeRequest<VideoItem[]>("/api/videos");
}

export async function getDocuments(): Promise<DocumentItem[]> {
  return makeRequest<DocumentItem[]>("/api/documents");
}

export async function getAlbums(): Promise<AlbumItem[]> {
  return makeRequest<AlbumItem[]>("/api/albums");
}

export async function getTrendingVideos(): Promise<VideoItem[]> {
  return makeRequest<VideoItem[]>("/api/videos/trending");
}

export async function getAlbumById(albumId: string): Promise<AlbumItem> {
  return makeRequest<AlbumItem>(`/api/albums/${albumId}`);
}

export function getAlbumThumbnailUrl(albumId: string): { url: string; requiresAuth: boolean } {
  const cacheBust = Date.now();
  return {
    url: `${API_BASE_URL}/api/albums/${albumId}/thumbnail?v=${cacheBust}`,
    requiresAuth: true,
  };
}

export function getAlbumTrackStreamUrl(albumId: string, trackId: string): string {
  return `${API_BASE_URL}/api/albums/${albumId}/tracks/${trackId}/stream`;
}

export function getVideoThumbnailUrl(video: VideoItem): { url: string | null; requiresAuth: boolean } {
  if (video.vimeoThumbnailUrl) return { url: video.vimeoThumbnailUrl, requiresAuth: false };
  if (video.thumbnailPath) {
    const cacheBust = Date.now();
    return { url: `${API_BASE_URL}/api/videos/${video.id}/thumbnail?v=${cacheBust}`, requiresAuth: true };
  }
  if (video.bunnyThumbnailUrl) return { url: video.bunnyThumbnailUrl, requiresAuth: false };
  if (video.bunnyGuid) {
    return { url: `https://${BUNNY_CDN_BASE}/${video.bunnyGuid}/thumbnail.jpg`, requiresAuth: false };
  }
  return { url: null, requiresAuth: false };
}

export async function getStreamUrl(itemId: string, itemType?: string): Promise<StreamResponse> {
  if (itemType === "audio") {
    return makeRequest<StreamResponse>(`/api/audio/${itemId}/stream`);
  }
  return makeRequest<StreamResponse>(`/api/videos/${itemId}/stream`);
}

async function getLocalViewedContent(): Promise<Set<string>> {
  try {
    const data = await AsyncStorage.getItem(VIEWED_CONTENT_KEY);
    if (data) return new Set(JSON.parse(data));
  } catch (error) {
    console.log("Error reading viewed content:", error);
  }
  return new Set();
}

async function setLocalViewedContent(ids: Set<string>): Promise<void> {
  try {
    await AsyncStorage.setItem(VIEWED_CONTENT_KEY, JSON.stringify([...ids]));
  } catch (error) {
    console.log("Error saving viewed content:", error);
  }
}

export async function markVideoViewed(videoId: string): Promise<void> {
  const viewedIds = await getLocalViewedContent();
  viewedIds.add(videoId);
  await setLocalViewedContent(viewedIds);

  const token = await getAuthToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/mark-viewed`, {
      method: "POST",
      headers,
    });
    if (!response.ok && response.status !== 204) {
      console.log("Mark viewed response:", response.status);
    }
  } catch (error) {
    console.log("Mark viewed error:", error);
  }
}

export async function isContentViewedLocally(contentId: string): Promise<boolean> {
  const viewedIds = await getLocalViewedContent();
  return viewedIds.has(contentId);
}

export function isVideoNew(video: VideoItem, locallyViewed: boolean = false): boolean {
  if (!video.createdAt) return false;
  if (locallyViewed || video.viewed) return false;
  const createdTime = new Date(video.createdAt).getTime();
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  return (now - createdTime) < twentyFourHours;
}

export function getDocumentPageUrl(documentId: string, pageNumber: number): string {
  return `${API_BASE_URL}/api/documents/${documentId}/page/${pageNumber}`;
}

export async function getContentByCategories(): Promise<CategorySection[]> {
  const [videoCategories, allContent, albums, documents, locallyViewed] = await Promise.all([
    getVideoCategories().catch(() => [] as VideoCategory[]),
    getVideos().catch(() => [] as VideoItem[]),
    getAlbums().catch(() => [] as AlbumItem[]),
    getDocuments().catch(() => [] as DocumentItem[]),
    getLocalViewedContent(),
  ]);

  const sections: CategorySection[] = [];

  const contentByCategory = new Map<string, VideoItem[]>();
  allContent.forEach((item) => {
    const catId = item.categoryId || "uncategorized";
    if (!contentByCategory.has(catId)) contentByCategory.set(catId, []);
    contentByCategory.get(catId)!.push(item);
  });

  // Build a set of category IDs that have content either directly or via subcategories
  const categoryIdsWithContent = new Set<string>();
  allContent.forEach((item) => {
    if (item.categoryId) categoryIdsWithContent.add(item.categoryId);
  });
  // Propagate upward: mark parent categories if any child has content
  videoCategories.forEach((cat) => {
    if (cat.parentCategoryId && categoryIdsWithContent.has(cat.id)) {
      categoryIdsWithContent.add(cat.parentCategoryId);
    }
  });

  // Include ALL categories that have content (directly or via sub-categories)
  videoCategories.forEach((category) => {
    if (!categoryIdsWithContent.has(category.id)) return;

    const categoryItems = contentByCategory.get(category.id) || [];
    sections.push({
      id: `content-${category.id}`,
      name: category.name,
      type: "video",
      parentCategoryId: category.parentCategoryId,
      items: categoryItems.map((item) => {
        const isAudio = item.mediaType === "audio";
        const thumb = getVideoThumbnailUrl(item);
        const viewedLocally = locallyViewed.has(item.id);
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          type: isAudio ? "audio" as ContentType : "video" as ContentType,
          thumbnailUrl: thumb.url,
          thumbnailRequiresAuth: thumb.requiresAuth,
          duration: item.duration,
          categoryId: item.categoryId,
          categoryName: category.name,
          createdAt: item.createdAt,
          isNew: isVideoNew(item, viewedLocally),
        };
      }),
    });
  });

  // Uncategorized
  const uncategorizedItems = contentByCategory.get("uncategorized");
  if (uncategorizedItems && uncategorizedItems.length > 0) {
    sections.push({
      id: "content-uncategorized",
      name: "Uncategorized",
      type: "video",
      items: uncategorizedItems.map((item) => {
        const isAudio = item.mediaType === "audio";
        const thumb = getVideoThumbnailUrl(item);
        const viewedLocally = locallyViewed.has(item.id);
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          type: isAudio ? "audio" as ContentType : "video" as ContentType,
          thumbnailUrl: thumb.url,
          thumbnailRequiresAuth: thumb.requiresAuth,
          duration: item.duration,
          categoryId: item.categoryId,
          categoryName: "Uncategorized",
          createdAt: item.createdAt,
          isNew: isVideoNew(item, viewedLocally),
        };
      }),
    });
  }

  if (albums.length > 0) {
    sections.push({
      id: "albums",
      name: "Albums",
      type: "album",
      items: albums.map((album) => {
        const thumb = getAlbumThumbnailUrl(album.id);
        return {
          id: album.id,
          title: album.title,
          description: album.description,
          type: "album" as ContentType,
          thumbnailUrl: thumb.url,
          thumbnailRequiresAuth: thumb.requiresAuth,
          trackCount: album.trackCount,
          createdAt: album.createdAt,
        };
      }),
    });
  }

  if (documents.length > 0) {
    sections.push({
      id: "documents",
      name: "Documents",
      type: "document",
      items: documents.map((d) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        type: "document" as ContentType,
        pageCount: d.pageCount,
        createdAt: d.createdAt,
      })),
    });
  }

  return sections;
}
```

---

### `client/lib/query-client.ts`
```ts
import { QueryClient, QueryFunction } from "@tanstack/react-query";

export function getApiUrl(): string {
  let host = process.env.EXPO_PUBLIC_DOMAIN;
  if (!host) throw new Error("EXPO_PUBLIC_DOMAIN is not set");
  return new URL(`https://${host}`).href;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(method: string, route: string, data?: unknown): Promise<Response> {
  const baseUrl = getApiUrl();
  const url = new URL(route, baseUrl);
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: { on401: UnauthorizedBehavior }) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getApiUrl();
    const url = new URL(queryKey.join("/") as string, baseUrl);
    const res = await fetch(url, { credentials: "include" });
    if (unauthorizedBehavior === "returnNull" && res.status === 401) return null;
    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: { retry: false },
  },
});
```

---

### `client/navigation/RootStackNavigator.tsx`
```tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import LoginScreen from "@/screens/LoginScreen";
import HomeScreen from "@/screens/HomeScreen";
import ContentPlayerScreen from "@/screens/ContentPlayerScreen";
import AlbumDetailScreen from "@/screens/AlbumDetailScreen";
import * as api from "@/lib/api";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  ContentPlayer: { item: api.ContentItem };
  AlbumDetail: { item: api.ContentItem };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ContentPlayer" component={ContentPlayerScreen} options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="AlbumDetail" component={AlbumDetailScreen} options={{ animation: "slide_from_right" }} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ animationTypeForReplace: "pop" }} />
      )}
    </Stack.Navigator>
  );
}
```

---

### `client/hooks/useTheme.ts`
```ts
import { useMemo, useContext } from "react";
import { getColors, AccentColors } from "@/constants/theme";
import { SettingsContext } from "@/contexts/SettingsContext";

export function useTheme() {
  const settings = useContext(SettingsContext);
  const accentColor = settings?.accentColor ?? AccentColors.yellow;

  const theme = useMemo(() => {
    const colors = getColors(accentColor);
    return colors.dark; // App always uses dark mode
  }, [accentColor]);

  return { theme, isDark: true };
}
```

---

### `client/hooks/useColorScheme.ts`
```ts
export { useColorScheme } from "react-native";
```

---

### `client/hooks/useScreenOptions.ts`
```ts
import { Platform } from "react-native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { isLiquidGlassAvailable } from "expo-glass-effect";

import { useTheme } from "@/hooks/useTheme";

interface UseScreenOptionsParams {
  transparent?: boolean;
}

export function useScreenOptions({ transparent = true }: UseScreenOptionsParams = {}): NativeStackNavigationOptions {
  const { theme, isDark } = useTheme();

  return {
    headerTitleAlign: "center",
    headerTransparent: transparent,
    headerBlurEffect: isDark ? "dark" : "light",
    headerTintColor: theme.text,
    headerStyle: {
      backgroundColor: Platform.select({
        ios: undefined,
        android: theme.backgroundRoot,
        web: theme.backgroundRoot,
      }),
    },
    gestureEnabled: true,
    gestureDirection: "horizontal",
    fullScreenGestureEnabled: isLiquidGlassAvailable() ? false : true,
    contentStyle: { backgroundColor: theme.backgroundRoot },
  };
}
```

---

### `client/components/ThemedText.tsx`
```tsx
import { Text, type TextProps } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/constants/theme";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "h1" | "h2" | "h3" | "h4" | "body" | "small" | "link";
};

export function ThemedText({ style, lightColor, darkColor, type = "body", ...rest }: ThemedTextProps) {
  const { theme, isDark } = useTheme();

  const getColor = () => {
    if (isDark && darkColor) return darkColor;
    if (!isDark && lightColor) return lightColor;
    if (type === "link") return theme.link;
    return theme.text;
  };

  const getTypeStyle = () => {
    switch (type) {
      case "h1": return Typography.h1;
      case "h2": return Typography.h2;
      case "h3": return Typography.h3;
      case "h4": return Typography.h4;
      case "body": return Typography.body;
      case "small": return Typography.small;
      case "link": return Typography.link;
      default: return Typography.body;
    }
  };

  return <Text style={[{ color: getColor() }, getTypeStyle(), style]} {...rest} />;
}
```

---

### `client/components/ThemedView.tsx`
```tsx
import { View, type ViewProps } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const { theme, isDark } = useTheme();
  const backgroundColor =
    isDark && darkColor ? darkColor
    : !isDark && lightColor ? lightColor
    : theme.backgroundRoot;
  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
```

---

### `client/components/ErrorBoundary.tsx`
```tsx
import React, { Component, ComponentType, PropsWithChildren } from "react";
import { ErrorFallback, ErrorFallbackProps } from "@/components/ErrorFallback";

export type ErrorBoundaryProps = PropsWithChildren<{
  FallbackComponent?: ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, stackTrace: string) => void;
}>;

type ErrorBoundaryState = { error: Error | null };

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static defaultProps: { FallbackComponent: ComponentType<ErrorFallbackProps> } = {
    FallbackComponent: ErrorFallback,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }): void {
    if (typeof this.props.onError === "function") {
      this.props.onError(error, info.componentStack);
    }
  }

  resetError = (): void => {
    this.setState({ error: null });
  };

  render() {
    const { FallbackComponent } = this.props;
    return this.state.error && FallbackComponent ? (
      <FallbackComponent error={this.state.error} resetError={this.resetError} />
    ) : (
      this.props.children
    );
  }
}
```

---

### `client/components/ErrorFallback.tsx`
```tsx
import React, { useState } from "react";
import { reloadAppAsync } from "expo";
import { StyleSheet, View, Pressable, ScrollView, Text, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";

export type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const { theme } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleRestart = async () => {
    try {
      await reloadAppAsync();
    } catch {
      resetError();
    }
  };

  const formatErrorDetails = (): string => {
    let details = `Error: ${error.message}\n\n`;
    if (error.stack) details += `Stack Trace:\n${error.stack}`;
    return details;
  };

  return (
    <ThemedView style={styles.container}>
      {__DEV__ ? (
        <Pressable
          onPress={() => setIsModalVisible(true)}
          style={({ pressed }) => [styles.topButton, { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 }]}
        >
          <Feather name="alert-circle" size={20} color={theme.text} />
        </Pressable>
      ) : null}

      <View style={styles.content}>
        <ThemedText type="h1" style={styles.title}>Something went wrong</ThemedText>
        <ThemedText type="body" style={styles.message}>Please reload the app to continue.</ThemedText>
        <Pressable
          onPress={handleRestart}
          style={({ pressed }) => [styles.button, { backgroundColor: theme.link, opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
        >
          <ThemedText type="body" style={[styles.buttonText, { color: theme.buttonText }]}>Try Again</ThemedText>
        </Pressable>
      </View>

      {__DEV__ ? (
        <Modal visible={isModalVisible} animationType="slide" transparent onRequestClose={() => setIsModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <ThemedView style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <ThemedText type="h2" style={styles.modalTitle}>Error Details</ThemedText>
                <Pressable onPress={() => setIsModalVisible(false)} style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.6 : 1 }]}>
                  <Feather name="x" size={24} color={theme.text} />
                </Pressable>
              </View>
              <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator>
                <View style={[styles.errorContainer, { backgroundColor: theme.backgroundDefault }]}>
                  <Text style={[styles.errorText, { color: theme.text, fontFamily: Fonts?.mono || "monospace" }]} selectable>
                    {formatErrorDetails()}
                  </Text>
                </View>
              </ScrollView>
            </ThemedView>
          </View>
        </Modal>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%", height: "100%", justifyContent: "center", alignItems: "center", padding: Spacing["2xl"] },
  content: { alignItems: "center", justifyContent: "center", gap: Spacing.lg, width: "100%", maxWidth: 600 },
  title: { textAlign: "center", lineHeight: 40 },
  message: { textAlign: "center", opacity: 0.7, lineHeight: 24 },
  topButton: { position: "absolute", top: Spacing["2xl"] + Spacing.lg, right: Spacing.lg, width: 44, height: 44, borderRadius: BorderRadius.md, flexDirection: "row", alignItems: "center", justifyContent: "center", zIndex: 10 },
  button: { paddingVertical: Spacing.lg, borderRadius: BorderRadius.md, paddingHorizontal: Spacing["2xl"], minWidth: 200, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  buttonText: { fontWeight: "600", textAlign: "center", fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "flex-end" },
  modalContainer: { width: "100%", height: "90%", borderTopLeftRadius: BorderRadius.lg, borderTopRightRadius: BorderRadius.lg },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: "rgba(128, 128, 128, 0.2)" },
  modalTitle: { fontWeight: "600" },
  closeButton: { padding: Spacing.xs },
  modalScrollView: { flex: 1 },
  modalScrollContent: { padding: Spacing.lg },
  errorContainer: { width: "100%", borderRadius: BorderRadius.md, overflow: "hidden", padding: Spacing.lg },
  errorText: { fontSize: 12, lineHeight: 18, width: "100%" },
});
```

---

### `client/components/LoadingScreen.tsx`
```tsx
import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ActivityIndicator size="large" color={theme.primary} />
      <ThemedText style={[styles.message, { color: theme.textSecondary }]}>{message}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  message: { marginTop: Spacing.lg, fontSize: 16 },
});
```

---

### `client/components/Button.tsx`
```tsx
import React, { ReactNode } from "react";
import { StyleSheet, Pressable, ViewStyle, StyleProp } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, WithSpringConfig } from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface ButtonProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({ onPress, children, style, disabled = false }: ButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) scale.value = withSpring(0.98, springConfig);
  };

  const handlePressOut = () => {
    if (!disabled) scale.value = withSpring(1, springConfig);
  };

  return (
    <AnimatedPressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.button, { backgroundColor: theme.link, opacity: disabled ? 0.5 : 1 }, style, animatedStyle]}
    >
      <ThemedText type="body" style={[styles.buttonText, { color: theme.buttonText }]}>
        {children}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: { height: Spacing.buttonHeight, borderRadius: BorderRadius.full, alignItems: "center", justifyContent: "center" },
  buttonText: { fontWeight: "600" },
});
```

---

### `client/components/Input.tsx`
```tsx
import React, { useState } from "react";
import { View, TextInput, StyleSheet, TextInputProps, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export function Input({ label, error, isPassword = false, value, onFocus, onBlur, ...props }: InputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const borderColor = useSharedValue(theme.inputBorder);

  const animatedBorderStyle = useAnimatedStyle(() => ({ borderColor: borderColor.value }));

  const handleFocus = (e: any) => {
    setIsFocused(true);
    borderColor.value = withTiming(theme.primary, { duration: 150 });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    borderColor.value = withTiming(error ? theme.destructive : theme.inputBorder, { duration: 150 });
    onBlur?.(e);
  };

  const hasValue = value && value.length > 0;
  const isLabelFloating = isFocused || hasValue;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.inputBackground },
          animatedBorderStyle,
          error ? { borderColor: theme.destructive } : null,
        ]}
      >
        <ThemedText
          style={[styles.label, {
            color: error ? theme.destructive : isFocused ? theme.primary : theme.textSecondary,
            top: isLabelFloating ? 8 : 16,
            fontSize: isLabelFloating ? 12 : 16,
          }]}
        >
          {label}
        </ThemedText>
        <TextInput
          value={value}
          style={[styles.input, { color: theme.text, paddingTop: 24 }]}
          placeholderTextColor={theme.textSecondary}
          secureTextEntry={isPassword && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {isPassword ? (
          <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton} hitSlop={8}>
            <Feather name={showPassword ? "eye-off" : "eye"} size={20} color={theme.textSecondary} />
          </Pressable>
        ) : null}
      </Animated.View>
      {error ? (
        <ThemedText style={[styles.error, { color: theme.destructive }]}>{error}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  inputContainer: { borderWidth: 1.5, borderRadius: BorderRadius.sm, position: "relative", minHeight: Spacing.inputHeight + 8 },
  label: { position: "absolute", left: Spacing.lg, fontWeight: "500" },
  input: { flex: 1, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm, fontSize: 16, minHeight: Spacing.inputHeight + 8 },
  eyeButton: { position: "absolute", right: Spacing.lg, top: "50%", transform: [{ translateY: -10 }] },
  error: { fontSize: 12, marginTop: Spacing.xs, marginLeft: Spacing.xs },
});
```

---

### `client/components/KeyboardAwareScrollViewCompat.tsx`
```tsx
import { Platform, ScrollView, ScrollViewProps } from "react-native";
import { KeyboardAwareScrollView, KeyboardAwareScrollViewProps } from "react-native-keyboard-controller";

type Props = KeyboardAwareScrollViewProps & ScrollViewProps;

export function KeyboardAwareScrollViewCompat({ children, keyboardShouldPersistTaps = "handled", ...props }: Props) {
  if (Platform.OS === "web") {
    return (
      <ScrollView keyboardShouldPersistTaps={keyboardShouldPersistTaps} {...props}>
        {children}
      </ScrollView>
    );
  }

  return (
    <KeyboardAwareScrollView keyboardShouldPersistTaps={keyboardShouldPersistTaps} {...props}>
      {children}
    </KeyboardAwareScrollView>
  );
}
```

---

### `client/components/ContentCard.tsx`
```tsx
import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Pressable, Dimensions, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import * as api from "@/lib/api";

const AUTH_TOKEN_KEY = "@onetimeonetime_auth_token";

interface ContentCardProps {
  item: api.ContentItem;
  onPress: () => void;
  size?: "small" | "medium" | "large";
  cardWidth?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function ContentCard({ item, onPress, size = "medium", cardWidth: propCardWidth }: ContentCardProps) {
  const { theme } = useTheme();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    if (item.thumbnailRequiresAuth) {
      AsyncStorage.getItem(AUTH_TOKEN_KEY).then(setAuthToken);
    }
  }, [item.thumbnailRequiresAuth]);

  const handleImageLoad = useCallback(() => { setImageLoading(false); }, []);
  const handleImageError = useCallback(() => { setImageError(true); setImageLoading(false); }, []);

  const cardWidth = propCardWidth
    ? propCardWidth
    : size === "small"
    ? 140
    : size === "large"
    ? SCREEN_WIDTH - Spacing.lg * 2
    : "100%";

  const cardHeight = propCardWidth
    ? propCardWidth
    : size === "small"
    ? 140
    : size === "large"
    ? 200
    : undefined;

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTypeIcon = (): keyof typeof Feather.glyphMap => {
    switch (item.type) {
      case "video": return "play-circle";
      case "audio": return "headphones";
      case "document": return "file-text";
      case "album": return "disc";
      default: return "file";
    }
  };

  const thumbnailUrl = item.thumbnailUrl;
  const needsAuth = item.thumbnailRequiresAuth && authToken;
  const showPlaceholder = !thumbnailUrl || imageError || (item.thumbnailRequiresAuth && !authToken);

  const imageSource = thumbnailUrl
    ? { uri: thumbnailUrl, headers: needsAuth ? { Authorization: `Bearer ${authToken}` } : undefined }
    : undefined;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          width: cardWidth,
          marginRight: size === "small" ? Spacing.md : 0,
          marginBottom: Spacing.md,
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={[
        styles.imageContainer,
        {
          height: size === "large" ? cardHeight : undefined,
          aspectRatio: size !== "large" ? 16 / 9 : undefined,
          borderRadius: BorderRadius.xs,
          backgroundColor: item.type === "audio" ? "#000000" : theme.backgroundSecondary,
        },
      ]}>
        {showPlaceholder ? (
          <View style={[styles.placeholderImage, { backgroundColor: item.type === "audio" ? "#000000" : theme.backgroundSecondary, borderRadius: BorderRadius.xs }]}>
            <Feather name={getTypeIcon()} size={32} color={theme.textSecondary} />
          </View>
        ) : (
          <>
            {imageLoading ? (
              <View style={[styles.placeholderImage, { backgroundColor: item.type === "audio" ? "#000000" : theme.backgroundSecondary, borderRadius: BorderRadius.xs, position: "absolute", zIndex: 1 }]}>
                <ActivityIndicator size="small" color={theme.accent} />
              </View>
            ) : null}
            <Image
              source={imageSource}
              style={[styles.image, { borderRadius: BorderRadius.xs }]}
              contentFit={item.type === "audio" ? "contain" : "cover"}
              transition={300}
              priority="normal"
              recyclingKey={item.id}
              onLoad={handleImageLoad}
              onError={handleImageError}
              cachePolicy="memory-disk"
            />
          </>
        )}
        {item.duration ? (
          <View style={styles.duration}>
            <ThemedText style={styles.durationText}>{formatDuration(item.duration)}</ThemedText>
          </View>
        ) : null}
        {item.pageCount ? (
          <View style={styles.duration}>
            <ThemedText style={styles.durationText}>{item.pageCount} pages</ThemedText>
          </View>
        ) : null}
        {item.trackCount ? (
          <View style={styles.duration}>
            <ThemedText style={styles.durationText}>{item.trackCount} tracks</ThemedText>
          </View>
        ) : null}
        <View style={styles.typeIcon}>
          <Feather name={getTypeIcon()} size={16} color="#FFFFFF" />
        </View>
        {item.isNew ? (
          <View style={styles.newBadge}>
            <ThemedText style={styles.newBadgeText}>NEW</ThemedText>
          </View>
        ) : null}
      </View>
      <ThemedText numberOfLines={2} style={[styles.title, { color: theme.text }]}>
        {item.title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { overflow: "hidden" },
  imageContainer: { width: "100%", position: "relative", overflow: "hidden" },
  image: { width: "100%", height: "100%" },
  placeholderImage: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center" },
  duration: { position: "absolute", bottom: Spacing.xs, right: Spacing.xs, backgroundColor: "rgba(0, 0, 0, 0.75)", paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: 4 },
  durationText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  typeIcon: { position: "absolute", top: Spacing.xs, left: Spacing.xs, backgroundColor: "rgba(0, 0, 0, 0.6)", padding: 4, borderRadius: 4 },
  newBadge: { position: "absolute", top: Spacing.xs, right: Spacing.xs, backgroundColor: "#EDE518", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  newBadgeText: { color: "#161616", fontSize: 10, fontWeight: "700" },
  title: { fontSize: 14, fontWeight: "500", marginTop: Spacing.sm },
});
```

---

### `client/components/ZoomableImage.tsx`
```tsx
import React from "react";
import { StyleSheet, Dimensions, Platform } from "react-native";
import { Image, ImageStyle } from "expo-image";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ZoomableImageProps {
  uri: string;
  headers?: Record<string, string>;
  style?: ImageStyle;
  onZoomStart?: () => void;
  onZoomEnd?: () => void;
  resetKey?: number;
}

export function ZoomableImage({ uri, headers, style, onZoomStart, onZoomEnd, resetKey }: ZoomableImageProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const isZoomed = useSharedValue(false);

  React.useEffect(() => {
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    isZoomed.value = false;
  }, [resetKey]);

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      if (!isZoomed.value && onZoomStart) {
        isZoomed.value = true;
        runOnJS(onZoomStart)();
      }
    })
    .onUpdate((event) => {
      scale.value = Math.min(Math.max(savedScale.value * event.scale, 1), 4);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= 1.1) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        if (isZoomed.value && onZoomEnd) {
          isZoomed.value = false;
          runOnJS(onZoomEnd)();
        }
      }
    });

  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(2)
    .onUpdate((event) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + event.translationX;
        translateY.value = savedTranslateY.value + event.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        if (isZoomed.value && onZoomEnd) {
          isZoomed.value = false;
          runOnJS(onZoomEnd)();
        }
      } else {
        if (!isZoomed.value && onZoomStart) {
          isZoomed.value = true;
          runOnJS(onZoomStart)();
        }
        scale.value = withTiming(2.5);
        savedScale.value = 2.5;
      }
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture, doubleTapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
    zIndex: scale.value > 1 ? 1000 : 1,
  }));

  if (Platform.OS === "web") {
    return <Image source={{ uri, headers }} style={style} contentFit="contain" />;
  }

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Image source={{ uri, headers }} style={style} contentFit="contain" />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { width: SCREEN_WIDTH, alignItems: "center" },
});
```

---

### `client/components/SettingsModal.tsx`
```tsx
import React, { useState } from "react";
import { View, StyleSheet, Modal, Pressable, ScrollView, Platform, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, AccentColors, AccentColorName } from "@/constants/theme";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const colorOptions: { name: AccentColorName; label: string }[] = [
  { name: "yellow", label: "Yellow" },
  { name: "blue", label: "Blue" },
  { name: "green", label: "Green" },
  { name: "purple", label: "Purple" },
  { name: "pink", label: "Pink" },
  { name: "orange", label: "Orange" },
  { name: "red", label: "Red" },
  { name: "teal", label: "Teal" },
];

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { accentColorName, setAccentColor } = useSettings();
  const { logout } = useAuth();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const handleColorSelect = (colorName: AccentColorName) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAccentColor(colorName);
  };

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === "web") {
      setShowSignOutConfirm(true);
    } else {
      Alert.alert(
        "Sign Out",
        "You are about to sign out. You will need to enter your password again to access your content.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sign Out",
            style: "destructive",
            onPress: async () => { onClose(); await logout(); },
          },
        ]
      );
    }
  };

  const confirmSignOut = async () => {
    setShowSignOutConfirm(false);
    onClose();
    await logout();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
          <ThemedText style={[styles.headerTitle, { color: theme.text }]}>Settings</ThemedText>
          <Pressable onPress={onClose} style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.6 : 1 }]} hitSlop={8}>
            <Feather name="x" size={24} color={theme.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + Spacing.xl }]}>
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Theme Color</ThemedText>
            <ThemedText style={[styles.sectionDescription, { color: theme.textSecondary }]}>Choose your preferred accent color</ThemedText>
            <View style={styles.colorGrid}>
              {colorOptions.map((option) => {
                const isSelected = option.name === accentColorName;
                const color = AccentColors[option.name];
                return (
                  <Pressable
                    key={option.name}
                    onPress={() => handleColorSelect(option.name)}
                    style={[styles.colorOption, { backgroundColor: theme.backgroundSecondary, borderColor: isSelected ? color : theme.border, borderWidth: isSelected ? 2 : 1 }]}
                  >
                    <View style={[styles.colorSwatch, { backgroundColor: color }]}>
                      {isSelected ? <Feather name="check" size={16} color="#FFFFFF" /> : null}
                    </View>
                    <ThemedText style={[styles.colorLabel, { color: theme.text }]}>{option.label}</ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Account</ThemedText>
            <Pressable onPress={handleSignOut} style={[styles.signOutButton, { backgroundColor: theme.backgroundSecondary, borderColor: theme.destructive }]}>
              <Feather name="log-out" size={20} color={theme.destructive} />
              <ThemedText style={[styles.signOutText, { color: theme.destructive }]}>Sign Out</ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </View>

      {showSignOutConfirm ? (
        <View style={[styles.confirmOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.confirmBox, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={[styles.confirmTitle, { color: theme.text }]}>Sign Out</ThemedText>
            <ThemedText style={[styles.confirmMessage, { color: theme.textSecondary }]}>
              You are about to sign out. You will need to enter your password again to access your content.
            </ThemedText>
            <View style={styles.confirmButtons}>
              <Pressable onPress={() => setShowSignOutConfirm(false)} style={[styles.confirmButton, { backgroundColor: theme.backgroundSecondary }]}>
                <ThemedText style={[styles.confirmButtonText, { color: theme.text }]}>Cancel</ThemedText>
              </Pressable>
              <Pressable onPress={confirmSignOut} style={[styles.confirmButton, { backgroundColor: theme.destructive }]}>
                <ThemedText style={[styles.confirmButtonText, { color: "#FFFFFF" }]}>Sign Out</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, borderBottomWidth: 1 },
  headerTitle: { fontSize: 17, fontWeight: "600" },
  closeButton: { position: "absolute", right: Spacing.lg, bottom: Spacing.md, padding: Spacing.xs },
  content: { flex: 1 },
  contentContainer: { paddingTop: Spacing.xl },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing["2xl"] },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: Spacing.xs },
  sectionDescription: { fontSize: 14, marginBottom: Spacing.lg },
  colorGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  colorOption: { width: 72, padding: Spacing.sm, borderRadius: BorderRadius.md, alignItems: "center" },
  colorSwatch: { width: 40, height: 40, borderRadius: BorderRadius.md, justifyContent: "center", alignItems: "center", marginBottom: Spacing.xs },
  colorLabel: { fontSize: 12, textAlign: "center" },
  signOutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: Spacing.lg, borderRadius: BorderRadius.md, borderWidth: 1 },
  signOutText: { fontSize: 16, fontWeight: "600", marginLeft: Spacing.sm },
  confirmOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center", padding: Spacing.xl },
  confirmBox: { width: "100%", maxWidth: 320, borderRadius: BorderRadius.lg, padding: Spacing.xl },
  confirmTitle: { fontSize: 18, fontWeight: "600", marginBottom: Spacing.sm, textAlign: "center" },
  confirmMessage: { fontSize: 14, lineHeight: 20, textAlign: "center", marginBottom: Spacing.xl },
  confirmButtons: { flexDirection: "row", gap: Spacing.md },
  confirmButton: { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, alignItems: "center" },
  confirmButtonText: { fontSize: 15, fontWeight: "600" },
});
```

---

### `client/screens/LoginScreen.tsx`
```tsx
import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setError("");
    setIsLoading(true);
    const result = await login(email.trim(), password);
    setIsLoading(false);
    if (!result.success) {
      setError(result.error || "Login failed");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing["5xl"], paddingBottom: insets.bottom + Spacing["2xl"] }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.logoContainer}>
        <Image source={require("../../assets/images/logo.webp")} style={styles.logo} contentFit="contain" />
        <ThemedText style={[styles.tagline, { color: theme.textSecondary }]}>
          Sign in to access your content
        </ThemedText>
      </View>

      <View style={styles.formContainer}>
        {error ? (
          <View style={[styles.errorContainer, { backgroundColor: `${theme.destructive}15` }]}>
            <ThemedText style={[styles.errorText, { color: theme.destructive }]}>{error}</ThemedText>
          </View>
        ) : null}

        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" editable={!isLoading} testID="input-email" />
        <Input label="Password" value={password} onChangeText={setPassword} isPassword autoCapitalize="none" autoComplete="password" textContentType="password" editable={!isLoading} testID="input-password" />

        <Button onPress={handleLogin} disabled={isLoading} style={[styles.loginButton, { backgroundColor: theme.accent }]}>
          {isLoading ? <ActivityIndicator color={theme.buttonText} size="small" /> : "Sign In"}
        </Button>
      </View>

      <View style={styles.footer}>
        <ThemedText style={[styles.footerText, { color: theme.textSecondary }]}>Create and manage your account at</ThemedText>
        <ThemedText style={[styles.websiteText, { color: theme.accent }]}>onetimeonetime.com</ThemedText>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: Spacing["2xl"] },
  logoContainer: { alignItems: "center", marginBottom: Spacing["4xl"] },
  logo: { width: 200, height: 80, marginBottom: Spacing.lg },
  tagline: { fontSize: 16 },
  formContainer: { flex: 1 },
  errorContainer: { padding: Spacing.md, borderRadius: BorderRadius.xs, marginBottom: Spacing.lg },
  errorText: { fontSize: 14, textAlign: "center" },
  loginButton: { marginTop: Spacing.sm },
  footer: { alignItems: "center", paddingTop: Spacing["2xl"] },
  footerText: { fontSize: 13, textAlign: "center" },
  websiteText: { fontSize: 14, fontWeight: "600", marginTop: Spacing.xs },
});
```

---

### `client/screens/HomeScreen.tsx`
```tsx
import React, { useCallback, useState, useMemo } from "react";
import {
  View, StyleSheet, FlatList, ScrollView, RefreshControl,
  Pressable, ActivityIndicator, Linking, useWindowDimensions, TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ContentCard } from "@/components/ContentCard";
import { SettingsModal } from "@/components/SettingsModal";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import * as api from "@/lib/api";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function HomeScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedPrimaryCategory, setSelectedPrimaryCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTrending, setShowTrending] = useState(true);
  const { width: windowWidth } = useWindowDimensions();

  const gridConfig = useMemo(() => {
    const padding = Spacing.lg * 2;
    const gap = Spacing.xs * 2;
    const availableWidth = windowWidth - padding;
    let numColumns = 3;
    if (windowWidth < 400) numColumns = 2;
    else if (windowWidth >= 1024) numColumns = 5;
    else if (windowWidth >= 768) numColumns = 4;
    const cardWidth = (availableWidth - gap * (numColumns - 1)) / numColumns;
    return { numColumns, cardWidth };
  }, [windowWidth]);

  const { data: sections, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["content-by-categories"],
    queryFn: api.getContentByCategories,
  });

  const { data: subscription, refetch: refetchSubscription } = useQuery({
    queryKey: ["subscription-status"],
    queryFn: api.checkSubscription,
  });

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const isSubscriptionInactive = useMemo(() => {
    if (!subscription) return false;
    if (subscription.isWhitelisted) return false;
    return !subscription.active;
  }, [subscription]);

  const allItems = useMemo(() => {
    if (!sections) return [];
    return sections.flatMap((s) => s.items);
  }, [sections]);

  const recentItems = useMemo(() => {
    return [...allItems]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [allItems]);

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (sections) {
      sections.forEach((s) => { s.items.forEach((item) => { map[item.id] = s.name; }); });
    }
    return map;
  }, [sections]);

  // Top-level (primary) categories: sections with no parentCategoryId
  const primaryCategories = useMemo(() => {
    if (!sections) return [];
    return sections.filter((s) => !s.parentCategoryId);
  }, [sections]);

  // Sub-categories of selected primary
  // Section IDs are `content-<rawId>`, parentCategoryId on section is the raw ID
  const subCategories = useMemo(() => {
    if (!sections || !selectedPrimaryCategory) return [];
    const rawId = selectedPrimaryCategory.replace(/^content-/, "");
    return sections.filter((s) => s.parentCategoryId === rawId);
  }, [sections, selectedPrimaryCategory]);

  // Items to show in grid
  const filteredItems = useMemo(() => {
    if (!sections) return [];
    if (selectedSubCategory) {
      const section = sections.find((s) => s.id === selectedSubCategory);
      return section ? section.items : [];
    }
    if (selectedPrimaryCategory) {
      const primarySection = sections.find((s) => s.id === selectedPrimaryCategory);
      const primaryItems = primarySection ? primarySection.items : [];
      const rawId = selectedPrimaryCategory.replace(/^content-/, "");
      const subItems = sections.filter((s) => s.parentCategoryId === rawId).flatMap((s) => s.items);
      return [...primaryItems, ...subItems];
    }
    return [];
  }, [selectedPrimaryCategory, selectedSubCategory, sections]);

  const trendingItems = useMemo(() => {
    if (!allItems.length) return [];
    return [...allItems]
      .filter((item) => item.type === "video")
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 10);
  }, [allItems]);

  const fuzzySearch = (query: string, text: string): boolean => {
    if (!query) return true;
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    if (textLower.includes(queryLower)) return true;
    let queryIndex = 0;
    for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
      if (textLower[i] === queryLower[queryIndex]) queryIndex++;
    }
    return queryIndex === queryLower.length;
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return allItems.filter((item) => fuzzySearch(searchQuery, item.title));
  }, [searchQuery, allItems]);

  const handleContentPress = useCallback((item: api.ContentItem) => {
    if (item.type === "album") {
      navigation.navigate("AlbumDetail", { item });
    } else {
      navigation.navigate("ContentPlayer", { item });
    }
  }, [navigation]);

  const handlePrimaryCategoryPress = (sectionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (sectionId === selectedPrimaryCategory) {
      setSelectedPrimaryCategory(null);
      setSelectedSubCategory(null);
    } else {
      setSelectedPrimaryCategory(sectionId);
      setSelectedSubCategory(null);
    }
  };

  const handleSubCategoryPress = (sectionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSubCategory(sectionId === selectedSubCategory ? null : sectionId);
  };

  const handleToggleTrending = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowTrending(!showTrending);
  };

  const handleClearSearch = () => { setSearchQuery(""); };

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettingsVisible(true);
  };

  const handleUpdateSubscription = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL("https://onetimeonetime.com");
  };

  const handleRefreshStatus = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    refetchSubscription();
  };

  const SkeletonCard = ({ width }: { width: number }) => (
    <View style={[styles.skeletonCard, { width, marginRight: Spacing.md }]}>
      <View style={[styles.skeletonImage, { backgroundColor: theme.backgroundSecondary, aspectRatio: 16 / 9 }]} />
      <View style={[styles.skeletonTitle, { backgroundColor: theme.backgroundSecondary }]} />
    </View>
  );

  const SkeletonSection = ({ title }: { title: string }) => (
    <View style={styles.recentSection}>
      <View style={styles.sectionHeader}>
        <View style={[styles.skeletonIcon, { backgroundColor: theme.backgroundSecondary }]} />
        <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>{title}</ThemedText>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentItems}>
        <SkeletonCard width={140} />
        <SkeletonCard width={140} />
        <SkeletonCard width={140} />
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <Image source={require("../../assets/images/logo.webp")} style={styles.logo} contentFit="contain" />
        </View>
        <Pressable onPress={handleSettingsPress} style={({ pressed }) => [styles.settingsButton, { opacity: pressed ? 0.6 : 1 }]} hitSlop={8} testID="button-settings">
          <Feather name="settings" size={22} color={theme.textSecondary} />
        </Pressable>
      </View>

      <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />

      {isSubscriptionInactive ? (
        <View style={[styles.inactiveContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={[styles.inactiveCard, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="alert-circle" size={48} color={theme.warning} />
            <ThemedText style={[styles.inactiveTitle, { color: theme.text }]}>Subscription Inactive</ThemedText>
            <ThemedText style={[styles.inactiveMessage, { color: theme.textSecondary }]}>
              Your subscription is no longer active. Please visit onetimeonetime.com to update your subscription and continue accessing content.
            </ThemedText>
            <Pressable onPress={handleUpdateSubscription} style={({ pressed }) => [styles.updateButton, { backgroundColor: theme.accent, opacity: pressed ? 0.8 : 1 }]}>
              <ThemedText style={[styles.updateButtonText, { color: theme.buttonText }]}>Update Subscription</ThemedText>
              <Feather name="external-link" size={16} color={theme.buttonText} style={{ marginLeft: Spacing.sm }} />
            </Pressable>
            <Pressable onPress={handleRefreshStatus} style={({ pressed }) => [styles.refreshButton, { borderColor: theme.border, opacity: pressed ? 0.6 : 1 }]}>
              <Feather name="refresh-cw" size={16} color={theme.textSecondary} style={{ marginRight: Spacing.sm }} />
              <ThemedText style={[styles.refreshButtonText, { color: theme.textSecondary }]}>Refresh Status</ThemedText>
            </Pressable>
          </View>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + Spacing.xl }]}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.accent} />}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.searchSection}>
            <View style={[styles.searchContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <Feather name="search" size={18} color={theme.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search videos..."
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                testID="input-search"
              />
              {searchQuery.length > 0 ? (
                <Pressable onPress={handleClearSearch} hitSlop={8} testID="button-clear-search">
                  <Feather name="x" size={18} color={theme.textSecondary} />
                </Pressable>
              ) : null}
            </View>
          </View>

          {searchQuery.trim().length > 0 ? (
            <View style={styles.searchResultsSection}>
              <View style={styles.sectionHeader}>
                <Feather name="search" size={18} color={theme.accent} style={styles.sectionIcon} />
                <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Search Results ({searchResults.length})</ThemedText>
              </View>
              {searchResults.length > 0 ? (
                <View style={styles.contentGrid}>
                  {searchResults.map((item) => (
                    <View key={item.id} style={[styles.gridItem, { width: gridConfig.cardWidth + Spacing.xs * 2 }]}>
                      <View style={styles.searchResultCard}>
                        <ContentCard item={item} onPress={() => handleContentPress(item)} size="medium" cardWidth={gridConfig.cardWidth} />
                        {categoryMap[item.id] ? (
                          <View style={[styles.categoryBadge, { backgroundColor: theme.accent }]}>
                            <ThemedText style={[styles.categoryBadgeText, { color: theme.buttonText }]}>{categoryMap[item.id]}</ThemedText>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptySearch}>
                  <Feather name="search" size={32} color={theme.textSecondary} />
                  <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>No results found for "{searchQuery}"</ThemedText>
                </View>
              )}
            </View>
          ) : isLoading ? (
            <>
              <SkeletonSection title="Recent" />
              <SkeletonSection title="Trending" />
              <SkeletonSection title="Categories" />
            </>
          ) : (
            <>
              <View style={styles.recentSection}>
                <View style={styles.sectionHeader}>
                  <Feather name="clock" size={18} color={theme.accent} style={styles.sectionIcon} />
                  <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Recent</ThemedText>
                </View>
                {recentItems.length > 0 ? (
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={recentItems}
                    keyExtractor={(item) => `recent-${item.id}`}
                    renderItem={({ item }) => (
                      <ContentCard item={item} onPress={() => handleContentPress(item)} size="small" />
                    )}
                    contentContainerStyle={styles.recentItems}
                  />
                ) : (
                  <View style={styles.emptyRecent}>
                    <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>No recent content</ThemedText>
                  </View>
                )}
              </View>

              {trendingItems.length > 0 ? (
                <View style={styles.trendingSection}>
                  <Pressable onPress={handleToggleTrending} style={styles.trendingHeader}>
                    <View style={styles.sectionHeader}>
                      <Feather name="trending-up" size={18} color={theme.accent} style={styles.sectionIcon} />
                      <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Trending</ThemedText>
                    </View>
                    <Feather name={showTrending ? "chevron-up" : "chevron-down"} size={20} color={theme.textSecondary} />
                  </Pressable>
                  {showTrending ? (
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={trendingItems}
                      keyExtractor={(item) => `trending-${item.id}`}
                      renderItem={({ item }) => (
                        <ContentCard item={item} onPress={() => handleContentPress(item)} size="small" />
                      )}
                      contentContainerStyle={styles.trendingItems}
                    />
                  ) : null}
                </View>
              ) : null}

              <View style={styles.categoriesSection}>
                <View style={styles.sectionHeader}>
                  <Feather name="folder" size={18} color={theme.accent} style={styles.sectionIcon} />
                  <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Categories</ThemedText>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryChips}>
                  {primaryCategories.map((category) => {
                    const isSelected = category.id === selectedPrimaryCategory;
                    return (
                      <Pressable
                        key={category.id}
                        onPress={() => handlePrimaryCategoryPress(category.id)}
                        style={[styles.categoryChip, {
                          backgroundColor: isSelected ? theme.accent : theme.backgroundSecondary,
                          borderColor: isSelected ? theme.accent : theme.border,
                        }]}
                      >
                        <ThemedText style={[styles.categoryChipText, { color: isSelected ? theme.buttonText : theme.text }]}>
                          {category.name}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                {subCategories.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.categoryChips, styles.subCategoryChips]}>
                    {subCategories.map((sub) => {
                      const isSelected = sub.id === selectedSubCategory;
                      return (
                        <Pressable
                          key={sub.id}
                          onPress={() => handleSubCategoryPress(sub.id)}
                          style={[styles.categoryChip, styles.subCategoryChip, {
                            backgroundColor: isSelected ? theme.accent : "transparent",
                            borderColor: isSelected ? theme.accent : theme.accent,
                          }]}
                        >
                          <ThemedText style={[styles.categoryChipText, { color: isSelected ? theme.buttonText : theme.accent, fontSize: 13 }]}>
                            {sub.name}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                ) : null}
              </View>

              {selectedPrimaryCategory ? (
                <View style={styles.filteredContent}>
                  <View style={styles.contentGrid}>
                    {filteredItems.map((item) => (
                      <View key={item.id} style={[styles.gridItem, { width: gridConfig.cardWidth + Spacing.xs * 2 }]}>
                        <ContentCard item={item} onPress={() => handleContentPress(item)} size="medium" cardWidth={gridConfig.cardWidth} />
                      </View>
                    ))}
                  </View>
                  {filteredItems.length === 0 ? (
                    <View style={styles.emptyCategory}>
                      <Feather name="inbox" size={32} color={theme.textSecondary} />
                      <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>No content in this category</ThemedText>
                    </View>
                  ) : null}
                </View>
              ) : (
                <View style={styles.selectCategoryHint}>
                  <Feather name="arrow-up" size={24} color={theme.textSecondary} />
                  <ThemedText style={[styles.hintText, { color: theme.textSecondary }]}>Select a category to browse content</ThemedText>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm, borderBottomWidth: 1 },
  headerLeft: { flex: 1 },
  logo: { width: 120, height: 40 },
  settingsButton: { padding: Spacing.xs },
  content: { flex: 1 },
  contentContainer: { paddingTop: Spacing.md },
  searchSection: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  searchContainer: { flexDirection: "row", alignItems: "center", borderRadius: BorderRadius.lg, borderWidth: 1, paddingHorizontal: Spacing.md, height: 44 },
  searchIcon: { marginRight: Spacing.sm },
  searchInput: { flex: 1, fontSize: 15, height: "100%" },
  recentSection: { marginBottom: Spacing.lg },
  trendingSection: { marginBottom: Spacing.lg },
  trendingHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  sectionHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  sectionIcon: { marginRight: Spacing.sm },
  sectionTitle: { fontSize: 17, fontWeight: "600" },
  recentItems: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  trendingItems: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  categoriesSection: { marginBottom: Spacing.lg },
  categoryChips: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm, gap: Spacing.sm, flexDirection: "row" },
  subCategoryChips: { paddingTop: Spacing.xs },
  categoryChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1 },
  subCategoryChip: { paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  categoryChipText: { fontSize: 14, fontWeight: "500" },
  filteredContent: { paddingHorizontal: Spacing.lg },
  contentGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs * 2 },
  gridItem: { padding: Spacing.xs },
  searchResultCard: { position: "relative" },
  categoryBadge: { position: "absolute", bottom: Spacing.md + Spacing.xs, left: 0, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.xs },
  categoryBadgeText: { fontSize: 10, fontWeight: "600" },
  emptySearch: { alignItems: "center", paddingVertical: Spacing["3xl"], gap: Spacing.md },
  emptyRecent: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  emptyCategory: { alignItems: "center", paddingVertical: Spacing["3xl"], gap: Spacing.md },
  emptyText: { fontSize: 14 },
  selectCategoryHint: { alignItems: "center", paddingVertical: Spacing["3xl"], gap: Spacing.md },
  hintText: { fontSize: 14 },
  searchResultsSection: { marginBottom: Spacing.lg },
  skeletonCard: { overflow: "hidden" },
  skeletonImage: { width: "100%", borderRadius: BorderRadius.xs },
  skeletonTitle: { height: 14, borderRadius: 4, marginTop: Spacing.sm, width: "80%" },
  skeletonIcon: { width: 18, height: 18, borderRadius: 4, marginRight: Spacing.sm },
  inactiveContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.xl },
  inactiveCard: { borderRadius: BorderRadius.xl, padding: Spacing["2xl"], alignItems: "center", gap: Spacing.md, maxWidth: 360, width: "100%" },
  inactiveTitle: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  inactiveMessage: { fontSize: 14, lineHeight: 20, textAlign: "center" },
  updateButton: { flexDirection: "row", alignItems: "center", paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.lg, marginTop: Spacing.sm },
  updateButtonText: { fontSize: 15, fontWeight: "600" },
  refreshButton: { flexDirection: "row", alignItems: "center", paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.md, borderWidth: 1, marginTop: Spacing.xs },
  refreshButtonText: { fontSize: 13 },
});
```

---

### `client/screens/ContentPlayerScreen.tsx`
```tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View, StyleSheet, ScrollView, Pressable, Dimensions,
  ActivityIndicator, GestureResponderEvent, Platform, FlatList, useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Image } from "expo-image";
import { Audio, AVPlaybackStatus } from "expo-av";
import { WebView } from "react-native-webview";
import { useVideoPlayer, VideoView } from "expo-video";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { ZoomableImage } from "@/components/ZoomableImage";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import * as api from "@/lib/api";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AUTH_TOKEN_KEY = "@onetimeonetime_auth_token";

type ContentPlayerRouteProp = RouteProp<RootStackParamList, "ContentPlayer">;

function NativeVideoPlayer({ hlsUrl }: { hlsUrl: string }) {
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  const player = useVideoPlayer(hlsUrl, (p) => {
    p.loop = false;
    p.play();
  });

  useEffect(() => {
    const subscription = player.addListener("statusChange", (status) => {
      if (status.status === "error") {
        setError(status.error?.message || "Video playback failed");
      }
    });
    return () => subscription.remove();
  }, [player]);

  if (error) {
    return (
      <View style={[videoPlayerStyles.container, videoPlayerStyles.errorContainer]}>
        <Feather name="alert-circle" size={32} color={theme.textSecondary} />
        <ThemedText style={{ color: theme.textSecondary, marginTop: 8 }}>{error}</ThemedText>
      </View>
    );
  }

  return (
    <View style={videoPlayerStyles.container}>
      <VideoView player={player} style={videoPlayerStyles.video} allowsFullscreen allowsPictureInPicture contentFit="contain" nativeControls />
    </View>
  );
}

const videoPlayerStyles = StyleSheet.create({
  container: { width: SCREEN_WIDTH, height: (SCREEN_WIDTH * 9) / 16, backgroundColor: "#000000" },
  video: { width: "100%", height: "100%" },
  errorContainer: { justifyContent: "center", alignItems: "center" },
});

export default function ContentPlayerScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<ContentPlayerRouteProp>();
  const { item } = route.params;
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioPosition, setAudioPosition] = useState(0);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [documentPages, setDocumentPages] = useState<string[]>([]);
  const [videoEmbedUrl, setVideoEmbedUrl] = useState<string | null>(null);
  const [videoHlsUrl, setVideoHlsUrl] = useState<string | null>(null);
  const [vimeoVideoId, setVimeoVideoId] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [audioStreamUrl, setAudioStreamUrl] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const progressBarRef = useRef<View>(null);
  const documentListRef = useRef<FlatList>(null);
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const [zoomedPageIndex, setZoomedPageIndex] = useState<number | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showDocumentControls, setShowDocumentControls] = useState(true);

  const playbackSpeeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  useEffect(() => {
    AsyncStorage.getItem(AUTH_TOKEN_KEY).then(setAuthToken);
  }, []);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        console.log("Audio mode setup error:", error);
      }
    };
    setupAudio();
  }, []);

  useEffect(() => {
    if (item.type === "video" || item.type === "audio") {
      setIsLoading(true);
      setVideoError(null);
      setVimeoVideoId(null);
      setVideoHlsUrl(null);

      api.markVideoViewed(item.id).catch((error) => {
        console.log("Failed to mark as viewed:", error);
      });

      api.getStreamUrl(item.id, "video")
        .then((response) => {
          console.log("[Stream] API response:", JSON.stringify(response));

          if (item.type === "audio") {
            let audioUrl = response.streamUrl || response.cdnUrl || response.url;
            if (audioUrl) {
              if (audioUrl.startsWith("/")) audioUrl = `https://onetimeonetime.com${audioUrl}`;
              setAudioStreamUrl(audioUrl);
            } else {
              setAudioStreamUrl(`https://onetimeonetime.com/api/videos/${item.id}/stream`);
            }
            setIsLoading(false);
            return;
          }

          if (response.vimeo && response.vimeoVideoId) {
            setVimeoVideoId(response.vimeoVideoId);
          } else if (response.embedUrl) {
            const accentColor = theme.accent.replace("#", "");
            const separator = response.embedUrl.includes("?") ? "&" : "?";
            const themedUrl = `${response.embedUrl}${separator}primaryColor=${accentColor}`;
            setVideoEmbedUrl(themedUrl);
            const hlsUrl = api.extractHlsUrl(response.embedUrl);
            if (hlsUrl) setVideoHlsUrl(hlsUrl);
          } else {
            setVideoError("Video stream not available");
          }
          setIsLoading(false);
        })
        .catch((error) => {
          setVideoError(error.message || "Failed to load content");
          setIsLoading(false);
        });
    }
  }, [item, theme.accent]);

  useEffect(() => {
    if (item.type === "document" && item.pageCount && authToken) {
      const pages: string[] = [];
      for (let i = 1; i <= item.pageCount; i++) {
        pages.push(api.getDocumentPageUrl(item.id, i));
      }
      setDocumentPages(pages);
      setIsLoading(false);
    }
  }, [item, authToken]);

  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  // Auto-play audio when stream URL is available
  useEffect(() => {
    if (item.type === "audio" && audioStreamUrl && !sound && authToken) {
      const loadAndPlayAudio = async () => {
        try {
          let audioUri = audioStreamUrl;

          // Web: fetch as blob since HTML5 Audio doesn't support custom auth headers
          if (Platform.OS === "web") {
            const response = await fetch(audioStreamUrl, {
              headers: { Authorization: `Bearer ${authToken}` },
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            const blob = await response.blob();
            audioUri = URL.createObjectURL(blob);
          }

          const { sound: newSound } = await Audio.Sound.createAsync(
            {
              uri: audioUri,
              headers: Platform.OS !== "web" ? { Authorization: `Bearer ${authToken}` } : undefined,
              overrideFileExtensionAndroid: "mp3",
            },
            { shouldPlay: true, rate: playbackRate, shouldCorrectPitch: true },
            onAudioStatusUpdate,
          );
          setSound(newSound);
          setIsPlaying(true);
        } catch (error: any) {
          console.error("[Audio] Error loading:", error?.message || error?.toString());
        }
      };
      loadAndPlayAudio();
    }
  }, [audioStreamUrl, item.type, authToken]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (sound) sound.unloadAsync();
    navigation.goBack();
  };

  const handleAudioPlayPause = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!audioStreamUrl) return;

    if (!sound) {
      try {
        let audioUri = audioStreamUrl;

        if (Platform.OS === "web" && authToken) {
          const response = await fetch(audioStreamUrl, {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          const blob = await response.blob();
          audioUri = URL.createObjectURL(blob);
        }

        const { sound: newSound } = await Audio.Sound.createAsync(
          {
            uri: audioUri,
            headers: Platform.OS !== "web" && authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
            overrideFileExtensionAndroid: "mp3",
          },
          { shouldPlay: true, rate: playbackRate, shouldCorrectPitch: true },
          onAudioStatusUpdate,
        );
        setSound(newSound);
        setIsPlaying(true);
      } catch (error) {
        console.error("Error loading audio:", error);
      }
    } else {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const onAudioStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setAudioDuration(status.durationMillis || 0);
      setAudioPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setAudioPosition(0);
      }
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = async (event: GestureResponderEvent) => {
    if (!sound || audioDuration <= 0 || progressBarWidth <= 0) return;
    const nativeEvent = event.nativeEvent as any;
    let locationX = nativeEvent.locationX;
    if (typeof locationX !== "number" || isNaN(locationX)) {
      if (nativeEvent.offsetX !== undefined) locationX = nativeEvent.offsetX;
      else return;
    }
    const percentage = Math.max(0, Math.min(1, locationX / progressBarWidth));
    const newPosition = Math.round(percentage * audioDuration);
    if (isNaN(newPosition) || !isFinite(newPosition) || newPosition < 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await sound.setPositionAsync(newPosition);
    } catch (error) {
      console.log("Seek error:", error);
    }
  };

  const handleSpeedChange = async (speed: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlaybackRate(speed);
    if (sound) await sound.setRateAsync(speed, true);
  };

  const renderVideoPlayer = () => {
    if (isLoading) {
      return (
        <View style={[styles.videoContainer, { backgroundColor: theme.backgroundSecondary }]}>
          <ActivityIndicator size="large" color={theme.accent} />
          <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>Loading video...</ThemedText>
        </View>
      );
    }

    if (videoError) {
      return (
        <View style={[styles.errorContainer, { backgroundColor: theme.backgroundSecondary }]}>
          <Feather name="alert-circle" size={32} color={theme.textSecondary} />
          <ThemedText style={[styles.errorText, { color: theme.textSecondary }]}>{videoError}</ThemedText>
          <ThemedText style={[styles.errorSubtext, { color: theme.textSecondary }]}>Please check back later</ThemedText>
        </View>
      );
    }

    if (vimeoVideoId) {
      const vimeoPlayerUrl = `https://player.vimeo.com/video/${vimeoVideoId}?playsinline=1&autoplay=1&muted=0&title=0&byline=0&portrait=0&controls=1`;

      if (Platform.OS === "web") {
        return (
          <View style={styles.videoContainer}>
            <iframe
              src={vimeoPlayerUrl}
              style={{ width: "100%", height: "100%", border: "none" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </View>
        );
      }

      // HTML injection — workaround for react-native-webview Vimeo iOS bug
      const vimeoHtml = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>*{margin:0;padding:0}html,body{width:100%;height:100%;background:#000;overflow:hidden}iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:none}</style>
</head>
<body>
<iframe src="${vimeoPlayerUrl}" frameborder="0" allow="autoplay;fullscreen;picture-in-picture" allowfullscreen webkitallowfullscreen></iframe>
</body>
</html>`;

      return (
        <View style={styles.videoContainer}>
          <WebView
            source={{ html: vimeoHtml, baseUrl: "https://player.vimeo.com" }}
            style={styles.webview}
            allowsFullscreenVideo
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            scrollEnabled={false}
            bounces={false}
            originWhitelist={["*"]}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={theme.accent} />
              </View>
            )}
            onError={(syntheticEvent) => {
              console.log("WebView error:", syntheticEvent.nativeEvent);
              setVideoError("Could not load video player");
            }}
          />
        </View>
      );
    }

    if (videoHlsUrl) return <NativeVideoPlayer hlsUrl={videoHlsUrl} />;

    if (videoEmbedUrl) {
      return (
        <View style={{ height: 250 }}>
          <WebView source={{ uri: videoEmbedUrl }} javaScriptEnabled domStorageEnabled allowsFullscreenVideo mediaPlaybackRequiresUserAction={false} />
        </View>
      );
    }

    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.backgroundSecondary }]}>
        <Feather name="alert-circle" size={32} color={theme.textSecondary} />
        <ThemedText style={[styles.errorText, { color: theme.textSecondary }]}>Video not available</ThemedText>
      </View>
    );
  };

  const renderAudioPlayer = () => {
    if (isLoading) {
      return (
        <View style={styles.audioContainer}>
          <View style={[styles.audioThumbnailPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
            <ActivityIndicator size="large" color={theme.accent} />
          </View>
          <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>Loading audio...</ThemedText>
        </View>
      );
    }

    const hasThumbnail = item.thumbnailUrl;
    const needsAuth = item.thumbnailRequiresAuth && authToken;
    const imageSource = hasThumbnail && item.thumbnailUrl
      ? { uri: item.thumbnailUrl, headers: needsAuth ? { Authorization: `Bearer ${authToken}` } : undefined }
      : null;

    return (
      <View style={styles.audioContainer}>
        {imageSource ? (
          <Image source={imageSource} style={styles.audioThumbnail} contentFit="contain" />
        ) : (
          <View style={[styles.audioThumbnailPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="headphones" size={64} color={theme.accent} />
          </View>
        )}
        <View style={styles.audioControls}>
          <Pressable
            onPress={handleAudioPlayPause}
            style={[styles.playButton, { backgroundColor: theme.accent, opacity: audioStreamUrl ? 1 : 0.5 }]}
            disabled={!audioStreamUrl}
          >
            <Feather name={isPlaying ? "pause" : "play"} size={32} color={theme.buttonText} />
          </Pressable>
          <View style={styles.progressContainer} onLayout={(e) => setProgressBarWidth(e.nativeEvent.layout.width)}>
            <Pressable ref={progressBarRef} onPress={handleSeek} style={[styles.progressBarTouchable]}>
              <View style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}>
                <View style={[styles.progressFill, { backgroundColor: theme.accent, width: audioDuration > 0 ? `${(audioPosition / audioDuration) * 100}%` : "0%" }]} />
                <View style={[styles.progressThumb, { backgroundColor: theme.accent, left: audioDuration > 0 ? `${(audioPosition / audioDuration) * 100}%` : "0%" }]} />
              </View>
            </Pressable>
            <View style={styles.timeContainer}>
              <ThemedText style={[styles.timeText, { color: theme.textSecondary }]}>{formatTime(audioPosition)}</ThemedText>
              <ThemedText style={[styles.timeText, { color: theme.textSecondary }]}>{formatTime(audioDuration)}</ThemedText>
            </View>
          </View>
          <View style={styles.speedControls}>
            <ThemedText style={[styles.speedLabel, { color: theme.textSecondary }]}>Speed</ThemedText>
            <View style={styles.speedButtons}>
              {playbackSpeeds.map((speed) => (
                <Pressable
                  key={speed}
                  onPress={() => handleSpeedChange(speed)}
                  style={[styles.speedButton, {
                    backgroundColor: playbackRate === speed ? theme.accent : theme.backgroundSecondary,
                    borderColor: playbackRate === speed ? theme.accent : theme.border,
                  }]}
                >
                  <ThemedText style={[styles.speedButtonText, { color: playbackRate === speed ? theme.buttonText : theme.text }]}>
                    {speed}x
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderDocumentViewer = () => {
    if (isLoading || (!authToken && item.type === "document")) {
      return (
        <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      );
    }

    if (documentPages.length === 0) {
      return (
        <View style={[styles.errorContainer, { backgroundColor: theme.backgroundSecondary }]}>
          <Feather name="file-text" size={32} color={theme.textSecondary} />
          <ThemedText style={[styles.errorText, { color: theme.textSecondary }]}>Document not available</ThemedText>
        </View>
      );
    }

    const docWidth = windowWidth;
    const docHeight = windowHeight;

    return (
      <View style={styles.fullScreenDocument}>
        <FlatList
          ref={documentListRef}
          data={documentPages}
          keyExtractor={(_, index) => `page-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={zoomedPageIndex === null}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / docWidth);
            setCurrentPageIndex(newIndex);
          }}
          renderItem={({ item: pageUrl, index }) => (
            <View style={[styles.documentPageFullscreen, { width: docWidth, height: docHeight }]}>
              <ZoomableImage
                uri={pageUrl}
                headers={authToken ? { Authorization: `Bearer ${authToken}` } : undefined}
                style={{ width: docWidth, height: docHeight }}
                onZoomStart={() => setZoomedPageIndex(index)}
                onZoomEnd={() => setZoomedPageIndex(null)}
                resetKey={currentPageIndex !== index ? currentPageIndex : undefined}
              />
            </View>
          )}
        />

        {showDocumentControls ? (
          <>
            <View style={[styles.documentHeader, { paddingTop: insets.top + Spacing.sm }]}>
              <Pressable onPress={handleBack} style={styles.documentBackButton}>
                <Feather name="arrow-left" size={24} color="#fff" />
              </Pressable>
              <ThemedText numberOfLines={1} style={styles.documentTitle}>{item.title}</ThemedText>
              <View style={{ width: 40 }} />
            </View>

            <View style={[styles.documentFooter, { paddingBottom: insets.bottom + Spacing.sm }]}>
              <ThemedText style={styles.pageCounter}>{currentPageIndex + 1} / {documentPages.length}</ThemedText>
              {currentPageIndex > 0 ? (
                <Pressable
                  style={[styles.pageNavButton, styles.prevButton, { bottom: insets.bottom + Spacing.md + 32 }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const newIndex = Math.max(0, currentPageIndex - 1);
                    documentListRef.current?.scrollToIndex({ index: newIndex, animated: true });
                    setCurrentPageIndex(newIndex);
                  }}
                >
                  <Feather name="chevron-left" size={24} color="#fff" />
                </Pressable>
              ) : null}
              {currentPageIndex < documentPages.length - 1 ? (
                <Pressable
                  style={[styles.pageNavButton, styles.nextButton, { bottom: insets.bottom + Spacing.md + 32 }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const newIndex = Math.min(documentPages.length - 1, currentPageIndex + 1);
                    documentListRef.current?.scrollToIndex({ index: newIndex, animated: true });
                    setCurrentPageIndex(newIndex);
                  }}
                >
                  <Feather name="chevron-right" size={24} color="#fff" />
                </Pressable>
              ) : null}
            </View>
          </>
        ) : null}
      </View>
    );
  };

  if (item.type === "document") return renderDocumentViewer();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable onPress={handleBack} style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.6 : 1 }]} hitSlop={8}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText numberOfLines={1} style={[styles.headerTitle, { color: theme.text }]}>{item.title}</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}>
        {item.type === "video" ? renderVideoPlayer() : null}
        {item.type === "audio" ? renderAudioPlayer() : null}

        <View style={styles.infoSection}>
          <ThemedText style={[styles.title, { color: theme.text }]}>{item.title}</ThemedText>
          {item.description ? (
            <ThemedText style={[styles.description, { color: theme.textSecondary }]}>{item.description}</ThemedText>
          ) : null}
          <View style={styles.metaRow}>
            {item.categoryName ? (
              <View style={[styles.categoryBadge, { backgroundColor: theme.backgroundSecondary }]}>
                <ThemedText style={[styles.categoryBadgeText, { color: theme.textSecondary }]}>{item.categoryName}</ThemedText>
              </View>
            ) : null}
            {item.duration ? (
              <ThemedText style={[styles.duration, { color: theme.textSecondary }]}>
                {Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, "0")}
              </ThemedText>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "flex-start" },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "600", textAlign: "center" },
  scrollView: { flex: 1 },
  scrollContent: {},
  videoContainer: { width: SCREEN_WIDTH, height: (SCREEN_WIDTH * 9) / 16, justifyContent: "center", alignItems: "center" },
  webview: { flex: 1, backgroundColor: "transparent" },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center", zIndex: 1 },
  loadingContainer: { width: SCREEN_WIDTH, height: 200, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: Spacing.md, fontSize: 14 },
  errorContainer: { width: SCREEN_WIDTH, height: (SCREEN_WIDTH * 9) / 16, justifyContent: "center", alignItems: "center" },
  errorText: { marginTop: Spacing.md, fontSize: 16 },
  errorSubtext: { marginTop: Spacing.xs, fontSize: 13 },
  audioContainer: { padding: Spacing.xl, alignItems: "center" },
  audioThumbnail: { width: SCREEN_WIDTH - Spacing.xl * 2, height: SCREEN_WIDTH - Spacing.xl * 2, maxHeight: 300, borderRadius: BorderRadius.lg, marginBottom: Spacing.xl },
  audioThumbnailPlaceholder: { width: SCREEN_WIDTH - Spacing.xl * 2, height: SCREEN_WIDTH - Spacing.xl * 2, maxHeight: 300, borderRadius: BorderRadius.lg, marginBottom: Spacing.xl, justifyContent: "center", alignItems: "center" },
  audioControls: { width: "100%", alignItems: "center" },
  playButton: { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center", marginBottom: Spacing.xl },
  progressContainer: { width: "100%" },
  progressBarTouchable: { paddingVertical: Spacing.md },
  progressBar: { height: 6, borderRadius: 3, overflow: "visible", position: "relative" },
  progressFill: { height: "100%", borderRadius: 3, position: "absolute", left: 0, top: 0 },
  progressThumb: { width: 16, height: 16, borderRadius: 8, position: "absolute", top: -5, marginLeft: -8 },
  timeContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: Spacing.xs },
  timeText: { fontSize: 12 },
  speedControls: { marginTop: Spacing.xl, width: "100%", alignItems: "center" },
  speedLabel: { fontSize: 13, marginBottom: Spacing.sm },
  speedButtons: { flexDirection: "row", gap: Spacing.sm },
  speedButton: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.sm, borderWidth: 1 },
  speedButtonText: { fontSize: 13, fontWeight: "500" },
  fullScreenDocument: { flex: 1, backgroundColor: "#000" },
  documentPageFullscreen: { justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  documentHeader: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, backgroundColor: "rgba(0,0,0,0.6)" },
  documentBackButton: { padding: Spacing.xs, width: 40 },
  documentTitle: { flex: 1, color: "#fff", fontSize: 16, fontWeight: "600", textAlign: "center" },
  documentFooter: { position: "absolute", bottom: 0, left: 0, right: 0, alignItems: "center", paddingTop: Spacing.md, backgroundColor: "rgba(0,0,0,0.6)" },
  pageCounter: { color: "#fff", fontSize: 14, fontWeight: "500" },
  pageNavButton: { position: "absolute", width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  prevButton: { left: Spacing.md },
  nextButton: { right: Spacing.md },
  infoSection: { padding: Spacing.xl },
  title: { fontSize: 20, fontWeight: "600", marginBottom: Spacing.sm },
  description: { fontSize: 15, lineHeight: 22, marginBottom: Spacing.md },
  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  categoryBadge: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.full, marginRight: Spacing.md },
  categoryBadgeText: { fontSize: 13, fontWeight: "500" },
  duration: { fontSize: 13 },
});
```

---

### `client/screens/AlbumDetailScreen.tsx`

> **Note:** AlbumDetailScreen (~618 lines) — read directly from `client/screens/AlbumDetailScreen.tsx` in the project. Key features: displays album tracks with track numbers and durations, plays tracks using the same Audio.Sound/blob approach as ContentPlayerScreen, supports playback speed control, uses auth token for track stream URLs via `api.getAlbumTrackStreamUrl(albumId, trackId)`.

---

### `server/index.ts`
```ts
import express from "express";
import type { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import * as fs from "fs";
import * as path from "path";

const app = express();
const log = console.log;

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

function setupCors(app: express.Application) {
  app.use((req, res, next) => {
    const origins = new Set<string>();
    if (process.env.REPLIT_DEV_DOMAIN) origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => origins.add(`https://${d.trim()}`));
    }
    const origin = req.header("origin");
    const isLocalhost = origin?.startsWith("http://localhost:") || origin?.startsWith("http://127.0.0.1:");
    if (origin && (origins.has(origin) || isLocalhost)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.header("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
  });
}

function setupBodyParsing(app: express.Application) {
  app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));
  app.use(express.urlencoded({ extended: false }));
}

function setupRequestLogging(app: express.Application) {
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, unknown> | undefined = undefined;
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    });
    next();
  });
}

function getAppName(): string {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}

function serveExpoManifest(platform: string, res: Response) {
  const manifestPath = path.resolve(process.cwd(), "static-build", platform, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
  }
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");
  res.send(fs.readFileSync(manifestPath, "utf-8"));
}

function serveLandingPage({ req, res, landingPageTemplate, appName }: { req: Request; res: Response; landingPageTemplate: string; appName: string }) {
  const protocol = req.header("x-forwarded-proto") || req.protocol || "https";
  const host = req.header("x-forwarded-host") || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;
  const html = landingPageTemplate
    .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
    .replace(/EXPS_URL_PLACEHOLDER/g, expsUrl)
    .replace(/APP_NAME_PLACEHOLDER/g, appName);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}

function configureExpoAndLanding(app: express.Application) {
  const templatePath = path.resolve(process.cwd(), "server", "templates", "landing-page.html");
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  const appName = getAppName();

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) return next();
    if (req.path !== "/" && req.path !== "/manifest") return next();
    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }
    if (req.path === "/") return serveLandingPage({ req, res, landingPageTemplate, appName });
    next();
  });

  app.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app.use(express.static(path.resolve(process.cwd(), "static-build")));
}

function setupErrorHandler(app: express.Application) {
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    const error = err as { status?: number; statusCode?: number; message?: string };
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) return next(err);
    return res.status(status).json({ message });
  });
}

(async () => {
  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);
  configureExpoAndLanding(app);
  const server = await registerRoutes(app);
  setupErrorHandler(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    log(`express server serving on port ${port}`);
  });
})();
```

---

### `server/routes.ts`
```ts
import type { Express } from "express";
import { createServer, type Server } from "node:http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Local dev server only serves landing page + Expo manifests.
  // All content API requests go directly to https://onetimeonetime.com from the client.
  const httpServer = createServer(app);
  return httpServer;
}
```

---

### `app.json`
```json
{
  "expo": {
    "name": "OneTimeOneTime",
    "slug": "onetimeonetime",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "onetimeonetime",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.onetimeonetime.app",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#000000",
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png"
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false,
      "package": "com.onetimeonetime.app",
      "permissions": [
        "android.permission.MODIFY_AUDIO_SETTINGS"
      ]
    },
    "web": {
      "output": "single",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff",
          "dark": {
            "backgroundColor": "#000000"
          }
        }
      ],
      [
        "expo-av",
        {
          "microphonePermission": false
        }
      ],
      [
        "expo-video",
        {
          "supportsBackgroundPlayback": false,
          "supportsPictureInPicture": false
        }
      ],
      "expo-web-browser"
    ],
    "experiments": {
      "reactCompiler": true
    },
    "extra": {
      "eas": {
        "projectId": "7f942bde-dc95-4e28-8a76-27795c3da885"
      }
    }
  }
}
```

---

### `eas.json`
```json
{
  "cli": {
    "version": ">= 16.28.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

### `package.json`
```json
{
  "name": "my-app",
  "main": "client/index.js",
  "version": "1.0.0",
  "scripts": {
    "expo:dev": "EXPO_PACKAGER_PROXY_URL=https://$REPLIT_DEV_DOMAIN REACT_NATIVE_PACKAGER_HOSTNAME=$REPLIT_DEV_DOMAIN EXPO_PUBLIC_DOMAIN=$REPLIT_DEV_DOMAIN:5000 npx expo start --localhost",
    "server:dev": "NODE_ENV=development tsx server/index.ts",
    "expo:start:static:build": "npx expo start --no-dev --minify --localhost",
    "expo:static:build": "node scripts/build.js",
    "server:build": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=server_dist",
    "server:prod": "NODE_ENV=production node server_dist/index.js",
    "db:push": "drizzle-kit push",
    "lint": "npx expo lint",
    "lint:fix": "npx expo lint --fix",
    "check:types": "tsc --noEmit",
    "check:format": "prettier --check \"**/*.{js,ts,tsx,css,json}\"",
    "format": "prettier --write \"**/*.{js,ts,tsx,css,json}\""
  },
  "dependencies": {
    "@expo-google-fonts/nunito": "^0.4.2",
    "@expo/vector-icons": "^15.0.2",
    "@react-native-async-storage/async-storage": "^2.2.0",
    "@react-navigation/bottom-tabs": "^7.4.0",
    "@react-navigation/elements": "^2.6.3",
    "@react-navigation/native": "^7.1.8",
    "@react-navigation/native-stack": "^7.3.16",
    "@tanstack/react-query": "^5.90.7",
    "drizzle-orm": "^0.39.3",
    "drizzle-zod": "^0.7.0",
    "expo": "^54.0.23",
    "expo-av": "~16.0.8",
    "expo-blur": "^15.0.7",
    "expo-constants": "~18.0.9",
    "expo-font": "~14.0.9",
    "expo-glass-effect": "~0.1.6",
    "expo-haptics": "~15.0.7",
    "expo-image": "~3.0.10",
    "expo-linking": "~8.0.8",
    "expo-splash-screen": "~31.0.10",
    "expo-status-bar": "~3.0.8",
    "expo-symbols": "~1.0.7",
    "expo-system-ui": "~6.0.8",
    "expo-video": "^3.0.15",
    "expo-web-browser": "~15.0.9",
    "express": "^5.0.1",
    "http-proxy-middleware": "^3.0.5",
    "pg": "^8.16.3",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-keyboard-controller": "1.18.5",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-svg": "^15.15.1",
    "react-native-web": "~0.21.0",
    "react-native-webview": "^13.16.0",
    "react-native-worklets": "0.5.1",
    "tsx": "^4.20.6",
    "ws": "^8.18.0",
    "zod": "^3.24.2",
    "zod-validation-error": "^3.4.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/node": "24.10.0",
    "@types/react": "~19.1.0",
    "babel-plugin-module-resolver": "^5.0.2",
    "drizzle-kit": "^0.31.4",
    "eslint": "^9.25.0",
    "eslint-config-expo": "~10.0.0",
    "eslint-config-prettier": "^10.1.8",
    "eslint-import-resolver-node": "^0.3.9",
    "eslint-plugin-prettier": "^5.5.4",
    "prettier": "3.6.2",
    "typescript": "~5.9.2"
  },
  "private": true
}
```

---

*End of export. 22 TypeScript/JavaScript source files + config files fully included. One file abbreviated: `AlbumDetailScreen.tsx` — read from project source.*
