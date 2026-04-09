import { useState, useEffect, useCallback } from "react";

const DB_NAME = "onetimeonetime-offline";
const BLOB_STORE = "audio-blobs";
const META_STORE = "audio-meta";
const DB_VERSION = 1;

export interface OfflineMeta {
  id: string;
  title: string;
  categoryName?: string;
  duration?: number | null;
  thumbnailPath?: string | null;
  mediaType?: string;
  downloadedAt: number;
  size: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(BLOB_STORE)) {
        db.createObjectStore(BLOB_STORE);
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbGet<T>(db: IDBDatabase, store: string, key: string): Promise<T | null> {
  return new Promise((resolve) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => resolve(null);
  });
}

function idbPut(db: IDBDatabase, store: string, value: any, key?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    const req = key !== undefined ? tx.objectStore(store).put(value, key) : tx.objectStore(store).put(value);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function idbDelete(db: IDBDatabase, store: string, key: string): Promise<void> {
  return new Promise((resolve) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).delete(key);
    tx.oncomplete = () => resolve();
  });
}

function idbGetAll<T>(db: IDBDatabase, store: string): Promise<T[]> {
  return new Promise((resolve) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result ?? []);
    req.onerror = () => resolve([]);
  });
}

export function useOfflineAudio() {
  const [downloads, setDownloads] = useState<Record<string, OfflineMeta>>({});
  const [downloading, setDownloading] = useState<Record<string, number>>({}); // id → 0-100 progress
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Track online/offline status
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // Load all saved metadata from IndexedDB on mount
  useEffect(() => {
    (async () => {
      try {
        const db = await openDB();
        const items = await idbGetAll<OfflineMeta>(db, META_STORE);
        const map: Record<string, OfflineMeta> = {};
        items.forEach((item) => { map[item.id] = item; });
        setDownloads(map);
      } catch {
        // IndexedDB not available
      }
    })();
  }, []);

  const isDownloaded = useCallback((id: string) => !!downloads[id], [downloads]);

  const getOfflineUrl = useCallback(async (id: string): Promise<string | null> => {
    try {
      const db = await openDB();
      const blob = await idbGet<Blob>(db, BLOB_STORE, id);
      if (!blob) return null;
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  }, []);

  const downloadAudio = useCallback(async (
    id: string,
    meta: Omit<OfflineMeta, "downloadedAt" | "size">,
    token?: string
  ) => {
    setDownloading((prev) => ({ ...prev, [id]: 0 }));
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`/api/audio/${id}/stream`, {
        credentials: "include",
        headers,
      });

      if (!response.ok) throw new Error("Download failed");

      const contentLength = response.headers.get("Content-Length");
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      const reader = response.body!.getReader();
      const chunks: Uint8Array[] = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        if (total > 0) {
          setDownloading((prev) => ({ ...prev, [id]: Math.round((loaded / total) * 100) }));
        } else {
          setDownloading((prev) => ({ ...prev, [id]: -1 })); // indeterminate
        }
      }

      const blob = new Blob(chunks, { type: "audio/mpeg" });
      const db = await openDB();
      await idbPut(db, BLOB_STORE, blob, id);
      const fullMeta: OfflineMeta = { ...meta, downloadedAt: Date.now(), size: blob.size };
      await idbPut(db, META_STORE, fullMeta);
      setDownloads((prev) => ({ ...prev, [id]: fullMeta }));
    } finally {
      setDownloading((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  }, []);

  const removeDownload = useCallback(async (id: string) => {
    try {
      const db = await openDB();
      await idbDelete(db, BLOB_STORE, id);
      await idbDelete(db, META_STORE, id);
      setDownloads((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch {}
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return {
    downloads,
    downloading,
    isOnline,
    isDownloaded,
    downloadAudio,
    getOfflineUrl,
    removeDownload,
    downloadedList: Object.values(downloads).sort((a, b) => b.downloadedAt - a.downloadedAt),
    formatSize,
  };
}
