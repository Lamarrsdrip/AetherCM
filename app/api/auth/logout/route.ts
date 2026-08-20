import { NextResponse } from 'next/server'
export async function POST(){const r=NextResponse.json({ok:true}); r.cookies.delete('aether_role'); r.cookies.delete('aether_email'); return r}
