export type Address={line1:string;line2?:string;city:string;state?:string;postalCode?:string;country:string}
export type NotificationPreferences={email:boolean;push:boolean;investmentUpdates:boolean;transferUpdates:boolean;supportReplies:boolean}
export type Account={
 id:string;email:string;name:string;createdAt:string;status:'ACTIVE'|'FROZEN';
 phone?:string;address?:Address;avatarUrl?:string;updatedAt?:string;lastLoginAt?:string;
 notificationPreferences?:NotificationPreferences
}
export const defaultNotificationPreferences:NotificationPreferences={email:true,push:true,investmentUpdates:true,transferUpdates:true,supportReplies:true}

export type EmailConfig={enabled:boolean;gmailAddress:string;appPassword:string;fromName:string}
export const initialEmailConfig:EmailConfig={enabled:false,gmailAddress:'',appPassword:'',fromName:'Aether Capital Markets'}
export type ShareAllocation={id:string;userId:string;userName:string;symbol:string;name:string;requestedAmount:number;shares:number;price:number;value:number;status:'Pending'|'Approved'|'Rejected';createdAt:string;approvedAt?:string;purchasedAt?:string}
export type AdjustmentKind='Credit'|'Debit'|'Scheduled daily gain'|'Daily Profit'|'Daily Loss'|'Account Credit'|'Account Debit'
export type AccountAdjustment={id:string;userId:string;userName:string;amount:number;kind:AdjustmentKind;note:string;createdAt:string}
export type DailyGainRule={enabled:boolean;mode:'percent'|'fixed';value:number;scope:'all'|'managed-only';label:string}
export type ShareControl={
 symbol:string;name:string;enabled:boolean;manualPrice:number;previousPrice:number;marketCap:number;
 allocationCapPct:number;minAmount:number;maxAmount:number;maxShares:number;approvalRequired:boolean;
 assetType:'Stock'|'ETF';category?:string;description:string;logoUrl?:string
}
export type DailyPerformanceEntry={id:string;userId:string;date:string;amount:number;pct:number;createdAt:string}
export type CompanyProfile={
 name:string;description:string;addressLine1:string;addressLine2?:string;city:string;country:string;
 supportEmail:string;generalEmail:string;phone:string;whatsapp:string;businessHours:string;registrationNumber?:string
}
export type SocialLinks={twitter?:string;instagram?:string;linkedin?:string;facebook?:string;whatsappLink?:string}
export type HomepageContactSettings={
 heading:string;description:string;showAddress:boolean;showPhone:boolean;showWhatsapp:boolean;showEmails:boolean;showBusinessHours:boolean
}
export type HoldingView={id:string;symbol:string;name:string;shares:number;costBasis:number;entryPrice:number;currentPrice:number;previousPrice:number;marketCap:number;currentValue:number;pnl:number;pnlPct:number;dayPnl:number;dayPct:number;purchasedAt:string}
export type CryptoDepositAddress={id:string;asset:string;network:string;address:string;enabled:boolean;minDeposit:number;confirmationsLabel:string}
export type ManualCryptoGateway={enabled:boolean;primaryAsset:string;paymentWindowMinutes:number;instructions:string;addresses:CryptoDepositAddress[]}
export type FundingMethod={id:'crypto'|'wire'|'paypal';enabled:boolean;label:string;instructions:string;primary:boolean;paypalTag?:string;paymentLink?:string;bankName?:string;beneficiary?:string;accountNumber?:string;swift?:string;routing?:string;bankAddress?:string}
export type TransferRequest={id:string;userId:string;userName:string;direction:'Deposit'|'Withdrawal';method:'crypto'|'wire'|'paypal';asset?:string;network?:string;amount:number;reference:string;destination?:string;depositAddress?:string;expiresAt?:string;status:'Pending'|'Approved'|'Rejected'|'Completed'|'Expired';createdAt:string}
export type HomeOffer={id:string;kicker:string;title:string;body:string;cta:string;href:string}
export type SiteContent={
 eyebrow:string;heroTitle:string;heroAccent:string;heroBody:string;
 objectiveTitle:string;objectiveBody:string;offers:HomeOffer[];
 trustTitle:string;trustBody:string;
 contact:HomepageContactSettings
}

