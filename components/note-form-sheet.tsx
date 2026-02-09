"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import type { Note } from "@/hooks/use-notes"
import type { SavedPin } from "@/hooks/use-saved-pins"

interface NoteFormSheetProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { title: string; content: string; pinId: string; pin?: string }) => void
  initialData?: Note | null
  decryptedContent?: string
  initialPinId?: string
  savedPins: SavedPin[]
}

export function NoteFormSheet({ open, onClose, onSubmit, initialData, decryptedContent, initialPinId, savedPins }: NoteFormSheetProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedPinId, setSelectedPinId] = useState("")
  const [pin, setPin] = useState("")
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTitle(initialData?.title ?? "")
      setContent(decryptedContent ?? "")
      setSelectedPinId(initialPinId ?? "")
      setPin("")
      setTimeout(() => titleRef.current?.focus(), 100)
    }
  }, [open, initialData, decryptedContent, initialPinId])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !selectedPinId || pin.length < 4) return
    onSubmit({ title: title.trim(), content: content.trim(), pinId: selectedPinId, pin })
    onClose()
  }

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose()
        }}
        role="button"
        tabIndex={-1}
        aria-label="Close form"
      />

      <div className="fixed inset-x-0 top-16 z-50 mx-auto max-w-md animate-in slide-in-from-top rounded-2xl border border-border bg-background px-6 pb-6 pt-4 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          {initialData ? "Edit Note" : "New Note"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Title</span>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              required
              className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Content</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              rows={6}
              className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Select Group</span>
            <select
              value={selectedPinId}
              onChange={(e) => {
                setSelectedPinId(e.target.value)
                setPin("")
              }}
              required
              className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Choose a Group...</option>
              {savedPins.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {savedPins.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Create a Group in the Groups tab first.
              </p>
            )}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Enter Group PIN</span>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter the PIN code"
              required
              minLength={4}
              className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border bg-background py-2.5 text-sm font-medium text-foreground transition-colors active:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors active:opacity-90"
            >
              {initialData ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
