"use client"

import { useState, useEffect, useCallback } from "react"

export interface AppItem {
  id: string
  name: string
  link: string
  imageUrl: string
}

const STORAGE_KEY = "dizzy-apps"

function loadApps(): AppItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as AppItem[]
  } catch {
    return []
  }
}

function saveApps(apps: AppItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps))
}

export function useApps() {
  const [apps, setApps] = useState<AppItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setApps(loadApps())
    setIsLoaded(true)
  }, [])

  const addApp = useCallback((app: Omit<AppItem, "id"> | AppItem) => {
    setApps((prev) => {
      const newApp = "id" in app ? app : { ...app, id: crypto.randomUUID() }
      const next = [...prev, newApp]
      saveApps(next)
      return next
    })
  }, [])

  const updateApp = useCallback((id: string, data: Omit<AppItem, "id">) => {
    setApps((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, ...data } : a))
      saveApps(next)
      return next
    })
  }, [])

  const deleteApp = useCallback((id: string) => {
    setApps((prev) => {
      const next = prev.filter((a) => a.id !== id)
      saveApps(next)
      return next
    })
  }, [])

  return { apps, isLoaded, addApp, updateApp, deleteApp }
}
