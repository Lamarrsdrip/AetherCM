import { NextResponse } from 'next/server'
import { GridFSBucket } from 'mongodb'
import { getDb } from '@/lib/db'
export const dynamic='force-dynamic'
export async function GET(req:Request){
 const db=await getDb(); if(!db) return NextResponse.redirect(new URL('/documents/AetherCM-Client-Relationship-Summary.pdf',req.url))
 const file=await db.collection('aether_documents.files').findOne({'metadata.kind':'client-relationship-summary','metadata.active':true},{sort:{uploadDate:-1}})
 if(!file) return NextResponse.redirect(new URL('/documents/AetherCM-Client-Relationship-Summary.pdf',req.url))
 const bucket=new GridFSBucket(db,{bucketName:'aether_documents'}); const chunks:Buffer[]=[]
 await new Promise<void>((resolve,reject)=>{bucket.openDownloadStream(file._id).on('data',(c)=>chunks.push(Buffer.from(c))).on('end',()=>resolve()).on('error',reject)})
 const url=new URL(req.url); const disposition=url.searchParams.get('download')==='1'?'attachment':'inline'; const filename=String(file.filename||'AetherCM-Client-Relationship-Summary.pdf').replace(/"/g,'')
 return new NextResponse(Buffer.concat(chunks),{headers:{'content-type':'application/pdf','content-disposition':`${disposition}; filename="${filename}"`,'cache-control':'no-store'}})
}
