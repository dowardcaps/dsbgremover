"use client";

import { SessionTab } from "@/lib/editorTypes";

interface SessionTabBarProps {
  sessions: SessionTab[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

export default function SessionTabBar({
  sessions,
  activeId,
  onSelect,
  onAdd,
  onRemove,
}: SessionTabBarProps) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1">
      {sessions.map((s, idx) => (
        <div key={s.id} className="group relative flex flex-col items-center">
          {s.id === activeId && (
            <span className="absolute -top-3 text-xs text-guide">&#9650;</span>
          )}
          <button
            type="button"
            onClick={() => onSelect(s.id)}
            title={`Customer ${idx + 1}`}
            className={`h-14 w-14 shrink-0 overflow-hidden border-2 bg-[#eaf1fb] transition ${
              s.id === activeId ? "border-guide" : "border-[#c7d9f0] hover:border-guide/60"
            }`}
            style={
              s.thumbnail
                ? {
                    backgroundImage:
                      "linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%)",
                    backgroundSize: "8px 8px",
                  }
                : undefined
            }
          >
            {s.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.thumbnail}
                alt={`Customer ${idx + 1} thumbnail`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                {idx + 1}
              </span>
            )}
          </button>
          {sessions.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(s.id);
              }}
              title="Close this customer's tab"
              className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-[#eaf1fb] text-[10px] leading-none text-ink hover:bg-guide hover:text-white group-hover:flex"
            >
              &#10005;
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        title="Start a new customer"
        className="flex h-14 w-14 shrink-0 items-center justify-center border-2 border-dashed border-[#c7d9f0] text-xl text-slate-400 transition hover:border-guide hover:text-guide"
      >
        +
      </button>
    </div>
  );
}
