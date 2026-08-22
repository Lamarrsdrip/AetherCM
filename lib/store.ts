import {
  initialAccounts, initialAdjustments, initialAllocations, initialDailyGain,
  initialShareControls, initialFundingMethods, initialTransfers,
  initialCryptoGateway, initialSiteContent, initialCompanyProfile, initialSocialLinks, initialEmailConfig,
  type Account, type AccountAdjustment, type DailyGainRule,
  type ShareAllocation, type ShareControl, type FundingMethod,
  type TransferRequest, type ManualCryptoGateway, type HoldingView,
  type SiteContent, type CompanyProfile, type SocialLinks, type DailyPerformanceEntry, type EmailConfig
} from './ops'
import { getDb } from './db'

export type AppState = {
  accounts: Account[]
  allocations: ShareAllocation[]
  adjustments: AccountAdjustment[]
  dailyGain: DailyGainRule
  shareControls: ShareControl[]
  fundingMethods: FundingMethod[]
  transfers: TransferRequest[]
  cryptoGateway: ManualCryptoGateway
  siteContent: SiteContent
  companyProfile: CompanyProfile
  socialLinks: SocialLinks
  emailConfig: EmailConfig
  lastAccrualDateByUser: Record<string,string>
  dailyOpeningBalance: Record<string,{date:string,balance:number}>
  dailyPerformanceHistory: DailyPerformanceEntry[]
}

declare global {
  var __aetherMemoryState: AppState | undefined
}

function clone<T>(value:T):T {
  return JSON.parse(JSON.stringify(value))
}

function defaultState():AppState {
  return {
    accounts: clone(initialAccounts),
    allocations: clone(initialAllocations),
    adjustments: clone(initialAdjustments),
    dailyGain: clone(initialDailyGain),
    shareControls: clone(initialShareControls),
    fundingMethods: clone(initialFundingMethods),
    transfers: clone(initialTransfers),
    cryptoGateway: clone(initialCryptoGateway),
    siteContent: clone(initialSiteContent),
    companyProfile: clone(initialCompanyProfile),
    socialLinks: clone(initialSocialLinks),
    emailConfig: clone(initialEmailConfig),
    lastAccrualDateByUser: {},
    dailyOpeningBalance: {},
    dailyPerformanceHistory: [],
  }
}

function mergeState(raw?:Partial<AppState>|null):AppState {
  const base = defaultState()
  if (!raw) return base

  const savedShares = new Map((raw.shareControls || []).map(x => [x.symbol, x]))
  const savedAddresses = new Map((raw.cryptoGateway?.addresses || []).map(x => [x.id, x]))
  const savedOffers = new Map((raw.siteContent?.offers || []).map(x => [x.id, x]))

  return {
    ...base,
    ...raw,
    accounts: raw.accounts || [],
    allocations: raw.allocations || [],
    adjustments: raw.adjustments || [],
    transfers: raw.transfers || [],
    shareControls: base.shareControls.map(x => ({...x, ...(savedShares.get(x.symbol) || {})})),
    fundingMethods: raw.fundingMethods?.length ? raw.fundingMethods : base.fundingMethods,
    cryptoGateway: {
      ...base.cryptoGateway,
      ...(raw.cryptoGateway || {}),
      addresses: base.cryptoGateway.addresses.map(x => ({...x, ...(savedAddresses.get(x.id) || {})}))
    },
    siteContent: {
      ...base.siteContent,
      ...(raw.siteContent || {}),
      contact: {...base.siteContent.contact, ...(raw.siteContent?.contact || {})},
      offers: base.siteContent.offers.map(x => ({...x, ...(savedOffers.get(x.id) || {})}))
    },
    companyProfile: {...base.companyProfile, ...(raw.companyProfile || {})},
    socialLinks: {...base.socialLinks, ...(raw.socialLinks || {})},
    emailConfig: {...base.emailConfig, ...(raw.emailConfig || {})},
    lastAccrualDateByUser: raw.lastAccrualDateByUser || {},
    dailyOpeningBalance: raw.dailyOpeningBalance || {},
    dailyPerformanceHistory: raw.dailyPerformanceHistory || [],
  }
}

