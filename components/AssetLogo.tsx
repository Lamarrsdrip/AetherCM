"use client"
import {useState} from 'react'
import {Icon} from './Icons'
import {resolveLogoUrl} from '@/lib/assetLogos'

export default function AssetLogo({symbol,logoUrl,assetType='Stock',size=40}:{symbol:string;logoUrl?:string;assetType?:'Stock'|'ETF';size?:number}){
 const src=resolveLogoUrl({symbol,logoUrl})
 const[failed,setFailed]=useState(false)
 if(!src||failed){
  return <span className="assetLogoFallback" style={{width:size,height:size}}>
   <Icon name={assetType==='ETF'?'etfAsset':'stockAsset'} size={Math.round(size*0.55)}/>
  </span>
 }
 return <img className="assetLogoImg" src={src} alt={symbol} width={size} height={size} onError={()=>setFailed(true)}/>
}
