import type { ShareControl } from './ops'

const TICKER_DOMAIN:Record<string,string>={
 AAPL:'apple.com', MSFT:'microsoft.com', NVDA:'nvidia.com', GOOGL:'abc.xyz', AMZN:'amazon.com',
 META:'meta.com', TSLA:'tesla.com', AVGO:'broadcom.com', JPM:'jpmorganchase.com', V:'visa.com',
 MA:'mastercard.com', NFLX:'netflix.com', AMD:'amd.com', COST:'costco.com',
 SPY:'ssga.com', DIA:'ssga.com', QQQ:'invesco.com', IWM:'ishares.com',
 SCHD:'schwab.com', VXUS:'vanguard.com', VTI:'vanguard.com', VOO:'vanguard.com',
 DFAI:'dimensional.com',
}

export function resolveLogoUrl(control:Pick<ShareControl,'symbol'|'logoUrl'>):string|null{
 if(control.logoUrl)return control.logoUrl
 const domain=TICKER_DOMAIN[control.symbol]
 if(!domain)return null
 return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
}
