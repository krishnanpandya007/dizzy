"use client"

import { useState } from "react"
import type { AppItem } from "@/hooks/use-apps"

function FallbackIcon({ name }: { name: string }) {
  const letter = name.trim().charAt(0).toUpperCase() || "?"
  return (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-primary/20">
      <span className="text-2xl font-semibold text-foreground">{letter}</span>
    </div>
  )
}

interface AppTileProps {
  app: AppItem
  hasPin: boolean
  onEdit: (app: AppItem) => void
  onDelete: (id: string) => void
  onClick: (app: AppItem) => void
}

export function AppTile({ app, hasPin, onEdit, onDelete, onClick }: AppTileProps) {
  const [imgError, setImgError] = useState(false)
  const [showActions, setShowActions] = useState(false)

  return (
    <div className="relative flex flex-col items-center gap-2">
      {/* Long press / context-style actions toggle */}
      <button
        type="button"
        className="absolute -right-1 -top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary/30 text-foreground transition-opacity hover:bg-primary/50"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setShowActions((v) => !v)
        }}
        aria-label={`Actions for ${app.name}`}
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
              className="px-4 py-2 text-left text-sm text-foreground transition-colors hover:bg-secondary"
              onClick={() => {
                onEdit(app)
                setShowActions(false)
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="px-4 py-2 text-left text-sm text-destructive transition-colors hover:bg-secondary"
              onClick={() => {
                onDelete(app.id)
                setShowActions(false)
              }}
            >
              Delete
            </button>
          </div>
        </>
      )}

      {/* Tile - button for PIN-protected, link otherwise */}
      {hasPin ? (
        <button
          type="button"
          onClick={() => onClick(app)}
          className="flex h-[72px] w-[72px] overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-transform active:scale-95 relative"
          aria-label={`Open ${app.name}`}
        >
          <div className="absolute top-1 right-1 z-10">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary drop-shadow">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          {app.imageUrl && !imgError ? (
            <img
              src={app.imageUrl || "/placeholder.svg"}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <FallbackIcon name={app.name} />
          )}
        </button>
      ) : (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            onClick(app)
          }}
          className="flex h-[72px] w-[72px] overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-transform active:scale-95 relative"
          aria-label={`Open ${app.name}`}
        >
          {app.imageUrl && !imgError ? (
            <img
              src={app.imageUrl || "/placeholder.svg"}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <FallbackIcon name={app.name} />
          )}
        </a>
      )}

      {/* Label */}
      <span className="max-w-[80px] truncate text-center text-xs text-muted-foreground">
        {app.name}
      </span>
    </div>
  )
}
