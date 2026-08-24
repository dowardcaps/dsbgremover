// Persists editor sessions across accidental refreshes.
//
// We use IndexedDB here instead of localStorage. Each session can hold up
// to three full-resolution image blobs (original photo, AI cutout, Gemini
// comparison), and there can be several sessions/tabs open at once.
// localStorage only stores strings and is capped around 5-10MB per origin,
// so images would have to be base64-encoded (~33% larger) and would blow
// through that quota almost immediately. IndexedDB stores Blobs natively
// and gets a much larger quota (typically hundreds of MB to a few GB,
// depending on the browser and available disk space), so it's the right
// tool for "don't lose my progress on refresh" here.

const DB_NAME = "rush-id-photo-editor";
const DB_VERSION = 1;
const SESSIONS_STORE = "sessions";
const META_STORE = "meta";
const ORDER_KEY = "sessionOrder";

import { Gender } from "@/lib/attire";

export interface StoredTransform {
  crop: { x: number; y: number };
  zoom: number;
  rotation: number;
}

export type StoredLayerKey = "original" | "output" | "gemini";

export interface StoredSession {
  id: string;
  stage: "upload" | "editing";

  originalBlob?: Blob | null;
  originalFileName?: string | null;
  bgRemovedBlob?: Blob | null;
  geminiBlob?: Blob | null;

  originalTransform: StoredTransform;
  outputTransform: StoredTransform;
  geminiTransform: StoredTransform;
  activeLayer: StoredLayerKey;

  bgColor: string | null;
  brightness: number;
  contrast: number;

  showOriginalLayer: boolean;
  originalLayerOpacity: number;
  showOutputLayer: boolean;
  outputLayerOpacity: number;
  showBackgroundLayer: boolean;
  showGeminiLayer: boolean;
  geminiLayerOpacity: number;

  name?: string;
  nameCase?: "upper" | "natural";

  // Referenced by the in-progress attire-change feature (not yet wired
  // into the live editor tree) - kept optional so it doesn't affect any
  // session saved before that feature exists.
  attireGender?: Gender;
  attireId?: string | null;

  updatedAt: number;
}

function isIndexedDBAvailable(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      reject(new Error("IndexedDB is not available in this browser"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
        db.createObjectStore(SESSIONS_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const req = fn(store);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
        tx.onerror = () => db.close();
      })
  );
}

// All storage calls are best-effort: if IndexedDB isn't available (private
// browsing in some browsers, storage disabled, etc.) the app should keep
// working in-memory, it just won't survive a refresh. Failures are logged,
// not thrown, so a save/load hiccup never breaks editing.

export async function saveSession(session: StoredSession): Promise<void> {
  try {
    await withStore<IDBValidKey>(SESSIONS_STORE, "readwrite", (store) =>
      store.put(session)
    );
  } catch (err) {
    console.warn("Could not save session progress locally:", err);
  }
}

export async function getSession(id: string): Promise<StoredSession | undefined> {
  try {
    return await withStore<StoredSession | undefined>(
      SESSIONS_STORE,
      "readonly",
      (store) => store.get(id)
    );
  } catch (err) {
    console.warn("Could not load saved session:", err);
    return undefined;
  }
}

export async function deleteSession(id: string): Promise<void> {
  try {
    await withStore<undefined>(SESSIONS_STORE, "readwrite", (store) =>
      store.delete(id)
    );
  } catch (err) {
    console.warn("Could not delete saved session:", err);
  }
}

export async function saveSessionOrder(ids: string[]): Promise<void> {
  try {
    await withStore<IDBValidKey>(META_STORE, "readwrite", (store) =>
      store.put({ key: ORDER_KEY, value: ids })
    );
  } catch (err) {
    console.warn("Could not save tab order locally:", err);
  }
}

export async function getSessionOrder(): Promise<string[] | undefined> {
  try {
    const result = await withStore<{ key: string; value: string[] } | undefined>(
      META_STORE,
      "readonly",
      (store) => store.get(ORDER_KEY)
    );
    return result?.value;
  } catch (err) {
    console.warn("Could not load saved tab order:", err);
    return undefined;
  }
}
