"use client"

import { useState } from "react"
import type { Note } from "@/hooks/use-notes"

interface NoteTileProps {
  note: Note
  hasPin: boolean
  onOpen: (note: Note) => void
  onDelete: (id: string) => void
}

export function NoteTile({ note, hasPin, onOpen, onDelete }: NoteTileProps) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div className="relative">
      {/* Actions button */}
      <button
        type="button"
        className="absolute -right-1 -top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary/30 text-foreground transition-opacity hover:bg-primary/50"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setShowActions((v) => !v)
        }}
        aria-label={`Actions for ${note.title}`}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="3" cy="7" r="1.2" fill="currentColor" />
          <circle cx="7" cy="7" r="1.2" fill="currentColor" />
          <circle cx="11" cy="7" r="1.2" fill="currentColor" />
        </svg>
      </button>

      {/* Actions dropdown */}
      {showActions && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setShowActions(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowActions(false)
            }}
            role="button"
            tabIndex={-1}
            aria-label="Close actions menu"
          />
          <div className="absolute right-0 top-6 z-30 flex flex-col overflow-hidden rounded-lg border border-border bg-background shadow-lg">
            <button
              type="button"
              className="px-4 py-2 text-left text-sm text-destructive transition-colors hover:bg-secondary"
              onClick={() => {
                onDelete(note.id)
                setShowActions(false)
              }}
            >
              Delete
            </button>
          </div>
        </>
      )}

      {/* Note card */}
      <button
        type="button"
        onClick={() => onOpen(note)}
        className="flex w-full flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-transform active:scale-95"
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex-1 truncate text-sm font-semibold text-foreground">{note.title}</h3>
          {hasPin && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-primary">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date(note.updatedAt).toLocaleDateString()}
        </p>
      </button>
    </div>
  )
}
