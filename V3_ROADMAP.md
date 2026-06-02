# Log A Load MN V3 Roadmap

V3 should turn this from a polished prototype into a launchable event operating system.

## Static V3 Prototype Layer

The frontend prototype now includes the operational surfaces that should exist before a backend is connected:

- Clickable event pages for Mud Fest, Truck Pull, and Golf Classic.
- Official host-site link slots on event pages.
- Event-day mode for receipt, gate, camping/pit, weather/update, and contact help.
- QR print kit for event, tickets, donations, registration, vendors, and event-day mode.
- Money clarity section for receiver, fund, receipt, and payment issue paths.
- Sponsor/vendor directory structure.
- After-event impact report preview with metrics and thank-you wall.

These are static/demo surfaces today. They become production features once connected to real records, auth, payment links, and admin workflows.

## Backend V1 Local Layer

The project now includes a local Backend V1 in `server/`:

- Express API on `http://127.0.0.1:8787`.
- Server-side admin login through `ADMIN_PASSWORD`.
- JSON datastore at `server/data/local-db.json`.
- Public checkout/form records for tickets, donations, registrations, vendors, and contact requests.
- Ticket capacity checks before checkout intent creation.
- Payment-link configuration for hosted PayPal, Stripe, and Venmo handoff.
- Webhook intake that can mark local orders/donations as paid when provider metadata includes the local record id.
- Admin dashboard API, event edits, admin notes, CSV exports, email outbox, and audit log.

This is enough for local customer review and workflow validation. It is not the final production data architecture.

## Product Direction

Log A Load MN is the charity ticketing and donation layer for Minnesota events. It should not replace host event websites. It should make QR-code visitors able to buy, donate, register, sponsor, and get a receipt without confusion.

## V3 Build Priorities

1. Production payments
   - Create organization-owned PayPal business/nonprofit checkout links.
   - Add Stripe Payment Links or Checkout for card backup.
   - Keep Venmo as a mobile-friendly optional path if the org account supports it.
   - Route success and cancel URLs back to this website.

2. Backend records
   - Move the local JSON datastore to a managed database with backups.
   - Store events, ticket types, capacities, orders, donations, funds, registrations, vendors, sponsors, and admin notes.
   - Add payment-provider webhook reconciliation so paid orders and donation records are not just form previews.
   - Prevent oversold ticket classes with real remaining inventory.

3. Admin login
   - Replace local demo code with real auth.
   - Use roles: owner, event admin, check-in staff, vendor coordinator, read-only reviewer.
   - Add audit logs for event edits, price changes, fund changes, and payment-link changes.

4. Event manager
   - Let admins create events without code.
   - Support event-specific tickets, funds, registration roles, rules, photos, videos, sponsors, vendor links, and QR paths.
   - Keep Mud Fest as the first complete event template, then duplicate it for Truck Pull and Golf Classic.

5. Check-in tools
   - Generate order confirmations with a check-in code or QR.
   - Add export views for gate staff, camping, pit pass, vendors, sponsors, and donors.
   - Build a simple mobile check-in surface for staff.

6. Customer-ready content
   - Replace placeholder images with approved event photos and videos.
   - Confirm final Mud Fest pricing, camping inclusion, refund/weather wording, kids ticket wording, and pit pass rules.
   - Add official Log A Load MN contact info, nonprofit/fiscal-host details, and sponsor logos.

## V3 Design Goals

- Mobile-first QR flow: scan, understand event, choose action, complete payment.
- Repeatable multi-event structure: Mud Fest, Truck Pull, Golf Classic, then any new fundraiser.
- Visible trust: hosted checkout, clear fund selection, receipt instructions, and admin reconciliation.
- Admin confidence: counts, exports, statuses, low-ticket warnings, and change controls.
- No messy public admin exposure.

## Suggested V3 Prompt

Take `/Users/ops/log-a-load-mn` from polished prototype to production-ready V3. Build a real data-backed architecture for multi-event Log A Load Minnesota ticketing, donations, registrations, vendors, sponsors, admin auth, payment-link configuration, webhook-ready reconciliation, ticket inventory limits, CSV exports, and mobile check-in planning. Preserve the current visual direction, keep the public UX QR-code simple, make admin protected, and verify desktop/mobile routes with lint, build, and browser QA before committing.
