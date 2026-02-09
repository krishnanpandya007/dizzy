"use client"

import { useState } from "react"
import { useApps, type AppItem } from "@/hooks/use-apps"
import { useNotes, type Note } from "@/hooks/use-notes"
import { useSavedPins, type SavedPin } from "@/hooks/use-saved-pins"
import { usePinManager } from "@/hooks/use-pin-manager"
import { encrypt, decrypt } from "@/lib/encryption"
import { useAuth } from "@/contexts/auth-context"
import { DizzyLogo } from "@/components/dizzy-logo"
import { IpDisplay } from "@/components/ip-display"
import { AppTile } from "@/components/app-tile"
import { AppFormSheet } from "@/components/app-form-sheet"
import { NoteTile } from "@/components/note-tile"
import { NoteFormSheet } from "@/components/note-form-sheet"
import { GroupTile } from "@/components/group-tile"
import { GroupFormSheet } from "@/components/group-form-sheet"
import { PinDialog } from "@/components/pin-dialog"
import { ExportMenu } from "@/components/export-sheet"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { User, LogOut, LogIn } from "lucide-react"

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

export function DizzyDashboard() {
  const { apps, isLoaded, addApp, updateApp, deleteApp } = useApps()
  const { notes, isLoaded: notesLoaded, addNote, updateNote, deleteNote } = useNotes()
  const { pins, isLoaded: pinsLoaded, addPin, deletePin, getPinById, verifyPin } = useSavedPins()
  const { setPinForItem, hasPin, removeMapping, getPinId } = usePinManager()
  const { user, signOut, signInWithGoogle, loading } = useAuth()
  
  const [view, setView] = useState<"apps" | "notes" | "groups">("apps")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [noteSheetOpen, setNoteSheetOpen] = useState(false)
  const [pinSheetOpen, setPinSheetOpen] = useState(false)
  const [editingApp, setEditingApp] = useState<AppItem | null>(null)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [decryptedNoteContent, setDecryptedNoteContent] = useState("")
  
  // PIN dialog state
  const [pinDialog, setPinDialog] = useState<{
    open: boolean
    type: "app" | "note"
    item?: AppItem | Note
    action?: "open"
    pinId?: string
  }>({
    open: false,
    type: "app",
  })

  // User drawer state
  const [userDrawerOpen, setUserDrawerOpen] = useState(false)



  // App handlers
  function handleAddApp() {
    setEditingApp(null)
    setSheetOpen(true)
  }

  function handleEditApp(app: AppItem) {
    setEditingApp(app)
    setSheetOpen(true)
  }

  async function handleSubmitApp(data: { name: string; link: string; imageUrl: string; pinId?: string; requirePin: boolean; pin?: string }) {
    if (editingApp) {
      let finalLink = data.link
      if (data.requirePin && data.pinId && data.pin) {
        const isValid = await verifyPin(data.pinId, data.pin)
        if (isValid) {
          finalLink = await encrypt(data.link, data.pin)
          setPinForItem(editingApp.id, "app", true, data.pinId)
        } else {
          alert("Incorrect PIN")
          return
        }
      } else if (!data.requirePin) {
        removeMapping(editingApp.id, "app")
      }
      updateApp(editingApp.id, { ...data, link: finalLink })
    } else {
      let finalLink = data.link
      const tempId = generateUUID()
      if (data.requirePin && data.pinId && data.pin) {
        const isValid = await verifyPin(data.pinId, data.pin)
        if (isValid) {
          finalLink = await encrypt(data.link, data.pin)
          setPinForItem(tempId, "app", true, data.pinId)
        } else {
          alert("Incorrect PIN")
          return
        }
      }
      addApp({ ...data, link: finalLink, id: tempId } as AppItem)
    }
  }

  function handleDeleteApp(id: string) {
    deleteApp(id)
    removeMapping(id, "app")
  }

  function handleClickApp(app: AppItem) {
    const appHasPin = hasPin(app.id, "app")
    if (appHasPin) {
      const pinId = getPinId(app.id, "app")
      setPinDialog({ open: true, type: "app", item: app, action: "open", pinId })
    } else {
      window.open(app.link, "_blank")
    }
  }

  // Note handlers
  function handleAddNote() {
    setEditingNote(null)
    setDecryptedNoteContent("")
    setNoteSheetOpen(true)
  }

  function handleClickNote(note: Note) {
    const pinId = getPinId(note.id, "note")
    setPinDialog({ open: true, type: "note", item: note, action: "open", pinId })
  }

  async function handleSubmitNote(data: { title: string; content: string; pinId: string; pin?: string }) {
    if (!data.pin) return

    const isValid = await verifyPin(data.pinId, data.pin)
    if (!isValid) {
      alert("Incorrect PIN")
      return
    }

    const encryptedContent = await encrypt(data.content, data.pin)
    if (editingNote) {
      updateNote(editingNote.id, { title: data.title, encryptedContent })
      setPinForItem(editingNote.id, "note", true, data.pinId)
    } else {
      const tempId = generateUUID()
      addNote({ title: data.title, encryptedContent, id: tempId } as Note)
      setPinForItem(tempId, "note", true, data.pinId)
    }
    setNoteSheetOpen(false)
  }

  function handleDeleteNote(id: string) {
    deleteNote(id)
    removeMapping(id, "note")
  }

  // PIN handlers
  function handleAddPin() {
    setPinSheetOpen(true)
  }

  function handleDeletePin(id: string) {
    deletePin(id)
  }

  async function handleSubmitPin(data: { name: string; pin: string; hint: string }) {
    await addPin(data)
  }

  // PIN dialog handlers
  async function handlePinSubmit(enteredPin: string) {
    const { type, item, action, pinId } = pinDialog
    if (!pinId) return

    const isValid = await verifyPin(pinId, enteredPin)
    if (!isValid) {
      alert("Incorrect PIN")
      return
    }

    if (type === "app" && item && action === "open") {
      const decryptedLink = await decrypt((item as AppItem).link, enteredPin)
      if (decryptedLink) {
        window.open(decryptedLink, "_blank")
        setPinDialog({ open: false, type: "app" })
      } else {
        alert("Failed to decrypt")
      }
    } else if (type === "note" && item && action === "open") {
      const decryptedContent = await decrypt((item as Note).encryptedContent, enteredPin)
      if (decryptedContent) {
        setDecryptedNoteContent(decryptedContent)
        setEditingNote(item as Note)
        setNoteSheetOpen(true)
        setPinDialog({ open: false, type: "note" })
      } else {
        alert("Failed to decrypt")
      }
    }
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pb-3 pt-6">
        <div className="flex items-center gap-3">
          <DizzyLogo className="h-9 w-9" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">Dizzy</h1>
        </div>
        <button
          type="button"
          onClick={() => setUserDrawerOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/50 transition-colors hover:bg-secondary"
          aria-label="Menu"
        >
          {user?.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt={user.user_metadata.name || "User"}
              className="h-7 w-7 rounded-full"
            />
          ) : (
            <User className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </header>

      {/* View Switcher */}
      <div className="mx-6 flex gap-2 pb-2">
        <button
          type="button"
          onClick={() => setView("apps")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            view === "apps"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          Apps {isLoaded ? `(${apps.length})` : ""}
        </button>
        <button
          type="button"
          onClick={() => setView("notes")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            view === "notes"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          Notes {notesLoaded ? `(${notes.length})` : ""}
        </button>
        <button
          type="button"
          onClick={() => setView("groups")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            view === "groups"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          Groups {pinsLoaded ? `(${pins.length})` : ""}
        </button>
      </div>

      {/* Divider */}
      <div className="mx-6 h-px bg-border" />

      {/* Content */}
      <main className="flex-1 px-6 pt-4 pb-28">
        {view === "apps" ? (
          !isLoaded ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : apps.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 pt-24">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">No apps yet</p>
              <p className="text-xs text-muted-foreground/70">Tap + to add your first app</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-x-4 gap-y-6">
              {apps.map((app) => (
                <AppTile
                  key={app.id}
                  app={app}
                  hasPin={hasPin(app.id, "app")}
                  onEdit={handleEditApp}
                  onDelete={handleDeleteApp}
                  onClick={handleClickApp}
                />
              ))}
            </div>
          )
        ) : view === "notes" ? (
          !notesLoaded ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 pt-24">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">No notes yet</p>
              <p className="text-xs text-muted-foreground/70">Tap + to create your first note</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {notes.map((note) => (
                <NoteTile
                  key={note.id}
                  note={note}
                  hasPin={hasPin(note.id, "note")}
                  onOpen={handleClickNote}
                  onDelete={handleDeleteNote}
                />
              ))}
            </div>
          )
        ) : view === "groups" ? (
          !pinsLoaded ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : pins.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 pt-24">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">No Groups yet</p>
              <p className="text-xs text-muted-foreground/70">Tap + to create your first Group</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pins.map((pin) => (
                <GroupTile
                  key={pin.id}
                  pin={pin}
                  onDelete={handleDeletePin}
                />
              ))}
            </div>
          )
        ) : null}
      </main>

      {/* FAB */}
      <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2">
        <button
          type="button"
          onClick={view === "apps" ? handleAddApp : view === "notes" ? handleAddNote : handleAddPin}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg transition-transform active:scale-95"
          aria-label={view === "apps" ? "Add new app" : view === "notes" ? "Create new note" : "Create new Group"}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* App Form Sheet */}
      <AppFormSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSubmit={handleSubmitApp}
        initialData={editingApp}
        initialPinId={editingApp ? getPinId(editingApp.id, "app") : undefined}
        savedPins={pins}
      />

      {/* Note Form Sheet */}
      <NoteFormSheet
        open={noteSheetOpen}
        onClose={() => setNoteSheetOpen(false)}
        onSubmit={handleSubmitNote}
        initialData={editingNote}
        decryptedContent={decryptedNoteContent}
        initialPinId={editingNote ? getPinId(editingNote.id, "note") : undefined}
        savedPins={pins}
      />

      {/* Group Form Sheet */}
      <GroupFormSheet
        open={pinSheetOpen}
        onClose={() => setPinSheetOpen(false)}
        onSubmit={handleSubmitPin}
      />

      {/* PIN Dialog */}
      <PinDialog
        open={pinDialog.open}
        onClose={() => setPinDialog({ open: false, type: "app" })}
        onSubmit={handlePinSubmit}
        title="Enter PIN"
        description={
          pinDialog.type === "app"
            ? "Enter PIN to open this app"
            : "Enter PIN to view this note"
        }
        hint={
          pinDialog.pinId
            ? getPinById(pinDialog.pinId)?.hint
            : undefined
        }
      />

      {/* User Drawer */}
      <Drawer open={userDrawerOpen} onOpenChange={setUserDrawerOpen} direction="right">
        <DrawerContent className="h-full left-auto right-0 w-80 max-w-full rounded-l-xl">
          {/* User Section - Top */}
          {user ? (
            <div className="border-b p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-secondary text-lg font-medium">
                  {user.user_metadata?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {user.user_metadata?.name || user.email || "User"}
                  </p>
                  {user.email && (
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="border-b p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-secondary text-lg font-medium">
                  ?
                </div>
                <div className="flex-1">
                  <p className="font-medium">Guest</p>
                  <p className="text-sm text-muted-foreground">Not signed in</p>
                </div>
              </div>
            </div>
          )}

          {/* IP & Export Section */}
          <div className="p-6 space-y-3">
            <div className="rounded-lg border bg-card">
              {/* IP */}
              <div className="flex items-center justify-start px-4 py-3">
                {/* <span className="text-sm font-medium"><svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49996 1.80002C4.35194 1.80002 1.79996 4.352 1.79996 7.50002C1.79996 10.648 4.35194 13.2 7.49996 13.2C10.648 13.2 13.2 10.648 13.2 7.50002C13.2 4.352 10.648 1.80002 7.49996 1.80002ZM0.899963 7.50002C0.899963 3.85494 3.85488 0.900024 7.49996 0.900024C11.145 0.900024 14.1 3.85494 14.1 7.50002C14.1 11.1451 11.145 14.1 7.49996 14.1C3.85488 14.1 0.899963 11.1451 0.899963 7.50002Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path><path d="M13.4999 7.89998H1.49994V7.09998H13.4999V7.89998Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path><path d="M7.09991 13.5V1.5H7.89991V13.5H7.09991zM10.375 7.49998C10.375 5.32724 9.59364 3.17778 8.06183 1.75656L8.53793 1.24341C10.2396 2.82218 11.075 5.17273 11.075 7.49998 11.075 9.82724 10.2396 12.1778 8.53793 13.7566L8.06183 13.2434C9.59364 11.8222 10.375 9.67273 10.375 7.49998zM3.99969 7.5C3.99969 5.17611 4.80786 2.82678 6.45768 1.24719L6.94177 1.75281C5.4582 3.17323 4.69969 5.32389 4.69969 7.5 4.6997 9.67611 5.45822 11.8268 6.94179 13.2472L6.45769 13.7528C4.80788 12.1732 3.9997 9.8239 3.99969 7.5z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path><path d="M7.49996 3.95801C9.66928 3.95801 11.8753 4.35915 13.3706 5.19448 13.5394 5.28875 13.5998 5.50197 13.5055 5.67073 13.4113 5.83948 13.198 5.89987 13.0293 5.8056 11.6794 5.05155 9.60799 4.65801 7.49996 4.65801 5.39192 4.65801 3.32052 5.05155 1.97064 5.8056 1.80188 5.89987 1.58866 5.83948 1.49439 5.67073 1.40013 5.50197 1.46051 5.28875 1.62927 5.19448 3.12466 4.35915 5.33063 3.95801 7.49996 3.95801zM7.49996 10.85C9.66928 10.85 11.8753 10.4488 13.3706 9.6135 13.5394 9.51924 13.5998 9.30601 13.5055 9.13726 13.4113 8.9685 13.198 8.90812 13.0293 9.00238 11.6794 9.75643 9.60799 10.15 7.49996 10.15 5.39192 10.15 3.32052 9.75643 1.97064 9.00239 1.80188 8.90812 1.58866 8.9685 1.49439 9.13726 1.40013 9.30601 1.46051 9.51924 1.62927 9.6135 3.12466 10.4488 5.33063 10.85 7.49996 10.85z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg></span> */}
                {/* <div className="flex items-center gap-2"> */}
                  {/* <div className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </div> */}
                  <IpDisplay />
                {/* </div> */}
              </div>
              
              <Separator />
              
              {/* Export */}
              <ExportMenu />
            </div>

            {/* Sign In/Out */}
            {user ? (
              <Button
                onClick={signOut}
                variant="outline"
                className="w-full gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Button
                onClick={signInWithGoogle}
                className="w-full gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
