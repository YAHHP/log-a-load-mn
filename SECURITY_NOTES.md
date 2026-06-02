# Security Notes

## Current Safe V1 Posture

- The public site is static React/Vite and should be deployed behind Vercel, Netlify, or another CDN-backed static host.
- The Mac mini should stay local-only for review. Do not expose it directly to the open internet.
- Ticket and donation payments redirect to hosted PayPal, Stripe, or Venmo URLs.
- This frontend does not collect card numbers, store payment credentials, or process card data.
- Payment URL env vars are public checkout links only. They are not secrets.

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

- The Admin page is a preview. It is not real authentication or authorization.
- The CSV exports currently use demo rows.
- Forms currently show local confirmation UI and need real serverless handlers or backend routes.
- Payment reconciliation needs provider webhooks before final accounting.
- Do not add secrets to `.env.local` if the value starts with `sk_`, contains `secret`, or belongs on a server.

## Recommended Production Controls

- Use Vercel/Netlify project environment variables for public hosted links.
- Use server-only environment variables for any future Stripe secret key, PayPal API secret, email provider token, or webhook signing secret.
- Add real auth for admin users before making admin tools editable.
- Require webhook verification for payment events.
- Keep a durable audit trail for admin edits, payment reconciliation, refunds, and CSV exports.
- Keep security headers in `vercel.json` and `netlify.toml` active.
