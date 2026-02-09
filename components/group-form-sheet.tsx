"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"

interface GroupFormSheetProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { name: string; pin: string; hint: string }) => void
}

export function GroupFormSheet({ open, onClose, onSubmit }: GroupFormSheetProps) {
  const [name, setName] = useState("")
  const [pin, setPin] = useState("")
  const [hint, setHint] = useState("")
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setName("")
      setPin("")
      setHint("")
      setTimeout(() => nameRef.current?.focus(), 100)
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !pin.trim()) return
    await onSubmit({ name: name.trim(), pin: pin.trim(), hint: hint.trim() })
    onClose()
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      {/* Sheet - positioned higher to avoid keyboard overlap */}
      <div className="fixed inset-x-0 top-16 z-50 mx-auto max-w-md animate-in slide-in-from-top rounded-2xl border border-border bg-background px-6 pb-6 pt-4 shadow-xl max-h-[calc(100vh-8rem)] overflow-y-auto">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Create New Group
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Group Name</span>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Email, Banking"
              required
              className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          {/* PIN */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Group PIN</span>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="4-digit PIN"
              required
              minLength={4}
              className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          {/* Hint */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">
              Hint <span className="text-muted-foreground font-normal">(optional)</span>
            </span>
            <input
              type="text"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="e.g., Birth year"
              className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          {/* Actions */}
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border bg-secondary py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !pin.trim()}
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
