import { NextResponse } from 'next/server'
import { GridFSBucket } from 'mongodb'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params
  const db = await getDb()
  if (!db) return new NextResponse(null, { status: 404 })

  const file = await db.collection('aether_documents.files').findOne(
    { 'metadata.kind': 'market-logo', 'metadata.symbol': symbol.toUpperCase(), 'metadata.active': true },
    { sort: { uploadDate: -1 } }
  )
  if (!file) return new NextResponse(null, { status: 404 })

  const bucket = new GridFSBucket(db, { bucketName: 'aether_documents' })
  const chunks: Buffer[] = []
  await new Promise<void>((resolve, reject) => {
    bucket.openDownloadStream(file._id).on('data', c => chunks.push(Buffer.from(c))).on('end', () => resolve()).on('error', reject)
  })

  return new NextResponse(Buffer.concat(chunks), {
    headers: {
      'content-type': String(file.metadata?.contentType || 'image/png'),
      'cache-control': 'public, max-age=31536000, immutable'
    }
  })
}
