"use client";

import { useEffect, useState } from "react";
import { deleteSession, getSessionOrder, saveSessionOrder } from "@/lib/sessionStore";
import { makeSessionId } from "@/lib/makeSessionId";
import { SessionTab } from "@/lib/editorTypes";

/**
 * Manages the row of customer tabs: restoring saved tab order from
 * IndexedDB on mount, adding/removing customers, and tracking which tab's
 * thumbnail to show. Each tab's actual editing state lives in its own
 * useSessionEditor instance - this hook only tracks the tab list itself.
 */
export function useSessionTabs() {
  const [sessions, setSessions] = useState<SessionTab[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  // Gate rendering until we know whether there's saved progress to restore,
  // so we don't briefly mount a fresh blank tab and then swap it out.
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const savedOrder = await getSessionOrder();
      if (cancelled) return;

      if (savedOrder && savedOrder.length > 0) {
        const tabs = savedOrder.map((id) => ({ id, thumbnail: null }));
        setSessions(tabs);
        setActiveId(tabs[0].id);
      } else {
        const id = makeSessionId();
        setSessions([{ id, thumbnail: null }]);
        setActiveId(id);
        saveSessionOrder([id]);
      }
      setIsLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addSession = () => {
    const newTab: SessionTab = { id: makeSessionId(), thumbnail: null };
    setSessions((prev) => {
      const next = [...prev, newTab];
      saveSessionOrder(next.map((s) => s.id));
      return next;
    });
    setActiveId(newTab.id);
  };

  const removeSession = (id: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      const next = filtered.length ? filtered : [{ id: makeSessionId(), thumbnail: null }];
      saveSessionOrder(next.map((s) => s.id));
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
    deleteSession(id);
  };

  const updateThumbnail = (id: string, thumbnail: string | null) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, thumbnail } : s)));
  };

  return {
    sessions,
    activeId,
    isLoaded,
    setActiveId,
    addSession,
    removeSession,
    updateThumbnail,
  };
}
