"use client";

import { useSessionTabs } from "@/hooks/useSessionTabs";
import SessionTabBar from "@/components/SessionTabBar";
import SessionEditor from "@/components/SessionEditor";

// ---------------------------------------------------------------------
// Multi-session tab manager - lets you handle several customers at once.
// Each tab mounts its own SessionEditor, which keeps its own independent
// upload/layers/crop/zoom/rotate state via useSessionEditor. Switching
// tabs just shows/hides the mounted editors (display: none), so nothing
// resets when you switch back to a customer mid-edit. Progress for every
// tab is autosaved to IndexedDB, so a refresh restores everything.
// ---------------------------------------------------------------------

export default function PhotoEditor() {
  const { sessions, activeId, isLoaded, setActiveId, addSession, removeSession, updateThumbnail } =
    useSessionTabs();

  if (!isLoaded) {
    return (
      <div className="mx-auto flex max-w-6xl items-center justify-center p-10 text-sm text-slate-400">
        Restoring your saved progress...
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6 bg-white shadow-sm border border-[#d0dff0] rounded">
      <header className="border-b-2 border-guide pb-4">
        <h1 className="text-2xl font-bold uppercase tracking-wide text-ink">
          Rush ID - Background <span className="text-guide">Remover</span>
        </h1>
        <p className="text-sm text-slate-500">
          Each tab below is a separate customer with its own independent progress - upload,
          layers, crop, zoom, and rotate never mix between tabs. Click{" "}
          <span className="text-guide font-semibold">+</span> to start a new customer. Progress is saved in
          this browser automatically, so an accidental refresh won&apos;t lose your place.
        </p>
      </header>

      <SessionTabBar
        sessions={sessions}
        activeId={activeId}
        onSelect={setActiveId}
        onAdd={addSession}
        onRemove={removeSession}
      />

      {/* Each session stays mounted (just hidden) so switching tabs never
          resets a customer's progress */}
      {sessions.map((s) => (
        <div key={s.id} style={{ display: s.id === activeId ? "block" : "none" }}>
          <SessionEditor
            sessionId={s.id}
            onThumbnailChange={(thumbnail) => updateThumbnail(s.id, thumbnail)}
          />
        </div>
      ))}
    </div>
  );
}
