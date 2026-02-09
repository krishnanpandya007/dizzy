"use client"

import { useState } from "react"
import type { SavedPin } from "@/hooks/use-saved-pins"

interface GroupTileProps {
  pin: SavedPin
  onDelete: (id: string) => void
}

export function GroupTile({ pin, onDelete }: GroupTileProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="relative rounded-xl border border-border bg-card p-4 shadow-sm">
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setMenuOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setMenuOpen(false)}
          />
          <div className="absolute right-2 top-2 z-20 flex flex-col gap-1 rounded-lg border border-border bg-background p-1 shadow-lg">
            <button
              type="button"
              onClick={() => {
                onDelete(pin.id)
                setMenuOpen(false)
              }}
              className="rounded-md px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
            >
              Delete
            </button>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg hover:bg-accent transition-colors"
        aria-label="Options"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="1" fill="currentColor" />
          <circle cx="12" cy="5" r="1" fill="currentColor" />
          <circle cx="12" cy="19" r="1" fill="currentColor" />
        </svg>
      </button>

      <div className="flex items-start gap-3 pr-8">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate">{pin.name}</h3>
          <p className="mt-1 text-xs font-mono text-muted-foreground">••••</p>
          {pin.hint && (
            <p className="mt-1.5 text-xs text-muted-foreground line-clamp-1">
              Hint: {pin.hint}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
