# Log A Load Minnesota Charity Tickets

Professional local prototype for a Log A Load Minnesota charity ticketing and donation website.

The current public review direction is intentionally simple: one event, Hillman Mud Bog, with clear ticket sales, donation choices, vendor/sponsor interest, rules, and contact paths. The codebase still has a foundation for future events and admin operations, but the public UI should not feel like a messy multi-event dashboard.

## Pages

- Home: straightforward charity/ticket landing page for the Hillman Mud Bog
- Mud Bog: featured event page at `#/mudfest`
- Tickets: Mud Bog v1 order builder with hosted checkout handoff
- Donate: fund-specific donation path
- Vendors: vendors and sponsor interest form
- FAQ: rules, payment safety, contact form, and launch notes
- Success: receipt-style return page for hosted checkout
- Admin: locked public route with a local/demo-only dashboard blueprint for analytics, event edits, exports, ticket inventory, fund setup, and payment configuration

Legacy local links `#/participants`, `#/pullers`, `#/events`, `#/event-day`, and `#/qr-kit` remain handled so old review links do not break, but they are not part of the public navigation.

## Run Locally

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5177
```

Open:

```text
http://127.0.0.1:5177/#/
```

Common routes:

```text
http://127.0.0.1:5177/#/
http://127.0.0.1:5177/#/mudfest
http://127.0.0.1:5177/#/tickets
http://127.0.0.1:5177/#/donate
http://127.0.0.1:5177/#/vendors
http://127.0.0.1:5177/#/faq
http://127.0.0.1:5177/#/admin
```

## Backend V1

Backend V1 is a local Express API for real prototype operations:

- Server-side admin login with `ADMIN_PASSWORD`.
- Events, funds, tickets, payment links, orders, donations, registrations, vendors, contact requests, admin notes, webhooks, email outbox, and audit log.
- Ticket checkout intent creation with capacity checks.
- Donation checkout intent creation with fund selection.
- Payment webhook intake for later PayPal/Stripe reconciliation.
- CSV exports for orders, tickets, funds, vendors, contacts, outbox, and audit.
- Local email notification outbox so admin alerts are visible before a real email provider is connected.

Run the API in one terminal:

```bash
npm run api
```

Run the frontend in another terminal:

```bash
npm run dev -- --host 127.0.0.1 --port 5177
```

Open:

```text
http://127.0.0.1:5177/#/admin
```

Default local admin password:

```text
logaload-admin-preview
```

Set a real local password before sharing admin access:

```bash
ADMIN_PASSWORD="replace-with-real-password" ADMIN_SESSION_SECRET="replace-with-long-random-secret" npm run api
```

Generated local records are stored in:

```text
server/data/local-db.json
```

That file is intentionally ignored by git.

By default, Backend V1 binds to `127.0.0.1`, so it is local-only. Do not change `HOST` to `0.0.0.0` or expose the Mac through router/firewall rules for a public launch. Send reviewers the GitHub Pages URL for the public demo, not a local `127.0.0.1` or LAN URL.

## Payment Setup

Do not collect or hold card data in this app. V1 should redirect to hosted provider checkout links owned by Log A Load Minnesota or the approved fiscal host.

Recommended order:

1. PayPal Payment Links or buttons for v1 tickets and donations.
2. Stripe Payment Links for card payments, richer receipts, and future reporting.
3. Venmo only if it is tied to the proper organization/business setup.

Copy `.env.example` to `.env.local` for local review or set the same values in Vercel/Netlify:

```text
VITE_PAYPAL_TICKETS_URL=
VITE_PAYPAL_DONATE_URL=
VITE_VENMO_PROFILE_URL=
VITE_STRIPE_TICKETS_URL=
VITE_STRIPE_DONATE_URL=
VITE_API_BASE_URL=http://127.0.0.1:8787
VITE_ENABLE_ADMIN_DEMO=false
VITE_ADMIN_DEMO_CODE=
```

These are public hosted checkout URLs, not secret API keys. Do not put PayPal client secrets, Stripe secret keys, webhook signing secrets, or admin passwords in the frontend.

The admin demo variables are only for local review or an intentionally protected demo. Frontend gates are not production authentication.

Helpful official docs:

- PayPal Payment Links and Buttons: https://www.paypal.com/us/business/accept-payments/payment-links
- Stripe Payment Links: https://docs.stripe.com/payments/payment-links
- Vite env variables: https://vite.dev/guide/env-and-mode/

## QR Codes

QR codes are removed from the public review UI based on customer feedback. Static QR SVGs still exist in `public/` as archived/internal assets in case the team wants printed signs later.

Regenerate them after the final domain changes:

```bash
PUBLIC_SITE_URL="https://example.org/" npm run generate:qrs
```

Current generated targets:

- `public/qr-mudfest.svg` -> `https://yahhp.github.io/log-a-load-mn/#/mudfest`
- `public/qr-tickets.svg` -> `https://yahhp.github.io/log-a-load-mn/#/tickets`
- `public/qr-donate.svg` -> `https://yahhp.github.io/log-a-load-mn/#/donate`
- `public/qr-register.svg` -> `https://yahhp.github.io/log-a-load-mn/#/register`
- `public/qr-vendors.svg` -> `https://yahhp.github.io/log-a-load-mn/#/vendors`
- `public/qr-event-day.svg` -> `https://yahhp.github.io/log-a-load-mn/#/event-day`

