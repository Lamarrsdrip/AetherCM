export const markets = [
  { symbol: 'AAPL', name: 'Apple', price: 231.42, move: 1.84, type: 'Stock' },
  { symbol: 'NVDA', name: 'NVIDIA', price: 179.63, move: 2.11, type: 'Stock' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', price: 649.28, move: 0.46, type: 'ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ', price: 578.31, move: -0.21, type: 'ETF' },
  { symbol: 'BTC', name: 'Bitcoin', price: 118420, move: 1.31, type: 'Crypto' },
  { symbol: 'ETH', name: 'Ethereum', price: 4368.12, move: 0.76, type: 'Crypto' }
]

export const positions = [
  { symbol: 'SPY', name: 'S&P 500 ETF', value: 48240.12, pnl: 4260.31, weight: 39 },
  { symbol: 'NVDA', name: 'NVIDIA', value: 28750.44, pnl: 3152.88, weight: 23 },
  { symbol: 'AAPL', name: 'Apple', value: 19780.16, pnl: 1098.54, weight: 16 },
  { symbol: 'BTC', name: 'Bitcoin', value: 15624.90, pnl: 1820.17, weight: 13 },
  { symbol: 'CASH', name: 'Cash & equivalents', value: 10910.38, pnl: 0, weight: 9 }
]

export const recentActivity = [
  { type: 'Buy', asset: 'NVDA', amount: '$4,850.00', status: 'Completed', when: 'Today · 10:32' },
  { type: 'Deposit', asset: 'Bank transfer', amount: '$12,000.00', status: 'Completed', when: 'Yesterday · 16:18' },
  { type: 'Sell', asset: 'SPY', amount: '$2,210.40', status: 'Completed', when: 'Aug 18 · 09:46' },
  { type: 'Withdrawal', asset: 'Bank transfer', amount: '$1,500.00', status: 'Pending', when: 'Aug 17 · 13:05' }
]

export type AdminState = {
  maintenance: boolean
  registrations: boolean
  withdrawals: boolean
  trading: boolean
  liveChat: boolean
  heroNotice: string
}

export const defaultAdminState: AdminState = {
  maintenance: false,
  registrations: true,
  withdrawals: true,
  trading: true,
  liveChat: true,
  heroNotice: 'Extended-hours trading is available for eligible U.S. equities.'
}
