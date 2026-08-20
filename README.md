# Aether Capital Markets (AetherCM)

A modern, low-noise brokerage/investing web-app prototype built for Vercel.

## Included
- Original marketing homepage (not a Fidelity clone)
- Responsive mobile-first experience
- Client dashboard
- Portfolio and markets views
- Deposits/withdrawals UI
- Live chat widget prototype
- Login/register prototype
- Admin Control Center with platform-wide operational switches, client table and support queue
- Vercel configuration

## Important production boundary
This project is a software prototype. A real brokerage must integrate appropriate regulated broker/custodian/execution providers, KYC/AML, audited authorization, immutable financial ledgers, real market data, banking rails, legal disclosures and jurisdiction-specific licensing. The prototype does not itself provide regulated brokerage or custody.

## Run locally
```bash
cp .env.example .env.local
npm install
npm run dev
```

## Deploy to Vercel
Push to GitHub, import the repository into Vercel, then add the environment variables from `.env.example`.

### Prototype admin login
Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in Vercel. The fallback local values are shown in `.env.example` and should be changed immediately.

## Admin allocation & ledger controls (prototype)

This build adds:
- Admin credit/debit account adjustments with reason/history.
- Configurable automatic daily accrual rule (percent or fixed) for managed/simulated programs.
- Per-share enable/disable, max-share limits, portfolio-cap policy and approval requirement.
- Client share allocation requests from Portfolio.
- Admin approve/reject workflow for allocation requests.

Important: the included demo store is in-memory and can reset between Vercel serverless instances/redeploys. For production, replace `lib/store.ts` with a persistent database and immutable audit ledger. Market P&L should come from executed positions/custodian data; manual credits and scheduled accruals should be separately labelled ledger adjustments.


## v3 prototype workflows
- Amount-based share acquisition: users enter dollars; share count is calculated from the admin-managed quote.
- Admin controls per-asset quote, availability, request min/max, share ceiling, allocation cap and approval requirement.
- Client overview shows overall balance, available balance, approved allocations, pending requests and scheduled daily accruals.
- Funding Center: crypto-first deposit/withdrawal request workflow, plus international wire and PayPal instructions.
- Admin controls funding instructions and approves/rejects transfer requests.
- Admin credits/debits and scheduled gains remain separate auditable ledger events.

### Important production note
This repository is a brokerage-style product prototype. Admin-managed quotes and scheduled gains are explicitly prototype/managed-ledger values, not live exchange prices or independently verified market P&L. For real-money launch, replace the in-memory store with a durable database and connect authorized KYC/AML, market-data, execution/custody, payment and audit providers.


## Default admin login
Email: admin@aethercm.local
Password: AetherAdmin!2026

The current prototype requires no Vercel environment variables. Deploy it normally.
When a production database is added, use DATABASE_URL and provider credentials only.


## Manual inbuilt crypto gateway
AetherCM v6 does not require a crypto payment provider API.

Admin controls:
- enable/disable the crypto gateway
- set the deposit timer in minutes
- set USDT/BTC/USDC deposit addresses by network
- enable/disable individual networks
- set minimum deposits
- edit customer instructions
- approve/reject/complete deposits and withdrawals

User crypto deposit flow:
1. Choose asset/network and amount.
2. Generate timed deposit request.
3. App shows the admin-configured wallet address.
4. Timer counts down.
5. User sends crypto and submits TXID.
6. Admin manually verifies blockchain receipt.
7. Admin completes the request and the internal AetherCM balance is credited.

This is intentionally manual and does not require a crypto gateway API.
For production, persist all settings and requests in DATABASE_URL rather than the current in-memory prototype store.