export const initialAccounts:Account[]=[]
export const initialAllocations:ShareAllocation[]=[]
export const initialAdjustments:AccountAdjustment[]=[]
export const initialDailyGain:DailyGainRule={enabled:false,mode:'percent',value:0.25,scope:'managed-only',label:'Managed program accrual'}

export const initialShareControls:ShareControl[]=[
 {symbol:'AAPL',name:'Apple',enabled:true,manualPrice:231.42,previousPrice:229.80,marketCap:3500000000000,allocationCapPct:25,minAmount:100,maxAmount:50000,maxShares:250,approvalRequired:true,assetType:'Stock',description:'Designs and sells consumer electronics, software and services including the iPhone, Mac and App Store.'},
 {symbol:'MSFT',name:'Microsoft',enabled:true,manualPrice:512.18,previousPrice:508.21,marketCap:3800000000000,allocationCapPct:25,minAmount:100,maxAmount:50000,maxShares:200,approvalRequired:true,assetType:'Stock',description:'Global technology company behind Windows, Azure cloud services and Microsoft 365.'},
 {symbol:'NVDA',name:'NVIDIA',enabled:true,manualPrice:179.63,previousPrice:176.88,marketCap:4380000000000,allocationCapPct:25,minAmount:100,maxAmount:50000,maxShares:300,approvalRequired:true,assetType:'Stock',description:'Designs GPUs and accelerated computing platforms powering AI, gaming and data centers.'},
 {symbol:'GOOGL',name:'Alphabet',enabled:true,manualPrice:201.14,previousPrice:199.20,marketCap:2460000000000,allocationCapPct:25,minAmount:100,maxAmount:50000,maxShares:300,approvalRequired:true,assetType:'Stock',description:'Parent company of Google, YouTube and a global digital advertising and cloud business.'},
 {symbol:'AMZN',name:'Amazon',enabled:true,manualPrice:231.30,previousPrice:228.42,marketCap:2450000000000,allocationCapPct:25,minAmount:100,maxAmount:50000,maxShares:300,approvalRequired:true,assetType:'Stock',description:'E-commerce and cloud computing leader operating Amazon.com and Amazon Web Services.'},
 {symbol:'META',name:'Meta Platforms',enabled:true,manualPrice:747.62,previousPrice:738.10,marketCap:1880000000000,allocationCapPct:25,minAmount:100,maxAmount:50000,maxShares:150,approvalRequired:true,assetType:'Stock',description:'Operates Facebook, Instagram and WhatsApp, and invests heavily in AI and the metaverse.'},
 {symbol:'TSLA',name:'Tesla',enabled:true,manualPrice:338.72,previousPrice:331.15,marketCap:1090000000000,allocationCapPct:25,minAmount:100,maxAmount:50000,maxShares:250,approvalRequired:true,assetType:'Stock',description:'Designs and manufactures electric vehicles, energy storage and solar products.'},
 {symbol:'AVGO',name:'Broadcom',enabled:true,manualPrice:306.48,previousPrice:301.92,marketCap:1440000000000,allocationCapPct:25,minAmount:100,maxAmount:50000,maxShares:250,approvalRequired:true,assetType:'Stock',description:'Designs semiconductor and infrastructure software solutions for global technology markets.'},
 {symbol:'JPM',name:'JPMorgan Chase',enabled:true,manualPrice:295.31,previousPrice:292.20,marketCap:812000000000,allocationCapPct:25,minAmount:100,maxAmount:50000,maxShares:250,approvalRequired:true,assetType:'Stock',description:'One of the largest global banks, spanning consumer banking, investment banking and asset management.'},
 {symbol:'V',name:'Visa',enabled:true,manualPrice:352.84,previousPrice:350.25,marketCap:687000000000,allocationCapPct:25,minAmount:100,maxAmount:50000,maxShares:250,approvalRequired:true,assetType:'Stock',description:'Operates one of the world’s largest digital payments and card networks.'},
 {symbol:'MA',name:'Mastercard',enabled:true,manualPrice:589.40,previousPrice:584.60,marketCap:535000000000,allocationCapPct:25,minAmount:100,maxAmount:50000,maxShares:200,approvalRequired:true,assetType:'Stock',description:'Global payments technology company connecting consumers, banks and merchants.'},
 {symbol:'NFLX',name:'Netflix',enabled:true,manualPrice:1240.20,previousPrice:1228.10,marketCap:528000000000,allocationCapPct:20,minAmount:100,maxAmount:50000,maxShares:100,approvalRequired:true,assetType:'Stock',description:'Subscription streaming service offering films, series and original productions worldwide.'},
 {symbol:'AMD',name:'AMD',enabled:true,manualPrice:178.24,previousPrice:175.90,marketCap:289000000000,allocationCapPct:20,minAmount:100,maxAmount:50000,maxShares:300,approvalRequired:true,assetType:'Stock',description:'Designs processors and graphics chips for computing, gaming and data center markets.'},
 {symbol:'COST',name:'Costco',enabled:true,manualPrice:980.35,previousPrice:972.40,marketCap:435000000000,allocationCapPct:20,minAmount:100,maxAmount:50000,maxShares:100,approvalRequired:true,assetType:'Stock',description:'Membership-based warehouse retailer selling groceries and general merchandise in bulk.'},
 {symbol:'SPY',name:'SPDR S&P 500 ETF',enabled:true,manualPrice:649.28,previousPrice:646.17,marketCap:690000000000,allocationCapPct:45,minAmount:100,maxAmount:100000,maxShares:500,approvalRequired:true,assetType:'ETF',category:'U.S. large-cap equities',description:'Tracks the S&P 500 index, offering broad exposure to large U.S. companies.'},
 {symbol:'QQQ',name:'Invesco QQQ',enabled:true,manualPrice:582.14,previousPrice:578.90,marketCap:360000000000,allocationCapPct:35,minAmount:100,maxAmount:100000,maxShares:400,approvalRequired:true,assetType:'ETF',category:'U.S. technology & growth',description:'Tracks the Nasdaq-100 index of leading non-financial companies listed on Nasdaq.'},
 {symbol:'DFAI',name:'Dimensional International Core Equity 2 ETF',enabled:true,manualPrice:34.50,previousPrice:34.20,marketCap:0,allocationCapPct:30,minAmount:100,maxAmount:100000,maxShares:2000,approvalRequired:true,assetType:'ETF',category:'International equities',description:'Actively managed exposure to core international developed-market equities.'},
 {symbol:'VTI',name:'Vanguard Total Stock Market ETF',enabled:true,manualPrice:332.00,previousPrice:329.50,marketCap:0,allocationCapPct:50,minAmount:100,maxAmount:150000,maxShares:1000,approvalRequired:true,assetType:'ETF',category:'Broad U.S. equities',description:'Broad, low-cost exposure to the entire U.S. stock market across all capitalizations.'},
 {symbol:'VOO',name:'Vanguard S&P 500 ETF',enabled:true,manualPrice:595.00,previousPrice:591.50,marketCap:0,allocationCapPct:50,minAmount:100,maxAmount:150000,maxShares:800,approvalRequired:true,assetType:'ETF',category:'U.S. large-cap equities',description:'Low-cost tracking of the S&P 500 index of leading U.S. companies.'},
 {symbol:'IWM',name:'iShares Russell 2000 ETF',enabled:true,manualPrice:238.00,previousPrice:235.80,marketCap:0,allocationCapPct:35,minAmount:100,maxAmount:100000,maxShares:1000,approvalRequired:true,assetType:'ETF',category:'U.S. small-cap equities',description:'Tracks the Russell 2000 index of small-capitalization U.S. companies.'},
 {symbol:'SCHD',name:'Schwab U.S. Dividend Equity ETF',enabled:true,manualPrice:29.00,previousPrice:28.80,marketCap:0,allocationCapPct:40,minAmount:100,maxAmount:100000,maxShares:3000,approvalRequired:true,assetType:'ETF',category:'U.S. dividend equities',description:'Targets U.S. companies with a record of consistently paying dividends.'},
 {symbol:'VXUS',name:'Vanguard Total International Stock ETF',enabled:true,manualPrice:69.00,previousPrice:68.60,marketCap:0,allocationCapPct:40,minAmount:100,maxAmount:100000,maxShares:2000,approvalRequired:true,assetType:'ETF',category:'International equities',description:'Broad exposure to stocks outside the United States, across developed and emerging markets.'},
 {symbol:'DIA',name:'SPDR Dow Jones Industrial Average ETF Trust',enabled:true,manualPrice:455.00,previousPrice:451.90,marketCap:0,allocationCapPct:35,minAmount:100,maxAmount:100000,maxShares:800,approvalRequired:true,assetType:'ETF',category:'U.S. large-cap equities',description:'Tracks the Dow Jones Industrial Average of 30 major U.S. blue-chip companies.'},
]

