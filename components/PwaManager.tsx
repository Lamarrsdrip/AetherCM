"use client"
import {useEffect,useState} from 'react'

type InstallPromptEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed'}>}

function b64ToBytes(base64:string){
  const padding='='.repeat((4-base64.length%4)%4)
  const raw=atob((base64+padding).replace(/-/g,'+').replace(/_/g,'/'))
  return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)))
}

export default function PwaManager(){
  const[prompt,setPrompt]=useState<InstallPromptEvent|null>(null)
  const[show,setShow]=useState(false)
  const[ios,setIos]=useState(false)
  const[message,setMessage]=useState('')
  const[installed,setInstalled]=useState(false)
  const[signedIn,setSignedIn]=useState(false)

  useEffect(()=>{
    if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{})
    fetch('/api/auth/session',{cache:'no-store'}).then(r=>r.json()).then(d=>setSignedIn(Boolean(d?.session))).catch(()=>{})
    const standalone=window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone===true
    setInstalled(standalone)
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent))
    const handler=(e:Event)=>{e.preventDefault();setPrompt(e as InstallPromptEvent);if(localStorage.getItem('aether-install-dismissed')!=='1')setShow(true)}
    window.addEventListener('beforeinstallprompt',handler)
    if(!standalone&&localStorage.getItem('aether-install-dismissed')!=='1')setTimeout(()=>setShow(true),1800)
    return()=>window.removeEventListener('beforeinstallprompt',handler)
  },[])

  async function install(){
    if(prompt){
      await prompt.prompt()
      const choice=await prompt.userChoice
      if(choice.outcome==='accepted'){setInstalled(true);setShow(false)}
      setPrompt(null)
      return
    }
    if(ios)setMessage('On iPhone, tap the Share button in Safari, then choose “Add to Home Screen”.')
    else setMessage('Open your browser menu and choose “Install app” or “Add to Home screen”.')
  }

  async function alerts(){
    if(!('Notification'in window)||!('serviceWorker'in navigator)){setMessage('Account alerts are not supported on this browser.');return}
    const permission=await Notification.requestPermission()
    if(permission!=='granted'){setMessage('Notifications are off. You can enable them later in your browser settings.');return}
    const k=await fetch('/api/push/public-key')
    if(!k.ok){setMessage('Account alerts are not available yet.');return}
    const {publicKey}=await k.json()
    const reg=await navigator.serviceWorker.ready
    const existing=await reg.pushManager.getSubscription()
    const sub=existing||await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64ToBytes(publicKey)})
    const r=await fetch('/api/push/subscribe',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(sub)})
    setMessage(r.ok?'Account alerts are on.':'We could not enable alerts yet.')
  }

  if(installed&&!show)return null
  if(!show)return null
  return <div className="pwaPrompt">
    <button className="pwaClose" onClick={()=>{setShow(false);localStorage.setItem('aether-install-dismissed','1')}} aria-label="Close">×</button>
    <div className="pwaMark">A</div>
    <div className="pwaCopy"><b>Keep Aether close</b><span>Add Aether to your Home Screen and turn on account alerts.</span>{message&&<small>{message}</small>}</div>
    {!installed&&<button onClick={install}>Add to Home Screen</button>}
    {signedIn&&<button className="pwaSecondary" onClick={alerts}>Enable alerts</button>}
  </div>
}
