# Security Notes

## Current Safe V1 Posture

- The public site is static React/Vite and should be deployed behind Vercel, Netlify, or another CDN-backed static host.
- The Mac mini should stay local-only for review. Do not expose it directly to the open internet.
- Ticket and donation payments redirect to hosted PayPal, Stripe, or Venmo URLs.
- This frontend does not collect card numbers, store payment credentials, or process card data.
- Payment URL env vars are public checkout links only. They are not secrets.
- The public Admin nav is hidden and direct public admin access shows a locked handoff screen.
- Backend V1 uses server-side `ADMIN_PASSWORD` auth and a local JSON datastore for prototype review.

## Frontend Payment Guardrails

The app accepts hosted payment links only when they are `https` URLs from this allowlist:

- `paypal.com`
- `www.paypal.com`
- `www.sandbox.paypal.com`
- `buy.stripe.com`
- `checkout.stripe.com`
- `venmo.com`
- `account.venmo.com`

If a link is not configured or fails validation, the checkout button falls back to the local success preview instead of redirecting.

## Not Production-Secure Yet

- The old frontend-only Admin page was a preview. Backend V1 adds server-side password auth for local review, but final production should use managed auth, stronger roles, and a database.
- `VITE_ENABLE_ADMIN_DEMO` and `VITE_ADMIN_DEMO_CODE` are demo-only frontend switches. They should not be treated as secrets or production protection.
- Backend V1 CSV exports, forms, checkout records, and local email outbox are real local records, but they are stored in `server/data/local-db.json` until a production database is chosen.
- Payment reconciliation has webhook-ready intake, but real launch must verify PayPal/Stripe webhook signatures with provider-specific verification.
- Ticket inventory has server-side capacity checks for local records. Real launch should also use payment-provider limits or database transactions to prevent race-condition oversells.
- Do not add secrets to `.env.local` if the value starts with `sk_`, contains `secret`, or belongs on a server.

## Recommended Production Controls

- Use Vercel/Netlify project environment variables for public hosted links.
- Use server-only environment variables for any future Stripe secret key, PayPal API secret, email provider token, or webhook signing secret.
- Add real auth for admin users before making admin tools editable.
- Require webhook verification for payment events.
- Keep a durable audit trail for admin edits, payment reconciliation, refunds, and CSV exports.
- Keep security headers in `vercel.json` and `netlify.toml` active.
- Do not deploy `server/data/local-db.json` as the long-term source of truth for public paid events. Move to managed persistence with backups before launch.