export const initialSiteContent:SiteContent={
 eyebrow:'A modern capital markets platform',
 heroTitle:'Build wealth with',
 heroAccent:'more clarity.',
 heroBody:'Invest, manage cash and build long-term wealth from one private, beautifully simple workspace.',
 objectiveTitle:'One financial home. Built around your goals.',
 objectiveBody:'Aether combines investing, cash movement, portfolio visibility and human support without turning your financial life into a wall of noise.',
 offers:[
  {id:'invest',kicker:'Investing',title:'Own the companies shaping tomorrow.',body:'Allocate into leading listed companies and ETFs with transparent share quantities, cost basis and portfolio performance.',cta:'Explore markets',href:'/markets'},
  {id:'cash',kicker:'Cash & funding',title:'Move money on your terms.',body:'Crypto-first deposits, international bank transfer and PayPal funding options, with clear status tracking from request to completion.',cta:'See funding',href:'/transfers'},
  {id:'portfolio',kicker:'Portfolio',title:'Know exactly where you stand.',body:'See available cash, invested capital, daily movement, total return and each position in one focused view.',cta:'View portfolio',href:'/portfolio'},
  {id:'support',kicker:'Client service',title:'Human help when it matters.',body:'Built-in live support keeps account, transfer and investment questions connected to your Aether account.',cta:'Get support',href:'/support'}
 ],
 trustTitle:'Designed for a serious financial relationship.',
 trustBody:'Clear controls, visible approvals, account-level records and a quieter interface designed around decisions rather than distraction.',
 contact:{
  heading:'Talk to Aether.',
  description:'Reach our team for account, funding or investment questions. We usually respond within one business day.',
  showAddress:true,showPhone:true,showWhatsapp:true,showEmails:true,showBusinessHours:true
 }
}

