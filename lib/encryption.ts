/**
 * Encryption/decryption using AES-GCM via Web Crypto API
 * Falls back to XOR-based encryption for insecure contexts (HTTP via IP)
 */

function isCryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && !!crypto.subtle
}

async function hashPinWebCrypto(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = new Uint8Array(hashBuffer)
  return btoa(String.fromCharCode(...hashArray))
}

function hashPinFallback(pin: string): string {
  let hash = 0
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}

export async function hashPin(pin: string): Promise<string> {
  if (isCryptoAvailable()) {
    return hashPinWebCrypto(pin)
  }
  return hashPinFallback(pin)
}

export async function verifyPin(pin: string, hashedPin: string): Promise<boolean> {
  const hash = await hashPin(pin)
  return hash === hashedPin
}

async function deriveKeyWebCrypto(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const pinBuffer = encoder.encode(pin)
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    pinBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  )
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

function deriveKeyFallback(pin: string, salt: Uint8Array): Uint8Array {
  const encoder = new TextEncoder()
  const pinBuffer = encoder.encode(pin)
  const combined = new Uint8Array(pinBuffer.length + salt.length)
  combined.set(pinBuffer)
  combined.set(salt, pinBuffer.length)
  
  const key = new Uint8Array(32)
  for (let i = 0; i < 32; i++) {
    key[i] = combined[i % combined.length] ^ i
  }
  return key
}

function xorEncrypt(text: string, key: Uint8Array): Uint8Array {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const result = new Uint8Array(data.length)
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ key[i % key.length]
  }
  return result
}

function xorDecrypt(encrypted: Uint8Array, key: Uint8Array): string {
  const result = new Uint8Array(encrypted.length)
  for (let i = 0; i < encrypted.length; i++) {
    result[i] = encrypted[i] ^ key[i % key.length]
  }
  const decoder = new TextDecoder()
  return decoder.decode(result)
}

export async function encrypt(text: string, pin: string): Promise<string> {
  const cryptoAvail = isCryptoAvailable()
  const salt = cryptoAvail 
    ? crypto.getRandomValues(new Uint8Array(16))
    : crypto.getRandomValues(new Uint8Array(32))
  
  const iv = cryptoAvail 
    ? crypto.getRandomValues(new Uint8Array(12))
    : new Uint8Array(0)
  
  if (cryptoAvail) {
    const key = await deriveKeyWebCrypto(pin, salt)
    const data = new TextEncoder().encode(text)
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )
    
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
    combined.set(salt, 0)
    combined.set(iv, salt.length)
    combined.set(new Uint8Array(encrypted), salt.length + iv.length)
    
    return btoa(String.fromCharCode(...combined))
  }
  
  const key = deriveKeyFallback(pin, salt)
  const encrypted = xorEncrypt(text, key)
  
  const combined = new Uint8Array(salt.length + encrypted.length)
  combined.set(salt, 0)
  combined.set(encrypted, salt.length)
  
  return btoa(String.fromCharCode(...combined))
}

export async function decrypt(encryptedBase64: string, pin: string): Promise<string | null> {
  try {
    const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0))
    
    if (isCryptoAvailable()) {
      const salt = combined.slice(0, 16)
      const iv = combined.slice(16, 28)
      const encrypted = combined.slice(28)
      
      const key = await deriveKeyWebCrypto(pin, salt)
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      )
      
      return new TextDecoder().decode(decrypted)
    }
    
    const salt = combined.slice(0, 32)
    const encrypted = combined.slice(32)
    
    const key = deriveKeyFallback(pin, salt)
    return xorDecrypt(encrypted, key)
  } catch {
    return null
  }
}
