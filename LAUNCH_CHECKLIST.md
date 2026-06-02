# Log A Load Minnesota Launch Checklist

## Launch Positioning

- Public product: Log A Load Minnesota event fundraising hub.
- First featured event: Mud Fest Hillman.
- Future pages: truck pull, golf event, raffles, dinners, vendor rows, sponsor pages, and other Minnesota fundraisers.
- QR-code promise: scan, understand the event, buy tickets, choose a fund, register for event roles, or contact vendors/admins quickly.

## Accounts Needed

- Domain account for the final public URL.
- Vercel or Netlify account for static hosting.
- PayPal Business or nonprofit-capable account owned by Log A Load Minnesota or the approved fiscal host.
- Optional Stripe account owned by the same organization/fiscal host.
- Optional Venmo business/charity-safe profile if the organization approves it.
- Admin email inbox or forwarding group for vendor, registration, ticket, donation, and sponsor alerts.

## Payment Link Setup

Create hosted links first, then paste them into deployment environment variables.

- `VITE_PAYPAL_TICKETS_URL`: PayPal ticket checkout link/button destination.
- `VITE_PAYPAL_DONATE_URL`: PayPal donation checkout link/button destination.
- `VITE_VENMO_PROFILE_URL`: Venmo organization/business profile URL, if approved.
- `VITE_STRIPE_TICKETS_URL`: Stripe Payment Link for ticket products, optional v1.
- `VITE_STRIPE_DONATE_URL`: Stripe Payment Link for donation/pay-what-you-want, optional v1.

For PayPal, use official Payment Links or Buttons: https://www.paypal.com/us/business/accept-payments/payment-links

For Stripe, use official Payment Links: https://docs.stripe.com/payments/payment-links

## Deploy Path

Recommended v1 is static hosting, not public Mac hosting.

### Current Demo

- Current public demo host: GitHub Pages.
- This is acceptable for showing the public event website and QR flow.
- It is not the best final host for authenticated admin tools, payment webhooks, or backend ticket inventory.
- GitHub Pages custom domain docs: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

### Vercel

- Import the project from GitHub or run Vercel CLI from the project root.
- Build command: `npm run build`
- Output directory: `dist`
- Add the payment URL env vars in the Vercel project settings.
- Official Vite on Vercel docs: https://vercel.com/docs/frameworks/frontend/vite
- Official Vercel deploy methods: https://vercel.com/docs/deployments/deployment-methods

### Netlify

- Import the project from GitHub or create a manual deploy.
- Build command: `npm run build`
- Publish directory: `dist`
- Add the payment URL env vars in Netlify site settings.
- Official Vite on Netlify docs: https://docs.netlify.com/frameworks/vite/
- Official Netlify deploy overview: https://docs.netlify.com/deploy/deploy-overview/

## Admin V1 Reality Check

The current public Admin route is locked. The dashboard blueprint is available only for local or intentionally enabled demo review, not public editing.

Before real launch, connect:

- Real admin authentication.
- Database tables for events, funds, tickets, orders, registrations, vendors, sponsors, and admin users.
- Form handlers that send email alerts and save records.
- Payment webhooks that reconcile hosted checkout payments.
- CSV exports backed by real data.
- Ticket capacity checks that update from confirmed orders, not static frontend numbers.

Vercel Deployment Protection can protect deployments before a full auth app exists: https://vercel.com/docs/deployment-protection

For Stripe Payment Links, create hosted checkout links and use backend/webhook records for reconciliation: https://docs.stripe.com/payment-links/create

For PayPal Payment Links and Buttons, create the hosted payment link from the organization account: https://www.paypal.com/us/business/accept-payments/payment-links

## Final Copy To Confirm

- Official Log A Load Minnesota chapter wording.
- Which charity funds should appear and what each fund means.
- Mud Fest child ticket wording.
- Whether camping includes one admission pass.
- Refund, weather, cancellation, pit-pass, camping, and safety rules.
- Vendor pricing, sponsor tiers, booth sizes, setup times, and restrictions.
- Event dates, address, parking, gate times, and contact emails.
- Permission to use Mud Fest photos, logo, video, and sponsor assets.

## Launch Gates

- `npm run lint`
- `npm run build`
- Mobile route QA on Home, Events, Mud Fest, Tickets, Donate, Register, Vendors, FAQ, Success, Admin.
- No horizontal overflow on iPhone viewport.
- Payment buttons route to approved PayPal/Stripe/Venmo hosted links.
- Admin route is either hidden/protected or replaced with real auth.
- Security headers are active on the deployed site.
- QR code points to the final event URL.
