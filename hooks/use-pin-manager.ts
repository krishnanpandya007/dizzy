"use client"

import { useState, useEffect, useCallback } from "react"

export interface PinMapping {
  id: string
  type: "app" | "note"
  hasPin: boolean
  pinId?: string // Reference to saved PIN
}

const STORAGE_KEY = "dizzy-pin-mappings"

function loadMappings(): PinMapping[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as PinMapping[]
  } catch {
    return []
  }
}

function saveMappings(mappings: PinMapping[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings))
}

export function usePinManager() {
  const [mappings, setMappings] = useState<PinMapping[]>([])

  useEffect(() => {
    setMappings(loadMappings())
  }, [])

  const setPinForItem = useCallback((id: string, type: "app" | "note", hasPin: boolean, pinId?: string) => {
    setMappings((prev) => {
      const existing = prev.find((m) => m.id === id && m.type === type)
      let next: PinMapping[]
      
      if (existing) {
        next = prev.map((m) => 
          m.id === id && m.type === type ? { ...m, hasPin, pinId } : m
        )
      } else {
        next = [...prev, { id, type, hasPin, pinId }]
      }
      
      saveMappings(next)
      return next
    })
  }, [])

  const hasPin = useCallback((id: string, type: "app" | "note"): boolean => {
    const mapping = mappings.find((m) => m.id === id && m.type === type)
    return mapping?.hasPin ?? false
  }, [mappings])

  const removeMapping = useCallback((id: string, type: "app" | "note") => {
    setMappings((prev) => {
      const next = prev.filter((m) => !(m.id === id && m.type === type))
      saveMappings(next)
      return next
    })
  }, [])

  const getPinId = useCallback((id: string, type: "app" | "note"): string | undefined => {
    const mapping = mappings.find((m) => m.id === id && m.type === type)
    return mapping?.pinId
  }, [mappings])

  return { setPinForItem, hasPin, removeMapping, getPinId }
}
