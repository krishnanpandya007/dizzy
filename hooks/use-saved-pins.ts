"use client"

import { useState, useEffect, useCallback } from "react"
import { hashPin } from "@/lib/encryption"

export interface SavedPin {
  id: string
  name: string
  hashedPin: string
  hint: string
  createdAt: number
}

export type NewPinData = Omit<SavedPin, "id" | "hashedPin" | "createdAt">

const STORAGE_KEY = "dizzy-saved-pins"

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function loadPins(): SavedPin[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SavedPin[]
  } catch {
    return []
  }
}

function savePins(pins: SavedPin[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pins))
}

export function useSavedPins() {
  const [pins, setPins] = useState<SavedPin[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setPins(loadPins())
    setIsLoaded(true)
  }, [])

  const addPin = useCallback(async (pinData: { name: string; pin: string; hint: string }): Promise<string> => {
    const hashedPin = await hashPin(pinData.pin)
    const newId = generateUUID()
    setPins((prev) => {
      const now = Date.now()
      const newPin = { name: pinData.name, hashedPin, hint: pinData.hint, id: newId, createdAt: now }
      const next = [...prev, newPin]
      savePins(next)
      return next
    })
    return newId
  }, [])

  const deletePin = useCallback((id: string) => {
    setPins((prev) => {
      const next = prev.filter((p) => p.id !== id)
      savePins(next)
      return next
    })
  }, [])

  const getPinById = useCallback((id: string): SavedPin | undefined => {
    return pins.find((p) => p.id === id)
  }, [pins])

  const verifyPin = useCallback(async (id: string, pin: string): Promise<boolean> => {
    const savedPin = pins.find((p) => p.id === id)
    if (!savedPin) return false
    const { verifyPin: verify } = await import("@/lib/encryption")
    return verify(pin, savedPin.hashedPin)
  }, [pins])

  return { pins, isLoaded, addPin, deletePin, getPinById, verifyPin }
}