export async function loadState():Promise<AppState> {
  const db = await getDb()
  if (!db) {
    if (!globalThis.__aetherMemoryState) globalThis.__aetherMemoryState = defaultState()
    return globalThis.__aetherMemoryState
  }

  const doc = await db.collection<{_id:string,state:AppState}>('app_state').findOne({_id:'main'})
  const state = mergeState(doc?.state)
  if (!doc) {
    await db.collection<any>('app_state').updateOne(
      {_id:'main'},
      {$set:{state, updatedAt:new Date()}},
      {upsert:true}
    )
  }
  return state
}

export async function saveState(state:AppState) {
  const db = await getDb()
  if (!db) {
    globalThis.__aetherMemoryState = state
    return
  }
  await db.collection<any>('app_state').updateOne(
    {_id:'main'},
    {$set:{state, updatedAt:new Date()}},
    {upsert:true}
  )
}

function idFromEmail(email:string){
  let h=2166136261
  for(const c of email.toLowerCase()){
    h ^= c.charCodeAt(0)
    h = Math.imul(h,16777619)
  }
  return `AC-${String(Math.abs(h>>>0)).slice(0,8).padStart(8,'0')}`
}

function nameFromEmail(email:string){
  const raw=email.split('@')[0].replace(/[._-]+/g,' ').trim()
  return raw ? raw.replace(/\b\w/g,c=>c.toUpperCase()) : 'Aether Client'
}

export function ensureAccount(state:AppState,email:string,name?:string){
  const clean=email.trim().toLowerCase()
  let account=state.accounts.find(a=>a.email===clean)
  if(!account){
    account={
      id:idFromEmail(clean),
      email:clean,
      name:(name || '').trim() || nameFromEmail(clean),
      createdAt:new Date().toISOString(),
      status:'ACTIVE'
    }
    state.accounts.push(account)
  } else if (name?.trim() && account.name !== name.trim()) {
    account.name = name.trim()
  }
  return account
}

export function accountById(state:AppState,userId:string){
  return state.accounts.find(a=>a.id===userId)
}

/**
 * Resolves whether a notice to this account should actually push/email, based on
 * that account's stored notification preferences (missing prefs default to all-on,
 * matching the app's existing always-notify behavior for accounts that predate this setting).
 */
export function notifyFlags(account:Account,category:'investmentUpdates'|'transferUpdates'|'supportReplies'){
  const prefs=account.notificationPreferences
  if(!prefs)return {sendPush:true,sendEmailNotice:true}
  return {
    sendPush: prefs.push!==false && prefs[category]!==false,
    sendEmailNotice: prefs.email!==false && prefs[category]!==false
  }
}

export function sweepExpiredCryptoRequests(state:AppState){
  const now=Date.now()
  let changed=false
  state.transfers=state.transfers.map(t=>{
    if(t.method==='crypto' && t.direction==='Deposit' && t.status==='Pending' && t.expiresAt && new Date(t.expiresAt).getTime()<now){
      changed=true
      return {...t,status:'Expired' as const}
    }
    return t
  })
  return changed
}

function ledgerCash(state:AppState,userId:string){
  const adjustments=state.adjustments.filter(a=>a.userId===userId).reduce((n,a)=>n+a.amount,0)
  const deposits=state.transfers.filter(t=>t.userId===userId&&t.direction==='Deposit'&&t.status==='Completed').reduce((n,t)=>n+t.amount,0)
  const withdrawals=state.transfers.filter(t=>t.userId===userId&&t.direction==='Withdrawal'&&t.status==='Completed').reduce((n,t)=>n+t.amount,0)
  return adjustments+deposits-withdrawals
}

export function holdingsFor(state:AppState,userId:string):HoldingView[]{
  return state.allocations.filter(a=>a.userId===userId&&a.status==='Approved').map(a=>{
    const q=state.shareControls.find(x=>x.symbol===a.symbol)
    const currentPrice=q?.manualPrice??a.price
    const previousPrice=q?.previousPrice??currentPrice
    const currentValue=a.shares*currentPrice
    const pnl=currentValue-a.requestedAmount
    const pnlPct=a.requestedAmount>0?pnl/a.requestedAmount*100:0
    const dayPnl=a.shares*(currentPrice-previousPrice)
    const dayPct=previousPrice>0?(currentPrice-previousPrice)/previousPrice*100:0
    return {
      id:a.id,symbol:a.symbol,name:a.name,shares:a.shares,
      costBasis:a.requestedAmount,entryPrice:a.price,currentPrice,previousPrice,
      marketCap:q?.marketCap||0,currentValue,pnl,pnlPct,dayPnl,dayPct,
      purchasedAt:a.purchasedAt||a.approvedAt||a.createdAt
    }
  })
}

