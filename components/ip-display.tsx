"use client"

import { useState, useEffect } from "react"
import { Copy, Check } from "lucide-react"

export function IpDisplay() {
  const [mounted, setMounted] = useState(false)
  const [ip, setIp] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => {
        setIp(data.ip)
      })
      .catch(() => {
        setIp(null)
      })
  }, [])

  const handleCopy = async () => {
    if (ip) {
      await navigator.clipboard.writeText(ip)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-secondary/50 px-3 py-1.5">
        <div className="h-2 w-2 rounded-full bg-primary/50" />
        <span className="text-[10px] text-muted-foreground">...</span>
      </div>
    )
  }

  if (!ip) return null

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-2 rounded-full bg-secondary/50 px-3 py-1.5 transition-colors hover:bg-secondary"
      aria-label="Copy IP address"
    >
      <div className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </div>
      <span className="text-[10px] font-medium text-foreground">{ip}</span>
      {copied ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3 text-muted-foreground" />
      )}
    </button>
  )
}
