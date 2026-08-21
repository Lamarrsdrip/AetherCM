import { NextResponse } from 'next/server'
import { GridFSBucket } from 'mongodb'
import { Readable } from 'stream'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { assertTrustedOrigin } from '@/lib/security'

const MAX_BYTES = 10 * 1024 * 1024

async function isAdmin() {
  const s = await getSession()
  return s?.role === 'admin'
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({error:'Administrator access required.'},{status:401})

  const db = await getDb()
  if (!db) return NextResponse.json({configured:false, document:null})

  const file = await db.collection('aether_documents.files').findOne(
    {'metadata.kind':'client-relationship-summary','metadata.active':true},
    {sort:{uploadDate:-1}}
  )

  return NextResponse.json({
    configured:true,
    document:file ? {
      id:String(file._id),
      filename:file.filename,
      size:file.length,
      uploadedAt:file.uploadDate,
    } : null
  })
}

export async function POST(req:Request) {
  if (!await isAdmin()) return NextResponse.json({error:'Administrator access required.'},{status:401})

  try {
    assertTrustedOrigin(req)
  } catch {
    return NextResponse.json({error:'Please refresh and try again.'},{status:403})
  }

  const db = await getDb()
  if (!db) {
    return NextResponse.json(
      {error:'DATABASE_URL is required before documents can be uploaded.'},
      {status:503}
    )
  }

  const form = await req.formData()
  const file = form.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({error:'Choose a PDF file.'},{status:400})
  }

  if (file.type !== 'application/pdf') {
    return NextResponse.json({error:'Only PDF files are allowed.'},{status:400})
  }

  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json({error:'PDF must be between 1 byte and 10 MB.'},{status:400})
  }

  const bytes = Buffer.from(await file.arrayBuffer())

  if (bytes.subarray(0,5).toString() !== '%PDF-') {
    return NextResponse.json({error:'The selected file is not a valid PDF.'},{status:400})
  }

  await db.collection('aether_documents.files').updateMany(
    {'metadata.kind':'client-relationship-summary','metadata.active':true},
    {$set:{'metadata.active':false}}
  )

  const bucket = new GridFSBucket(db,{bucketName:'aether_documents'})
  const safeName =
    file.name.replace(/[^\w.\- ]+/g,'').slice(0,120) ||
    'AetherCM-Client-Relationship-Summary.pdf'

  // MongoDB GridFSBucketWriteStreamOptions does not support a top-level
  // contentType property. Store MIME information inside metadata instead.
  const upload = bucket.openUploadStream(safeName,{
    metadata:{
      kind:'client-relationship-summary',
      active:true,
      contentType:'application/pdf',
      uploadedAt:new Date(),
    }
  })

  await new Promise<void>((resolve,reject)=>{
    const source = Readable.from(bytes)
    source.on('error',reject)
    upload.on('finish',()=>resolve())
    upload.on('error',reject)
    source.pipe(upload)
  })

  return NextResponse.json({
    ok:true,
    document:{
      id:String(upload.id),
      filename:safeName,
      size:file.size,
      uploadedAt:new Date().toISOString(),
    }
  })
}
