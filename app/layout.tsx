import './globals.css'
import type { Metadata } from 'next'
import ChatWidget from '@/components/ChatWidget'

export const metadata: Metadata = {
  title: 'Aether Capital Markets',
  description: 'Modern investing, portfolio intelligence and private client tools.'
}

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body>{children}<ChatWidget/></body></html>
}
