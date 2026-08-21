import './globals.css'
import type {Metadata,Viewport} from 'next'
import ChatWidget from '@/components/ChatWidget'
import PwaManager from '@/components/PwaManager'

export const metadata:Metadata={
 title:{default:'Aether Capital Markets',template:'%s · Aether'},
 description:'Investing, money movement and private client support in one secure workspace.',
 manifest:'/manifest.webmanifest',
 icons:{icon:[{url:'/icons/icon-192.png',sizes:'192x192',type:'image/png'},{url:'/icons/icon-512.png',sizes:'512x512',type:'image/png'}],apple:'/icons/apple-touch-icon.png'},
 appleWebApp:{capable:true,title:'Aether',statusBarStyle:'default'},
 formatDetection:{telephone:false}
}
export const viewport:Viewport={themeColor:'#1f5a46',width:'device-width',initialScale:1,viewportFit:'cover'}

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body>{children}<ChatWidget/><PwaManager/></body></html>
}