## Mud Bog Ticket Assumptions

Current prototype pricing is based on relayed notes and must be confirmed before launch:

- General admission: `$15`
- Kids 12 and under: `$5`, with final wording still needed
- Pit pass: `$20`
- Camping: `$40` per camper
- Camping may include one admission pass, but that is not confirmed
- Event content references food trucks, beer garden, camping, pit/action access, and Mud Fest Hillman host content
- Mud Fest host reference: `mudfesthillman.com`
- Mud Fest images/logo are prototype review assets and need permission before production use

## Production Architecture

Keep the public website static and CDN-backed for heavy QR/event traffic.

- Deploy the React/Vite frontend to Vercel, Netlify, or similar static hosting.
- Do not expose the local Mac mini to the public internet.
- Use hosted PayPal/Stripe checkout for tickets and donations.
- Add serverless functions or a small backend for form submissions, admin auth, webhooks, and persistent records.
- Store events, funds, ticket products, registrations, vendors, sponsors, orders, and webhook/payment IDs in a database.
- Send admin email alerts after form submissions and confirmed payments.
- Use CSV export for first event check-in, then add barcode/QR scanning later.
- Use GitHub Pages for a public demo URL only; move to Vercel/Netlify plus auth/backend before giving admins real edit power.
- Ticket availability warnings are modeled in the frontend, but real sold-out protection requires provider limits or a database-backed checkout flow.
- GitHub Pages is fine for early static QR traffic and feedback review. It is not enough for protected admin editing, payment webhooks, real inventory locks, or durable order records.
- Backend V1 now proves the data-backed path locally. Before public launch, move `server/data/local-db.json` to a managed database such as Supabase/Postgres, SQLite on a hosted VM, or another durable store with backups.

See `LAUNCH_CHECKLIST.md` and `SECURITY_NOTES.md` for the launch handoff.

## Customer Info Needed

- Official organization name and Minnesota chapter wording
- Official logo file and approval to use co-brand marks
- Cause/fund destination copy
- Mud Fest date/weekend, address, child pricing wording, camping rules, pit pass policy, refund policy, and weather policy
- Future truck pull/golf event details only if Log A Load wants to expand beyond the Mud Bog after this flow is approved
- Vendor booth pricing, sizes, setup times, restrictions, and insurance wording
- Ticket prices and check-in policy
- Admin recipient emails
- PayPal/Venmo/Stripe ownership decision
- Final photo/video permissions

## QA Notes

Verified on June 2, 2026:

- `npm run lint` passes.
- `npm run build` passes.
- `npm run test:api` passes for Backend V1 checkout, admin, export, and webhook behavior.
- `GITHUB_PAGES=true npm run build` passes for the deployed GitHub Pages base path.
- `npm audit --audit-level=moderate` reports `found 0 vulnerabilities` after applying `npm audit fix`.
- No dangerous frontend sinks or obvious secret strings found in `src`, `public`, `index.html`, `vite.config.js`, or docs.
- Playwright route QA passed 22 desktop/mobile checks across Home, Events, Mud Fest, Tickets, Donate, Register, Vendors, FAQ, Success, Admin, and legacy `#/pullers`.
- Playwright confirmed no horizontal overflow on desktop or 390px mobile viewports.
- V2 route language now treats Log A Load Minnesota as a multi-event hub and makes `Register` the visible event-role signup path.
- Public Admin nav was removed; direct public admin access now shows a locked production handoff instead of exposing the dashboard.
- Ticket availability cards were added for buyer urgency and admin inventory planning.
- Local/dev admin demo gate unlocks with the configured demo code and shows dashboard inventory/export/payment setup surfaces.

Latest screenshot artifacts:

- `launch-home-desktop.png`
- `launch-home-mobile.png`
- `launch-events-desktop.png`
- `launch-register-desktop.png`
- `launch-mudfest-mobile.png`
- `launch-admin-desktop.png`
- `launch-qa-results.json`