export function accountSnapshotByUser(state:AppState,userId:string){
  const holdings=holdingsFor(state,userId)
  const fundedCash=ledgerCash(state,userId)
  const investedCost=holdings.reduce((n,h)=>n+h.costBasis,0)
  const invested=holdings.reduce((n,h)=>n+h.currentValue,0)
  const unrealizedPnl=holdings.reduce((n,h)=>n+h.pnl,0)
  const dayPnl=holdings.reduce((n,h)=>n+h.dayPnl,0)
  const available=Math.max(0,fundedCash-investedCost)
  return {balance:available+invested,available,invested,investedCost,unrealizedPnl,dayPnl,holdings}
}

export function availableToAllocate(state:AppState,userId:string){
  const snap=accountSnapshotByUser(state,userId)
  const pending=state.allocations.filter(a=>a.userId===userId&&a.status==='Pending').reduce((n,a)=>n+a.requestedAmount,0)
  return Math.max(0,snap.available-pending)
}

export function applyDailyAccrualIfDue(state:AppState,userId:string,userName:string){
  if(!state.dailyGain.enabled)return false
  const today=new Date().toISOString().slice(0,10)
  if(state.lastAccrualDateByUser[userId]===today)return false
  const snap=accountSnapshotByUser(state,userId)
  const amount=state.dailyGain.mode==='percent'?snap.balance*(state.dailyGain.value/100):state.dailyGain.value
  if(Number.isFinite(amount)&&amount!==0&&snap.balance>0){
    state.adjustments.unshift({
      id:`AUTO-${Date.now()}-${userId}`,userId,userName,
      amount:Number(amount.toFixed(2)),kind:'Scheduled daily gain',
      note:state.dailyGain.label,createdAt:new Date().toISOString()
    })
  }
  state.lastAccrualDateByUser[userId]=today
  return true
}

function todayStr(){
  return new Date().toISOString().slice(0,10)
}

function isPerformanceKind(kind:string){
  return kind==='Daily Profit' || kind==='Daily Loss' || kind==='Scheduled daily gain'
}

/**
 * Lazily captures each user's opening balance for "today" and, on first touch of a new
 * calendar day, finalizes the previous day's total change into dailyPerformanceHistory.
 * Must run before applying any same-day balance-affecting change so "opening" reflects
 * the balance BEFORE today's adjustments.
 */
export function ensureDailyWindow(state:AppState,userId:string){
  const today=todayStr()
  const rec=state.dailyOpeningBalance[userId]
  if(!rec){
    state.dailyOpeningBalance[userId]={date:today,balance:accountSnapshotByUser(state,userId).balance}
    return true
  }
  if(rec.date===today)return false
  const adjTotal=state.adjustments
    .filter(a=>a.userId===userId && isPerformanceKind(a.kind) && a.createdAt.slice(0,10)===rec.date)
    .reduce((n,a)=>n+a.amount,0)
  const marketTotal=holdingsFor(state,userId).reduce((n,h)=>n+h.dayPnl,0)
  const amount=adjTotal+marketTotal
  if(amount!==0){
    const pct=rec.balance>0?amount/rec.balance*100:0
    state.dailyPerformanceHistory.unshift({
      id:`DP-${rec.date}-${userId}`,userId,date:rec.date,
      amount:Number(amount.toFixed(2)),pct:Number(pct.toFixed(2)),createdAt:new Date().toISOString()
    })
  }
  state.dailyOpeningBalance[userId]={date:today,balance:accountSnapshotByUser(state,userId).balance}
  return true
}

export function todaysPerformance(state:AppState,userId:string){
  const today=todayStr()
  const rec=state.dailyOpeningBalance[userId]
  const openingBalance=rec && rec.date===today ? rec.balance : accountSnapshotByUser(state,userId).balance
  const adjToday=state.adjustments
    .filter(a=>a.userId===userId && isPerformanceKind(a.kind) && a.createdAt.slice(0,10)===today)
    .reduce((n,a)=>n+a.amount,0)
  const marketToday=holdingsFor(state,userId).reduce((n,h)=>n+h.dayPnl,0)
  const amount=adjToday+marketToday
  const pct=openingBalance>0?amount/openingBalance*100:0
  return {amount:Number(amount.toFixed(2)),pct:Number(pct.toFixed(2)),openingBalance}
}
