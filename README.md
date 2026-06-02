# Log A Load Minnesota Event Hub

Professional local prototype for a Log A Load Minnesota event fundraising website.

The product direction is a multi-event charity hub, not a single truck-pull page. Mud Fest Hillman is the first featured event, and the same structure can support the golf event, truck pull, raffles, dinners, vendor rows, sponsor packages, tickets, donations, and admin tracking.

## Pages

- Home: QR-friendly landing page and cause positioning
- Events: multi-event center for Mud Fest, truck pull, golf, and future fundraisers
- Mud Fest: featured event page at `#/mudfest`
- Tickets: Mud Fest v1 order builder with hosted checkout handoff
- Donate: fund-specific donation path
- Register: event-role signup for volunteers, competitors, golfers, sponsor reps, crew, and future event roles
- Vendors: vendors and sponsor interest form
- FAQ: rules, payment safety, contact form, and launch notes
- Success: receipt-style return page for hosted checkout
- Admin: locked public route with a local/demo-only dashboard blueprint for analytics, event edits, exports, ticket inventory, fund setup, and payment configuration

Legacy local links `#/participants` and `#/pullers` still render the Register page so old review links do not break.

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
http://127.0.0.1:5177/#/events
http://127.0.0.1:5177/#/mudfest
http://127.0.0.1:5177/#/tickets
http://127.0.0.1:5177/#/donate
http://127.0.0.1:5177/#/register
http://127.0.0.1:5177/#/vendors
http://127.0.0.1:5177/#/faq
http://127.0.0.1:5177/#/admin
```

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
VITE_ENABLE_ADMIN_DEMO=false
VITE_ADMIN_DEMO_CODE=
```

These are public hosted checkout URLs, not secret API keys. Do not put PayPal client secrets, Stripe secret keys, webhook signing secrets, or admin passwords in the frontend.

The admin demo variables are only for local review or an intentionally protected demo. Frontend gates are not production authentication.

Helpful official docs:

- PayPal Payment Links and Buttons: https://www.paypal.com/us/business/accept-payments/payment-links
- Stripe Payment Links: https://docs.stripe.com/payments/payment-links
- Vite env variables: https://vite.dev/guide/env-and-mode/

## Mud Fest Ticket Assumptions

Current prototype pricing is based on relayed notes and must be confirmed before launch:

- General admission: `$15`
- Kids 12 and under: `$5`, with final wording still needed
- Pit pass: `$20`
- Camping: `$40` per camper
- Camping may include one admission pass, but that is not confirmed
- Event content references food trucks, beer garden, camping, pit/action access, and Mud Fest host content
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

See `LAUNCH_CHECKLIST.md` and `SECURITY_NOTES.md` for the launch handoff.

## Customer Info Needed

- Official organization name and Minnesota chapter wording
- Official logo file and approval to use co-brand marks
- Cause/fund destination copy
- Mud Fest date/weekend, address, child pricing wording, camping rules, pit pass policy, refund policy, and weather policy
- Future truck pull date, address, classes, entry fee, and rules
- Golf event date, address, team pricing, and sponsor tiers
- Vendor booth pricing, sizes, setup times, restrictions, and insurance wording
- Ticket prices and check-in policy
- Admin recipient emails
- PayPal/Venmo/Stripe ownership decision
- Final photo/video permissions

## QA Notes

Verified on June 2, 2026:

- `npm run lint` passes.
- `npm run build` passes.
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
