"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"

interface PinDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (pin: string) => void
  title: string
  description?: string
  hint?: string
}

export function PinDialog({ open, onClose, onSubmit, title, description, hint }: PinDialogProps) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setPin("")
      setError(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pin.length < 4) {
      setError(true)
      return
    }
    onSubmit(pin)
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose()
        }}
        role="button"
        tabIndex={-1}
        aria-label="Close PIN dialog"
      >
        {/* Dialog */}
        <div
          className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-xl animate-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="dialog"
          tabIndex={-1}
        >
          <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
          {description && <p className="mb-4 text-sm text-muted-foreground">{description}</p>}
          {hint && (
            <div className="mb-4 rounded-lg border border-border bg-secondary/50 px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground mb-1">Hint:</p>
              <p className="text-sm text-foreground">{hint}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">PIN</span>
              <input
                ref={inputRef}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value)
                  setError(false)
                }}
                placeholder="Enter 4-digit PIN"
                className={`rounded-lg border ${
                  error ? "border-destructive" : "border-border"
                } bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring`}
              />
              {error && <span className="text-xs text-destructive">PIN must be at least 4 digits</span>}
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
                Confirm
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
