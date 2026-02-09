"use client"

import { useState, useCallback } from "react"
import { useApps, type AppItem } from "@/hooks/use-apps"
import { useNotes, type Note } from "@/hooks/use-notes"
import { useSavedPins } from "@/hooks/use-saved-pins"
import { usePinManager } from "@/hooks/use-pin-manager"
import { decrypt } from "@/lib/encryption"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Download, FileJson, FileText, ChevronRight, Check, X } from "lucide-react"
import { jsPDF } from "jspdf"

interface SelectedGroup {
  pinId: string
  pin: string
  isValid: boolean | null
}

export function ExportMenu() {
  const { apps } = useApps()
  const { notes } = useNotes()
  const { pins } = useSavedPins()
  const { getPinId } = usePinManager()

  const [exportFormat, setExportFormat] = useState<"json" | "pdf" | null>(null)
  const [selectedGroups, setSelectedGroups] = useState<Map<string, SelectedGroup>>(new Map())
  const [exporting, setExporting] = useState(false)
  const [exportResult, setExportResult] = useState<{
    success: boolean
    message: string
    exportedApps: number
    exportedNotes: number
  } | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const dialogOpen = exportFormat !== null

  const handleOpenFormat = useCallback((format: "json" | "pdf") => {
    setExportFormat(format)
    setSelectedGroups(new Map())
    setExportResult(null)
  }, [])

  const handleGroupToggle = useCallback((pinId: string, checked: boolean) => {
    setSelectedGroups((prev) => {
      const next = new Map(prev)
      if (checked) {
        next.set(pinId, { pinId, pin: "", isValid: null })
      } else {
        next.delete(pinId)
      }
      return next
    })
  }, [])

  const handlePinChange = useCallback((pinId: string, value: string) => {
    setSelectedGroups((prev) => {
      const next = new Map(prev)
      const entry = next.get(pinId)
      if (entry) {
        next.set(pinId, { ...entry, pin: value, isValid: null })
      }
      return next
    })
  }, [])

  const handleValidatePin = useCallback(
    async (pinId: string, pin: string) => {
      if (pin.length < 4) return
      const savedPin = pins.find((p) => p.id === pinId)
      if (!savedPin) {
        setSelectedGroups((prev) => {
          const next = new Map(prev)
          const entry = next.get(pinId)
          if (entry) {
            next.set(pinId, { ...entry, isValid: false })
          }
          return next
        })
        return
      }
      const { verifyPin } = await import("@/lib/encryption")
      const isValid = await verifyPin(pin, savedPin.hashedPin)
      setSelectedGroups((prev) => {
        const next = new Map(prev)
        const entry = next.get(pinId)
        if (entry) {
          next.set(pinId, { ...entry, isValid })
        }
        return next
      })
    },
    [pins]
  )

  const getDecryptedData = useCallback(async () => {
    const decryptedApps: AppItem[] = []
    const decryptedNotes: Note[] = []

    for (const app of apps) {
      const pinId = getPinId(app.id, "app")
      if (!pinId) {
        decryptedApps.push(app)
      } else if (selectedGroups.has(pinId)) {
        const entry = selectedGroups.get(pinId)
        if (entry?.isValid && entry.pin) {
          const decryptedLink = await decrypt(app.link, entry.pin)
          if (decryptedLink) {
            decryptedApps.push({ ...app, link: decryptedLink })
          }
        }
      }
    }

    for (const note of notes) {
      const pinId = getPinId(note.id, "note")
      if (!pinId) {
        decryptedNotes.push(note)
      } else if (selectedGroups.has(pinId)) {
        const entry = selectedGroups.get(pinId)
        if (entry?.isValid && entry.pin) {
          const decryptedContent = await decrypt(note.encryptedContent, entry.pin)
          if (decryptedContent) {
            decryptedNotes.push({ ...note, encryptedContent: decryptedContent })
          }
        }
      }
    }

    return { decryptedApps, decryptedNotes }
  }, [apps, notes, selectedGroups, getPinId])

  const handleExport = useCallback(async () => {
    if (!exportFormat) return
    setExporting(true)

    try {
      const { decryptedApps, decryptedNotes } = await getDecryptedData()

      if (exportFormat === "json") {
        const exportData = {
          exportedAt: new Date().toISOString(),
          apps: decryptedApps,
          notes: decryptedNotes.map((n) => ({
            ...n,
            content: n.encryptedContent,
            encryptedContent: undefined,
          })),
        }
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: "application/json",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `dizzy-export-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        const doc = new jsPDF()
        let yPos = 20
        const pageWidth = doc.internal.pageSize.getWidth()
        const margin = 15
        const contentWidth = pageWidth - margin * 2

        doc.setFontSize(20)
        doc.setFont("helvetica", "bold")
        doc.text("Dizzy Export", margin, yPos)
        yPos += 10

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.text(`Exported: ${new Date().toLocaleString()}`, margin, yPos)
        yPos += 5
        doc.text(
          `Apps: ${decryptedApps.length} | Notes: ${decryptedNotes.length}`,
          margin,
          yPos
        )
        yPos += 15

        if (decryptedApps.length > 0) {
          doc.setFontSize(14)
          doc.setFont("helvetica", "bold")
          doc.text("Apps", margin, yPos)
          yPos += 8

          doc.setFontSize(10)
          doc.setFont("helvetica", "normal")

          for (const app of decryptedApps) {
            if (yPos > 270) {
              doc.addPage()
              yPos = 20
            }
            doc.setFont("helvetica", "bold")
            doc.text(app.name, margin, yPos)
            yPos += 5
            doc.setFont("helvetica", "normal")
            const linkLines = doc.splitTextToSize(app.link, contentWidth)
            doc.text(linkLines, margin, yPos)
            yPos += linkLines.length * 5 + 3
          }
          yPos += 5
        }

        if (decryptedNotes.length > 0) {
          if (yPos > 240) {
            doc.addPage()
            yPos = 20
          }

          doc.setFontSize(14)
          doc.setFont("helvetica", "bold")
          doc.text("Notes", margin, yPos)
          yPos += 8

          for (const note of decryptedNotes) {
            if (yPos > 260) {
              doc.addPage()
              yPos = 20
            }
            doc.setFontSize(12)
            doc.setFont("helvetica", "bold")
            doc.text(note.title, margin, yPos)
            yPos += 6
            doc.setFontSize(10)
            doc.setFont("helvetica", "normal")
            const contentLines = doc.splitTextToSize(
              note.encryptedContent,
              contentWidth
            )
            doc.text(contentLines, margin, yPos)
            yPos += contentLines.length * 5 + 8
          }
        }

        if (decryptedApps.length === 0 && decryptedNotes.length === 0) {
          doc.setFontSize(12)
          doc.text("No data to export.", margin, yPos)
        }

        doc.save(`dizzy-export-${new Date().toISOString().split("T")[0]}.pdf`)
      }

      setExportResult({
        success: true,
        message: `${exportFormat.toUpperCase()} exported successfully`,
        exportedApps: decryptedApps.length,
        exportedNotes: decryptedNotes.length,
      })
    } catch {
      setExportResult({
        success: false,
        message: `Failed to export ${exportFormat?.toUpperCase()}`,
        exportedApps: 0,
        exportedNotes: 0,
      })
    }

    setExporting(false)
  }, [exportFormat, getDecryptedData])

  const handleClose = useCallback(() => {
    setExportFormat(null)
    setSelectedGroups(new Map())
    setExportResult(null)
  }, [])

  const allSelectedValid =
    selectedGroups.size > 0 &&
    Array.from(selectedGroups.values()).every((g) => g.isValid === true)

  const exportDisabled =
    exporting || (selectedGroups.size > 0 && !allSelectedValid)

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between px-4 py-3 rounded-none"
          >
            <span className="flex items-center gap-2">
              <Download className="h-3.5 w-3.5" />
              <small>Export Data</small>
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="left" align="start" className="w-48">
          <DropdownMenuItem
            onSelect={() => {
              setDropdownOpen(false)
              handleOpenFormat("pdf")
            }}
          >
            <FileText className="mr-2 h-4 w-4" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              setDropdownOpen(false)
              handleOpenFormat("json")
            }}
          >
            <FileJson className="mr-2 h-4 w-4" />
            Export as JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Export as {exportFormat?.toUpperCase()}
            </DialogTitle>
            <DialogDescription>
              Select groups and enter their PINs to decrypt and include protected data in the export.
            </DialogDescription>
          </DialogHeader>

          {exportResult ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
              {exportResult.success ? (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Export Complete</h3>
                  <p className="text-sm text-muted-foreground">
                    {exportResult.exportedApps} app{exportResult.exportedApps !== 1 ? "s" : ""} and{" "}
                    {exportResult.exportedNotes} note{exportResult.exportedNotes !== 1 ? "s" : ""} exported.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <X className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Export Failed</h3>
                  <p className="text-sm text-muted-foreground">
                    {exportResult.message}
                  </p>
                </>
              )}
              <Button onClick={handleClose} variant="outline" className="mt-4">
                Close
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="max-h-[50vh]">
                <div className="space-y-4 pr-4">
                  {pins.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">
                        No groups found. All unprotected data will be exported.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Select Groups</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedGroups.size} of {pins.length} selected
                        </p>
                      </div>

                      <div className="space-y-3">
                        {pins.map((pin) => {
                          const group = selectedGroups.get(pin.id)
                          const isSelected = selectedGroups.has(pin.id)

                          return (
                            <div
                              key={pin.id}
                              className={`rounded-lg border p-4 transition-colors ${
                                isSelected
                                  ? "border-primary/50 bg-primary/5"
                                  : "border-border"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  id={`group-${pin.id}`}
                                  checked={isSelected}
                                  onCheckedChange={(checked) =>
                                    handleGroupToggle(pin.id, checked as boolean)
                                  }
                                  className="mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <Label
                                    htmlFor={`group-${pin.id}`}
                                    className="text-sm font-medium cursor-pointer"
                                  >
                                    {pin.name}
                                  </Label>
                                  {pin.hint && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      Hint: {pin.hint}
                                    </p>
                                  )}
                                </div>
                                {isSelected && group?.isValid === true && (
                                  <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                )}
                                {isSelected && group?.isValid === false && (
                                  <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                                )}
                              </div>

                              {isSelected && (
                                <div className="mt-3 pl-7">
                                  <div className="flex gap-2">
                                    <Input
                                      type="password"
                                      placeholder="Enter group PIN"
                                      value={group?.pin || ""}
                                      onChange={(e) =>
                                        handlePinChange(pin.id, e.target.value)
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          const entry = selectedGroups.get(pin.id)
                                          if (entry && entry.pin.length >= 4) {
                                            handleValidatePin(pin.id, entry.pin)
                                          }
                                        }
                                      }}
                                      className={`text-sm h-9 ${
                                        group?.isValid === false
                                          ? "border-destructive focus-visible:ring-destructive"
                                          : group?.isValid === true
                                            ? "border-green-500 focus-visible:ring-green-500"
                                            : ""
                                      }`}
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="h-9 px-3 shrink-0"
                                      disabled={!group?.pin || group.pin.length < 4}
                                      onClick={() => {
                                        const entry = selectedGroups.get(pin.id)
                                        if (entry) {
                                          handleValidatePin(pin.id, entry.pin)
                                        }
                                      }}
                                    >
                                      Verify
                                    </Button>
                                  </div>
                                  {group?.isValid === false && (
                                    <p className="text-xs text-destructive mt-1.5">
                                      Incorrect PIN. Please try again.
                                    </p>
                                  )}
                                  {group?.isValid === true && (
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1.5">
                                      PIN verified successfully.
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}

                  <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">
                      Unprotected apps and notes are always included. Only data from selected groups with a valid PIN will be decrypted and exported.
                    </p>
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleExport} disabled={exportDisabled}>
                  {exporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      {exportFormat === "pdf" ? (
                        <FileText className="mr-2 h-4 w-4" />
                      ) : (
                        <FileJson className="mr-2 h-4 w-4" />
                      )}
                      Export {exportFormat?.toUpperCase()}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
