"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import type { AppItem } from "@/hooks/use-apps"
import type { SavedPin } from "@/hooks/use-saved-pins"

interface AppFormSheetProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { name: string; link: string; imageUrl: string; pinId?: string; requirePin: boolean; pin?: string }) => void
  initialData?: AppItem | null
  initialPinId?: string
  savedPins: SavedPin[]
}

export function AppFormSheet({ open, onClose, onSubmit, initialData, initialPinId, savedPins }: AppFormSheetProps) {
  const [name, setName] = useState("")
  const [link, setLink] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [requirePin, setRequirePin] = useState(false)
  const [selectedPinId, setSelectedPinId] = useState("")
  const [pin, setPin] = useState("")
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "")
      setLink(initialData?.link ?? "")
      setImageUrl(initialData?.imageUrl ?? "")
      setRequirePin(!!initialPinId)
      setSelectedPinId(initialPinId ?? "")
      setPin("")
      setTimeout(() => nameRef.current?.focus(), 100)
    }
  }, [open, initialData, initialPinId])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !link.trim()) return
    if (requirePin && (!selectedPinId || pin.length < 4)) return
    onSubmit({ 
      name: name.trim(), 
      link: link.trim(), 
      imageUrl: imageUrl.trim(),
      requirePin,
      pinId: requirePin ? selectedPinId : undefined,
      pin: requirePin ? pin : undefined
    })
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

      <div className="fixed inset-x-0 top-16 z-50 mx-auto max-w-md animate-in slide-in-from-top rounded-2xl border border-border bg-background px-6 pb-6 pt-4 shadow-xl max-h-[calc(100vh-8rem)] overflow-y-auto">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          {initialData ? "Edit App" : "Add App"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Name</span>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My App"
              required
              className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Link</span>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com"
              required
              className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">
              Icon URL <span className="text-muted-foreground font-normal">(optional)</span>
            </span>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/icon.png"
              className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
            <span className="text-sm font-medium text-foreground">Require Group to open</span>
            <input
              type="checkbox"
              checked={requirePin}
              onChange={(e) => {
                setRequirePin(e.target.checked)
                if (!e.target.checked) {
                  setSelectedPinId("")
                  setPin("")
                }
              }}
              className="h-4 w-4 accent-primary"
            />
          </label>

          {requirePin && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">Select Group</span>
                <select
                  value={selectedPinId}
                  onChange={(e) => {
                    setSelectedPinId(e.target.value)
                    setPin("")
                  }}
                  required={requirePin}
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
                  required={requirePin}
                  minLength={4}
                  className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
            </>
          )}

          <div className="mt-2 flex gap-3">
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
              {initialData ? "Save" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
