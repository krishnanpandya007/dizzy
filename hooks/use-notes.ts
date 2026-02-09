"use client"

import { useState, useEffect, useCallback } from "react"

export interface Note {
  id: string
  title: string
  encryptedContent: string // base64 encrypted content
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = "dizzy-notes"

function loadNotes(): Note[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Note[]
  } catch {
    return []
  }
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setNotes(loadNotes())
    setIsLoaded(true)
  }, [])

  const addNote = useCallback((note: Omit<Note, "id" | "createdAt" | "updatedAt"> | Note) => {
    setNotes((prev) => {
      const now = Date.now()
      const newNote = "id" in note 
        ? { ...note, createdAt: note.createdAt || now, updatedAt: note.updatedAt || now }
        : { ...note, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
      const next = [...prev, newNote]
      saveNotes(next)
      return next
    })
  }, [])

  const updateNote = useCallback((id: string, data: { title?: string; encryptedContent?: string }) => {
    setNotes((prev) => {
      const next = prev.map((n) =>
        n.id === id ? { ...n, ...data, updatedAt: Date.now() } : n
      )
      saveNotes(next)
      return next
    })
  }, [])

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id)
      saveNotes(next)
      return next
    })
  }, [])

  return { notes, isLoaded, addNote, updateNote, deleteNote }
}