export const initialCompanyProfile:CompanyProfile={
 name:'Aether Capital Markets',description:'A modern capital markets platform for investing, cash management and client support.',
 addressLine1:'',addressLine2:'',city:'',country:'',
 supportEmail:'',generalEmail:'',phone:'',whatsapp:'',businessHours:'',registrationNumber:''
}
export const initialSocialLinks:SocialLinks={twitter:'',instagram:'',linkedin:'',facebook:'',whatsappLink:''}

export const initialCryptoGateway:ManualCryptoGateway={enabled:true,primaryAsset:'USDT',paymentWindowMinutes:30,instructions:'Send only the selected asset on the selected network. After payment, submit the transaction hash for manual verification.',addresses:[
 {id:'CR-1',asset:'USDT',network:'TRC20',address:'ADMIN_SET_USDT_TRC20_ADDRESS',enabled:true,minDeposit:50,confirmationsLabel:'Manual verification'},
 {id:'CR-2',asset:'USDT',network:'ERC20',address:'ADMIN_SET_USDT_ERC20_ADDRESS',enabled:false,minDeposit:100,confirmationsLabel:'Manual verification'},
 {id:'CR-3',asset:'USDC',network:'ERC20',address:'ADMIN_SET_USDC_ERC20_ADDRESS',enabled:true,minDeposit:50,confirmationsLabel:'Manual verification'},
 {id:'CR-4',asset:'BTC',network:'Bitcoin',address:'ADMIN_SET_BTC_ADDRESS',enabled:true,minDeposit:100,confirmationsLabel:'Manual verification'}]}
export const initialFundingMethods:FundingMethod[]=[
 {id:'crypto',enabled:true,label:'Crypto',primary:true,instructions:'Manual crypto gateway'},
 {id:'wire',enabled:true,label:'International bank transfer',primary:false,instructions:'Use your Aether account ID as the payment reference. Submit the transfer reference after sending.',bankName:'',beneficiary:'Aether Capital Markets',accountNumber:'',swift:'',routing:'',bankAddress:''},
 {id:'paypal',enabled:true,label:'PayPal',primary:false,instructions:'Send payment using the PayPal details below, then submit the transaction ID for review.',paypalTag:'',paymentLink:''}]
export const initialTransfers:TransferRequest[]=[]
