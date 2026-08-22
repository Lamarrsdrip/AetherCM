import { NextResponse } from 'next/server'
import { GridFSBucket } from 'mongodb'
import { Readable } from 'stream'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { assertTrustedOrigin, cleanText } from '@/lib/security'
import { loadState, saveState } from '@/lib/store'
import type { ShareControl } from '@/lib/ops'

const MAX_BYTES = 3 * 1024 * 1024
const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp'])

function isValidImage(bytes: Buffer, type: string) {
  if (type === 'image/png') return bytes.subarray(0, 8).toString('hex') === '89504e470d0a1a0a'
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (type === 'image/webp') return bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP'
  return false
}

async function isAdmin() {
  const s = await getSession()
  return s?.role === 'admin'
}

// Creates a new asset with a required uploaded logo, or replaces the logo on an
// existing asset (in which case symbol/name/assetType/etc for an existing asset
// are ignored — only the logo changes).
export async function POST(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Administrator access required.' }, { status: 401 })
  try { assertTrustedOrigin(req) } catch { return NextResponse.json({ error: 'Please refresh and try again.' }, { status: 403 }) }

  const db = await getDb()
  if (!db) return NextResponse.json({ error: 'DATABASE_URL is required before logos can be uploaded.' }, { status: 503 })

  const form = await req.formData()
  const symbol = String(form.get('symbol') || '').trim().toUpperCase()
  const file = form.get('file')

  if (!symbol) return NextResponse.json({ error: 'Enter a ticker symbol.' }, { status: 400 })
  if (!(file instanceof File)) return NextResponse.json({ error: 'Choose a logo image from your device.' }, { status: 400 })
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: 'Logo must be a PNG, JPEG or WEBP image.' }, { status: 400 })
  if (file.size <= 0 || file.size > MAX_BYTES) return NextResponse.json({ error: 'Logo must be under 3 MB.' }, { status: 400 })

  const bytes = Buffer.from(await file.arrayBuffer())
  if (!isValidImage(bytes, file.type)) return NextResponse.json({ error: 'The selected file is not a valid image.' }, { status: 400 })

  const state = await loadState()
  const existing = state.shareControls.find(x => x.symbol === symbol)

  await db.collection('aether_documents.files').updateMany(
    { 'metadata.kind': 'market-logo', 'metadata.symbol': symbol, 'metadata.active': true },
    { $set: { 'metadata.active': false } }
  )

  const bucket = new GridFSBucket(db, { bucketName: 'aether_documents' })
  const upload = bucket.openUploadStream(`${symbol}-logo`, {
    metadata: { kind: 'market-logo', symbol, active: true, contentType: file.type, uploadedAt: new Date() }
  })
  await new Promise<void>((resolve, reject) => {
    const source = Readable.from(bytes)
    source.on('error', reject)
    upload.on('finish', () => resolve())
    upload.on('error', reject)
    source.pipe(upload)
  })

  const logoUrl = `/api/market-logo/${symbol}?v=${String(upload.id)}`

  if (existing) {
    existing.logoUrl = logoUrl
  } else {
    const assetType = form.get('assetType') === 'ETF' ? 'ETF' : 'Stock'
    const asset: ShareControl = {
      symbol, name: cleanText(form.get('name'), 120) || symbol, enabled: false, manualPrice: 0, previousPrice: 0, marketCap: 0,
      allocationCapPct: 25, minAmount: 100, maxAmount: 50000, maxShares: 1000, approvalRequired: true,
      assetType, category: cleanText(form.get('category'), 80), description: cleanText(form.get('description'), 400),
      logoUrl
    }
    state.shareControls.push(asset)
  }

  await saveState(state)
  return NextResponse.json({ ok: true, shareControls: state.shareControls })
}
