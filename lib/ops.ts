export type ShareAllocation = {
  id:string; userId:string; userName:string; symbol:string; name:string;
  requestedAmount:number; shares:number; price:number; value:number;
  status:'Pending'|'Approved'|'Rejected'; createdAt:string
}

export type AccountAdjustment = {
  id:string; userId:string; userName:string; amount:number;
  kind:'Credit'|'Debit'|'Scheduled daily gain'; note:string; createdAt:string
}

export type DailyGainRule = {
  enabled:boolean; mode:'percent'|'fixed'; value:number;
  scope:'all'|'managed-only'; label:string
}

export type ShareControl = {
  symbol:string; name:string; enabled:boolean; manualPrice:number;
  allocationCapPct:number; minAmount:number; maxAmount:number;
  maxShares:number; approvalRequired:boolean
}

export type CryptoDepositAddress = {
  id:string; asset:string; network:string; address:string;
  enabled:boolean; minDeposit:number; confirmationsLabel:string
}

export type ManualCryptoGateway = {
  enabled:boolean;
  primaryAsset:string;
  paymentWindowMinutes:number;
  instructions:string;
  addresses:CryptoDepositAddress[];
}

export type FundingMethod = {
  id:'crypto'|'wire'|'paypal'; enabled:boolean; label:string;
  instructions:string; primary:boolean
}

export type TransferRequest = {
  id:string; userId:string; userName:string; direction:'Deposit'|'Withdrawal';
  method:'crypto'|'wire'|'paypal'; asset?:string; network?:string; amount:number;
  reference:string; destination?:string; depositAddress?:string;
  expiresAt?:string; status:'Pending'|'Approved'|'Rejected'|'Completed'|'Expired';
  createdAt:string
}

export const demoClient={id:'AC-20491',name:'Maya Chen',baseBalance:123305.90}

export const initialAllocations:ShareAllocation[]=[
  {id:'AL-1008',userId:'AC-20491',userName:'Maya Chen',symbol:'NVDA',name:'NVIDIA',requestedAmount:2155.56,shares:12,price:179.63,value:2155.56,status:'Pending',createdAt:'Aug 20 · 14:42'}
]

export const initialAdjustments:AccountAdjustment[]=[
  {id:'ADJ-501',userId:'AC-20491',userName:'Maya Chen',amount:250,kind:'Credit',note:'Admin account adjustment',createdAt:'Aug 20 · 09:10'}
]

export const initialDailyGain:DailyGainRule={
  enabled:false,mode:'percent',value:0.25,scope:'managed-only',label:'Managed program accrual'
}

export const initialShareControls:ShareControl[]=[
  {symbol:'AAPL',name:'Apple',enabled:true,manualPrice:231.42,allocationCapPct:25,minAmount:100,maxAmount:50000,maxShares:250,approvalRequired:true},
  {symbol:'TSLA',name:'Tesla',enabled:true,manualPrice:338.72,allocationCapPct:25,minAmount:100,maxAmount:50000,maxShares:250,approvalRequired:true},
  {symbol:'NVDA',name:'NVIDIA',enabled:true,manualPrice:179.63,allocationCapPct:25,minAmount:100,maxAmount:50000,maxShares:300,approvalRequired:true},
  {symbol:'SPY',name:'SPDR S&P 500 ETF',enabled:true,manualPrice:649.28,allocationCapPct:45,minAmount:100,maxAmount:100000,maxShares:500,approvalRequired:true},
  {symbol:'QQQ',name:'Invesco QQQ',enabled:true,manualPrice:582.14,allocationCapPct:35,minAmount:100,maxAmount:100000,maxShares:400,approvalRequired:true}
]

export const initialCryptoGateway:ManualCryptoGateway={
  enabled:true,
  primaryAsset:'USDT',
  paymentWindowMinutes:30,
  instructions:'Send only the selected asset on the selected network. After payment, submit the transaction hash for manual verification.',
  addresses:[
    {id:'CR-1',asset:'USDT',network:'TRC20',address:'ADMIN_SET_USDT_TRC20_ADDRESS',enabled:true,minDeposit:50,confirmationsLabel:'Manual verification'},
    {id:'CR-2',asset:'USDT',network:'ERC20',address:'ADMIN_SET_USDT_ERC20_ADDRESS',enabled:false,minDeposit:100,confirmationsLabel:'Manual verification'},
    {id:'CR-3',asset:'USDC',network:'ERC20',address:'ADMIN_SET_USDC_ERC20_ADDRESS',enabled:true,minDeposit:50,confirmationsLabel:'Manual verification'},
    {id:'CR-4',asset:'BTC',network:'Bitcoin',address:'ADMIN_SET_BTC_ADDRESS',enabled:true,minDeposit:100,confirmationsLabel:'Manual verification'}
  ]
}

export const initialFundingMethods:FundingMethod[]=[
  {id:'crypto',enabled:true,label:'Crypto',primary:true,instructions:'Manual crypto gateway'},
  {id:'wire',enabled:true,label:'International bank transfer',primary:false,instructions:'Bank: ADMIN_SET_REQUIRED · SWIFT: ADMIN_SET_REQUIRED · Beneficiary: Aether Capital Markets'},
  {id:'paypal',enabled:true,label:'PayPal',primary:false,instructions:'PayPal tag: @ADMIN_SET_REQUIRED'}
]

export const initialTransfers:TransferRequest[]=[]
