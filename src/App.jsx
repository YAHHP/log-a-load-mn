import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Download,
  Edit3,
  FileText,
  Gauge,
  Globe2,
  HandHeart,
  HeartPulse,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  Mountain,
  PlusCircle,
  ReceiptText,
  Settings2,
  ShieldCheck,
  Store,
  Ticket,
  Tractor,
  Trophy,
  Wallet,
  X,
} from 'lucide-react'
import './App.css'
import { apiExportUrl, apiGet, apiPost, apiPut, getAdminToken, hasApiBase, setAdminToken } from './api'

const routes = [
  { path: '/', label: 'Home' },
  { path: '/tickets', label: 'Tickets' },
  { path: '/donate', label: 'Donate' },
  { path: '/vendors', label: 'Vendors' },
  { path: '/faq', label: 'FAQ' },
]

const events = [
  {
    id: 'mud-fest',
    label: 'Hillman Mud Bog',
    pagePath: '/mudfest',
    date: 'Memorial & Labor Day 2026',
    location: 'Hillman, Minnesota',
    status: 'Registration open',
    goal: '$40,000',
    raised: '$12,640',
    image: 'mud-bogging-commons.jpg',
    visualAlt: 'Off-road vehicle driving through a mud bog',
    icon: Mountain,
    audience: 'Families, truck fans, campers',
    impact: 'Tickets + donations feed the launch charity lane.',
    actionLabel: 'Open Mud Bog page',
    hostUrl: 'https://mudfesthillman.com',
    hostLabel: 'Official Mud Fest site',
    hostNote: 'Host event site for full Mud Fest background.',
    qrImage: 'qr-mudfest.svg',
    eventDayNote: 'Bring hosted payment receipt to gate check-in. Camping, pit pass, and kids-ticket wording still need final approval.',
    reportNote: 'Launch-event report will show tickets sold, donations by fund, sponsor support, and event photos after the Mud Bog.',
    summary: 'Log A Load charity ticketing and donation lane for the Hillman Mud Bog: food, trucks, beer gardens, camping, pits, kids tickets, and fund selection.',
    schedule: ['Gates Friday 8:00 AM', 'Food trucks + vendors', 'Beer garden', 'Camping + pit access'],
  },
  {
    id: 'truck-pull',
    label: 'Truck Pull',
    pagePath: '/events/truck-pull',
    date: 'Future 2026',
    location: 'Minnesota event site TBD',
    status: 'Planning',
    goal: '$50,000',
    raised: '$18,420',
    image: 'truck-pull-commons.jpg',
    visualAlt: 'Truck and tractor pull sled on a pulling track',
    icon: Tractor,
    audience: 'Drivers, crews, sponsors',
    impact: 'A future event template for classes, tickets, vendors, and check-in.',
    actionLabel: 'Open Truck Pull page',
    hostUrl: '',
    hostLabel: 'Official truck pull site pending',
    hostNote: 'Add host website once the Minnesota site/date is approved.',
    qrImage: 'qr-register.svg',
    eventDayNote: 'Future event-day mode should show class check-in, driver queue, safety rules, and rain/weather alerts.',
    reportNote: 'Truck Pull report can show puller count, class entries, pit pass sales, sponsor value, and charity total.',
    summary: 'Event registration, class rules, tickets, vendors, sponsors, and event-day check-in.',
    schedule: ['Vendor row opens', 'Participant check-in', 'Opening ceremony', 'Classes begin'],
  },
  {
    id: 'golf-classic',
    label: 'Golf Classic',
    pagePath: '/events/golf-classic',
    date: 'Future 2026',
    location: 'Northwoods Golf Club',
    status: 'Draft',
    goal: '$25,000',
    raised: '$9,800',
    image: 'golf-fairway-commons.jpg',
    visualAlt: 'Golf course fairway ready for a charity golf outing',
    icon: Trophy,
    audience: 'Teams, hole sponsors, donors',
    impact: 'A clean hub for teams, sponsor tiers, banquet tickets, and raffle funds.',
    actionLabel: 'Open Golf Classic page',
    hostUrl: '',
    hostLabel: 'Official golf page pending',
    hostNote: 'Add course/event page once team pricing and sponsor packages are approved.',
    qrImage: 'qr-register.svg',
    eventDayNote: 'Golf event-day mode should show team check-in, sponsor table notes, raffle/dinner details, and weather updates.',
    reportNote: 'Golf report can show teams, hole sponsors, raffle donations, banquet tickets, and final event impact.',
    summary: 'Teams, hole sponsors, banquet tickets, raffle donations, and sponsor recognition.',
    schedule: ['Team check-in', 'Shotgun start', 'Lunch', 'Awards and raffle'],
  },
]

const funds = [
  { id: 'mud-fest', label: 'Mud Bog Charity Fund', note: 'Ticket proceeds and event donations tied to the Hillman Mud Bog charity lane.' },
  { id: 'cmn', label: 'Children’s Miracle Network', note: 'Route the donor gift toward the core Log A Load children’s hospital mission.' },
  { id: 'local-family', label: 'Local Family Support', note: 'A donor-friendly lane for people who want the gift focused close to home.' },
  { id: 'general', label: 'Where it helps most', note: 'Lets Log A Load direct the gift to the highest-priority fundraiser need.' },
]

const ticketOptions = [
  { id: 'general', amount: 15, capacity: 1500, sold: 842, price: '$15', label: 'General admission', note: 'Mud Bog entry ticket through the Log A Load charity lane.' },
  { id: 'kids', amount: 5, capacity: 500, sold: 188, price: '$5', label: 'Kids 12 and under', note: 'Confirm final wording before launch.' },
  { id: 'pit', amount: 20, capacity: 220, sold: 171, price: '$20', label: 'Pit pass', note: 'Closer access to the action; must follow event safety rules.' },
  { id: 'camping', amount: 40, capacity: 80, sold: 62, price: '$40', label: 'Camping pass', note: 'Per camper. Confirm whether admission is included.' },
]

const adminPreviewEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_ADMIN_DEMO === 'true'
const adminDemoCode = import.meta.env.VITE_ADMIN_DEMO_CODE || 'logaload-preview'

const paymentMethods = [
  { id: 'paypal', label: 'PayPal', note: 'Recommended v1: hosted link or button owned by Log A Load.' },
  { id: 'venmo', label: 'Venmo', note: 'Mobile-friendly add-on if the org account supports it.' },
  { id: 'stripe', label: 'Card / Stripe', note: 'Future-ready card path with hosted Payment Links.' },
]

const paymentLinkHosts = new Set([
  'www.paypal.com',
  'paypal.com',
  'www.sandbox.paypal.com',
  'buy.stripe.com',
  'checkout.stripe.com',
  'venmo.com',
  'account.venmo.com',
])

const paymentEnvKeys = {
  paypalTickets: 'VITE_PAYPAL_TICKETS_URL',
  paypalDonate: 'VITE_PAYPAL_DONATE_URL',
  venmo: 'VITE_VENMO_PROFILE_URL',
  stripeTickets: 'VITE_STRIPE_TICKETS_URL',
  stripeDonate: 'VITE_STRIPE_DONATE_URL',
}

function safeHostedPaymentUrl(rawUrl) {
  if (!rawUrl) return ''
  try {
    const url = new URL(rawUrl)
    if (url.protocol !== 'https:' || !paymentLinkHosts.has(url.hostname)) return ''
    return url.href
  } catch {
    return ''
  }
}

const paymentLinks = {
  paypalTickets: safeHostedPaymentUrl(import.meta.env.VITE_PAYPAL_TICKETS_URL),
  paypalDonate: safeHostedPaymentUrl(import.meta.env.VITE_PAYPAL_DONATE_URL),
  venmo: safeHostedPaymentUrl(import.meta.env.VITE_VENMO_PROFILE_URL),
  stripeTickets: safeHostedPaymentUrl(import.meta.env.VITE_STRIPE_TICKETS_URL),
  stripeDonate: safeHostedPaymentUrl(import.meta.env.VITE_STRIPE_DONATE_URL),
}

function assetPath(filename) {
  return `${import.meta.env.BASE_URL}${filename}`
}

const experienceHighlights = [
  { label: 'Food + beer garden', detail: 'Public-facing event details without sending buyers hunting across sites.' },
  { label: 'Camping passes', detail: 'A separate ticket lane with clear rules once the inclusion policy is confirmed.' },
  { label: 'Pit access', detail: 'Higher-value pass with safety language and check-in visibility for admins.' },
  { label: 'Kids pricing', detail: 'Family-friendly path with final wording held for customer approval.' },
]

const trustSteps = [
  { icon: Ticket, title: '1. Select tickets', copy: 'GA, kids, pit pass, and camping are separated so buyers do not guess.' },
  { icon: HeartPulse, title: '2. Pick the fund', copy: 'Optional donation routing keeps charity intent visible and auditable.' },
  { icon: Wallet, title: '3. Pay with confidence', copy: 'PayPal first for v1, with Venmo and Stripe prepared for growth.' },
  { icon: ReceiptText, title: '4. Admin reconciles', copy: 'Every order can become a check-in row, donor record, and export.' },
]

const homeSignals = [
  { icon: HandHeart, label: 'Charity site', value: 'Log A Load MN', detail: 'A clear place to support the fundraiser and understand the cause.' },
  { icon: Ticket, label: 'Mud Bog tickets', value: 'Buy passes', detail: 'Admission, kids, pit, and camping options stay easy to compare.' },
  { icon: Wallet, label: 'Donation choice', value: 'Pick a fund', detail: 'Donors can choose where the extra gift should be directed.' },
]

const sponsorDirectory = [
  { name: 'Mud Fest Hillman', tier: 'Host event partner', event: 'Hillman Mud Bog', status: 'Featured', url: 'https://mudfesthillman.com', detail: 'Host event website and primary event reference.' },
  { name: 'North Star Logging', tier: 'Hole sponsor', event: 'Golf Classic', status: 'Invoice', url: '', detail: 'Demo sponsor row for golf fundraiser packages.' },
  { name: 'Food truck lane', tier: 'Vendor row', event: 'Hillman Mud Bog', status: 'Open', url: '', detail: 'Public vendor directory can list menu, booth needs, and arrival window.' },
  { name: 'Title Charity Sponsor', tier: '$1,000+ package', event: 'Hillman Mud Bog', status: 'Available', url: '', detail: 'Premium sponsor placement across the event page, charity booth, and thank-you recap.' },
]

const impactReportMetrics = [
  { label: 'Raised so far', value: '$12,640', detail: 'Prototype launch metric until real payment records connect.' },
  { label: 'Tickets modeled', value: '1,263', detail: 'Frontend inventory demo across GA, kids, pit, and camping.' },
  { label: 'Fund lanes', value: '4', detail: 'Mud Bog, CMN, local family support, and general giving.' },
  { label: 'After-event recap', value: 'Ready', detail: 'Photos, sponsor thanks, and final fund totals can publish here.' },
]

const thankYouWall = [
  'Miller Family',
  'Anonymous donor',
  'North Star Logging',
  'Log A Load booth volunteers',
]

const participantOptions = [
  { option: 'Mud Bog volunteer shift', event: 'Hillman Mud Bog', cap: 24, registered: 9, fee: 'Free', status: 'Open', detail: 'Gate help, merch table, donation booth, or setup crew.' },
  { option: 'Camping check-in crew', event: 'Hillman Mud Bog', cap: 8, registered: 3, fee: 'Free', status: 'Open', detail: 'Arrival windows, camper notes, and event-day phone number.' },
  { option: 'Truck puller registration', event: 'Truck Pull', cap: 48, registered: 12, fee: 'TBD', status: 'Planning', detail: 'Driver contact, class, vehicle name, hometown, sponsor, and rules acknowledgement.' },
  { option: 'Golf team / sponsor signup', event: 'Golf Classic', cap: 36, registered: 10, fee: 'TBD', status: 'Draft', detail: 'Team captain, player count, sponsor tier, and dinner/raffle notes.' },
]

const vendors = [
  { name: 'Mud Fest Hillman', type: 'Host event partner', status: 'Featured', url: 'mudfesthillman.com' },
  { name: 'Food truck lane', type: 'Food vendor group', status: 'Open', url: 'Vendor page pending' },
  { name: 'Beer garden sponsor', type: 'Sponsor', status: 'Review', url: 'Sponsor page pending' },
  { name: 'Camping check-in', type: 'Operations', status: 'Setup needed', url: 'Admin workflow pending' },
  { name: 'Log A Load booth', type: 'Charity presence', status: 'Approved', url: 'Donation table' },
]

const sponsorTiers = [
  { name: 'Trail Sponsor', price: '$250', detail: 'Logo on event page, thank-you post, and booth mention.' },
  { name: 'Pit Sponsor', price: '$500', detail: 'Promoted placement near pit pass/ticket areas and vendor list.' },
  { name: 'Title Charity Sponsor', price: '$1,000+', detail: 'Hero placement, event-page recognition, and admin follow-up lane.' },
]

const adminRows = [
  { id: 'LAL-1001', type: 'Tickets', name: 'Miller Family', event: 'Mud Fest', detail: '2 general, 2 kids, camping pass', status: 'Paid', amount: '$95', method: 'PayPal' },
  { id: 'LAL-1002', type: 'Donation', name: 'Anonymous', event: 'Mud Fest', detail: '$250 to Children’s Miracle Network', status: 'Paid', amount: '$250', method: 'PayPal' },
  { id: 'LAL-1003', type: 'Vendor', name: 'Food truck lane', event: 'Mud Fest', detail: 'Needs booth map and arrival window', status: 'Review', amount: '$0', method: 'Form' },
  { id: 'LAL-1004', type: 'Tickets', name: 'Pit Pass Buyer', event: 'Mud Fest', detail: '2 pit passes via PayPal', status: 'Paid', amount: '$40', method: 'PayPal' },
  { id: 'LAL-1005', type: 'Sponsor', name: 'North Star Logging', event: 'Golf Classic', detail: 'Hole sponsor package', status: 'Invoice', amount: '$500', method: 'Invoice' },
]

const mudFestSchedule = [
  { label: 'Gates + camping check-in', detail: 'Friday morning launch window, final public times still need customer approval.' },
  { label: 'Food trucks + vendors', detail: 'Vendor row, sponsor booths, Log A Load donation table, and family area.' },
  { label: 'Beer garden + pit access', detail: 'Pit pass buyers get closer access while safety rules stay visible before purchase.' },
  { label: 'Mud trucks + event action', detail: 'Mud Fest Hillman stays the host event; Log A Load handles charity ticketing and donations.' },
]

const mudFestRules = [
  'All final event times, refund policy, and weather policy must be approved before launch.',
  'Kids 12 and under ticket wording is $5 in the prototype and needs final confirmation.',
  'Camping is listed as $40 per camper; confirm whether one admission pass is included.',
  'Pit pass buyers must follow posted safety boundaries and event staff instructions.',
  'Ticket receipt should be shown at check-in until digital ticket validation is connected.',
]

const faqItems = [
  { question: 'Is this the official Mud Fest site?', answer: 'This is the Log A Load Minnesota charity ticket and donation lane for the Hillman Mud Bog. Mud Fest Hillman can keep its host event site while this page handles charity checkout, donation routing, and admin records.' },
  { question: 'Where does the money go?', answer: 'Ticket proceeds and optional donations are tracked by fund so Log A Load can reconcile Mud Bog proceeds, Children’s Miracle Network giving, local support, and general charity needs.' },
  { question: 'Can I pay with PayPal, Venmo, or card?', answer: 'The v1 plan is PayPal first. Venmo and Stripe/Card are shown as supported/future-ready options and can be connected with hosted links once the organization owns the accounts.' },
  { question: 'Do you store my card number?', answer: 'No. This site should redirect to PayPal or Stripe hosted checkout. Card data stays with the payment provider, not this website.' },
  { question: 'Who do I contact for vendor or sponsor questions?', answer: 'Use the vendor/sponsor form on this site for v1. Production should route those submissions to the approved admin email list.' },
]

const adminSetupSteps = [
  { title: 'Create event', detail: 'Title, date, location, hero copy, photos, videos, and public link.' },
  { title: 'Add tickets', detail: 'Price, inventory notes, legal wording, refund policy, and check-in instructions.' },
  { title: 'Choose funds', detail: 'Mud Bog fund, CMN, local support, and general giving options.' },
  { title: 'Publish links', detail: 'PayPal/Stripe hosted links, vendor form, public event link, and success URL.' },
]

const adminExportData = {
  orders: adminRows.map(({ id, type, name, event, detail, status, amount, method }) => ({ id, type, name, event, detail, status, amount, method })),
  tickets: ticketOptions.map(({ id, label, price, note }) => ({ id, label, price, note, event: 'Hillman Mud Bog' })),
  funds: funds.map(({ id, label, note }) => ({ id, label, note })),
  vendors: vendors.map(({ name, type, status, url }) => ({ name, type, status, url })),
}

const trafficMetrics = [
  { label: 'Visitors today', value: '312', detail: 'Preview analytics placeholder' },
  { label: 'Mobile visitors', value: '81%', detail: 'iPhone-first layout priority' },
  { label: 'Checkout starts', value: '74', detail: 'Ticket and donation intents' },
  { label: 'Admin exports', value: '4', detail: 'Orders, tickets, funds, vendors' },
]

const pageSignals = {
  tickets: [
    { icon: Mountain, label: 'Featured event', value: 'Hillman Mud Bog', detail: 'Tickets, pit passes, kids pricing, and camping.' },
    { icon: ShieldCheck, label: 'Checkout safety', value: 'Hosted payment', detail: 'PayPal first. No card data stored here.' },
    { icon: ReceiptText, label: 'Gate handoff', value: 'Receipt check-in', detail: 'Provider receipt now; digital validation later.' },
  ],
  donate: [
    { icon: BadgeDollarSign, label: 'Fund choice', value: '4 charity lanes', detail: 'Donors can direct intent before payment.' },
    { icon: LockKeyhole, label: 'Payment trust', value: 'Provider hosted', detail: 'PayPal, Venmo, and Stripe links stay external.' },
    { icon: Download, label: 'Admin proof', value: 'Export-ready', detail: 'Fund selection should reconcile to reports.' },
  ],
  register: [
    { icon: ClipboardList, label: 'Role templates', value: 'Volunteer, crew, puller, golfer', detail: 'Every event can define its own signup type.' },
    { icon: Gauge, label: 'Capacity view', value: 'Caps visible', detail: 'Admins can see registered versus available.' },
    { icon: Mail, label: 'Follow-up', value: 'Admin email next', detail: 'Production should route each form by event.' },
  ],
  vendors: [
    { icon: Store, label: 'Partner lanes', value: 'Vendor + sponsor', detail: 'Food, booths, sponsors, and charity stations.' },
    { icon: Globe2, label: 'Outbound pages', value: 'Links supported', detail: 'Real vendor websites can be listed cleanly.' },
    { icon: HandHeart, label: 'Sponsor growth', value: 'Tier packages', detail: 'Simple packages now, invoices later.' },
  ],
  faq: [
    { icon: FileText, label: 'Rules first', value: 'Buyer confidence', detail: 'Pricing, refunds, weather, camping, and pit notes.' },
    { icon: Wallet, label: 'Payment clarity', value: 'No card storage', detail: 'Payment provider handles the sensitive data.' },
    { icon: Mail, label: 'Contact path', value: 'One form', detail: 'Questions become admin follow-up records.' },
  ],
  admin: [
    { icon: LockKeyhole, label: 'Access control', value: 'Auth required', detail: 'Real edit power needs server-side login.' },
    { icon: BarChart3, label: 'Operations view', value: 'Counts + exports', detail: 'Tickets, funds, vendors, donors, and registrations.' },
    { icon: ShieldCheck, label: 'Payment proof', value: 'Webhook-ready', detail: 'Paid records should reconcile to provider reports.' },
  ],
}

const donationPresets = ['$25', '$50', '$100', '$250']

function getEventByPath(path) {
  return events.find((event) => event.pagePath === path)
}

const ticketInventory = ticketOptions.map((ticket) => {
  const remaining = ticket.capacity - ticket.sold
  const percentSold = Math.round((ticket.sold / ticket.capacity) * 100)
  return { ...ticket, remaining, percentSold }
})

function getRoute() {
  const hash = window.location.hash.replace('#', '')
  const normalized = hash.startsWith('/') ? hash : '/'
  return normalized.split('?')[0] || '/'
}

function getSuccessParams() {
  const [, search = ''] = window.location.hash.split('?')
  return new URLSearchParams(search)
}

function getPaymentUrl(flow, paymentMethodId) {
  if (paymentMethodId === 'paypal') return flow === 'donation' ? paymentLinks.paypalDonate : paymentLinks.paypalTickets
  if (paymentMethodId === 'venmo') return paymentLinks.venmo
  if (paymentMethodId === 'stripe') return flow === 'donation' ? paymentLinks.stripeDonate : paymentLinks.stripeTickets
  return ''
}

function getSubmissionEndpoint(type) {
  if (type === 'Event registration') return '/api/registrations'
  if (type === 'Vendor application') return '/api/vendor-applications'
  if (type === 'Contact request') return '/api/contact-requests'
  return ''
}

function formatMoney(amount) {
  return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

function formatCents(cents) {
  return `$${((Number(cents) || 0) / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

function getTicketTotal(ticketQuantities) {
  return ticketOptions.reduce((total, ticket) => total + (ticketQuantities[ticket.id] || 0) * ticket.amount, 0)
}

function getTicketRemaining(ticketId) {
  return ticketInventory.find((ticket) => ticket.id === ticketId)?.remaining ?? 999
}

function getTicketProductClass(ticket, selectedTicket, ticketQuantities) {
  return [
    'ticket-product',
    selectedTicket.id === ticket.id ? 'active' : '',
    (ticketQuantities[ticket.id] || 0) > 0 ? 'selected' : '',
  ].filter(Boolean).join(' ')
}

function exportCsv(filename, rows) {
  if (!rows.length) return
  const columns = Object.keys(rows[0])
  const escapeCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
  const csv = [columns.join(','), ...rows.map((row) => columns.map((column) => escapeCell(row[column])).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  anchor.click()
  URL.revokeObjectURL(url)
}

async function downloadAdminExport(type, token) {
  const response = await fetch(apiExportUrl(type), {
    headers: { authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error(`Could not export ${type}.`)
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `log-a-load-${type}.csv`
  anchor.rel = 'noopener'
  anchor.click()
  URL.revokeObjectURL(url)
}

function App() {
  const [route, setRoute] = useState(getRoute)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [submission, setSubmission] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(events[0])
  const [selectedFund, setSelectedFund] = useState(funds[0])
  const [selectedTicket, setSelectedTicket] = useState(ticketOptions[0])
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0])
  const [ticketQuantities, setTicketQuantities] = useState({ general: 1, kids: 0, pit: 0, camping: 0 })
  const [backendStatus, setBackendStatus] = useState({
    state: hasApiBase() ? 'checking' : 'static',
    message: hasApiBase() ? 'Checking Backend V1...' : 'Static demo mode',
  })
  const routedEvent = getEventByPath(route)

  useEffect(() => {
    const onHashChange = () => {
      setRoute(getRoute())
      setMobileOpen(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (!hasApiBase()) return
    let active = true
    apiGet('/api/health')
      .then((health) => {
        if (!active) return
        setBackendStatus({
          state: 'connected',
          message: `Backend V1 connected - ${health.authMode}`,
        })
      })
      .catch(() => {
        if (!active) return
        setBackendStatus({
          state: 'offline',
          message: 'Backend V1 offline; public pages stay in static fallback mode.',
        })
      })
    return () => {
      active = false
    }
  }, [])

  const metrics = useMemo(
    () => [
      { label: 'Current event', value: 'Mud Bog', detail: 'Hillman fundraiser' },
      { label: 'Ticket types', value: '4', detail: 'Admission, kids, pit, camping' },
      { label: 'Launch goal', value: '$40K', detail: 'Tickets + event donations' },
      { label: 'Checkout plan', value: 'PayPal', detail: 'Hosted payment first' },
    ],
    [],
  )

  function go(path) {
    window.location.hash = path
  }

  async function handleSubmit(event, type) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())
    const name = formData.get('name') || formData.get('business') || 'New submission'
    const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

    try {
      const endpoint = getSubmissionEndpoint(type)
      if (endpoint && hasApiBase()) {
        await apiPost(endpoint, payload)
        setSubmission({ type, name, time, detail: `${type} saved to Backend V1 and queued for admin email review.` })
      } else {
        setSubmission({ type, name, time })
      }
      form.reset()
    } catch (error) {
      setSubmission({ type: `${type} issue`, name, time, detail: error.message })
    }
  }

  function updateTicketQuantity(ticketId, value) {
    const quantity = Math.min(getTicketRemaining(ticketId), Math.max(0, Number(value) || 0))
    setTicketQuantities((current) => ({ ...current, [ticketId]: quantity }))
  }

  async function handleHostedPayment(event, flow, paymentMethod, extraParams = {}) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const name = formData.get('name') || formData.get('business') || 'New visitor'
    setSubmission({
      type: flow === 'donation' ? 'Donation checkout' : 'Ticket checkout',
      name,
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    })

    try {
      if (hasApiBase()) {
        const response = flow === 'donation'
          ? await apiPost('/api/checkout/donations', {
            fundId: selectedFund.id,
            amount: formData.get('amount'),
            note: formData.get('note'),
            paymentMethod: paymentMethod.id,
            donor: {
              name: formData.get('name'),
              email: formData.get('email'),
              phone: formData.get('phone'),
            },
          })
          : await apiPost('/api/checkout/tickets', {
            eventId: 'mud-fest',
            paymentMethod: paymentMethod.id,
            buyer: {
              name: formData.get('name'),
              email: formData.get('email'),
              phone: formData.get('phone'),
            },
            items: Object.entries(ticketQuantities)
              .filter(([, quantity]) => Number(quantity) > 0)
              .map(([ticketId, quantity]) => ({ ticketId, quantity })),
          })

        setSubmission({
          type: flow === 'donation' ? 'Donation checkout' : 'Ticket checkout',
          name,
          time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          detail: `Backend V1 record ${response.record.id} created.`,
        })

        if (response.checkoutUrl) {
          window.location.assign(response.checkoutUrl)
          return
        }
        go(response.successPath)
        return
      }
    } catch (error) {
      setSubmission({
        type: 'Backend checkout issue',
        name,
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        detail: `${error.message} Falling back to local preview.`,
      })
    }

    const hostedUrl = getPaymentUrl(flow, paymentMethod.id)
    if (hostedUrl) {
      window.location.assign(hostedUrl)
      return
    }
    const params = new URLSearchParams({
      flow,
      method: paymentMethod.label,
      preview: 'true',
      ...extraParams,
    })
    go(`/success?${params.toString()}`)
  }

  return (
    <div className="site-shell">
      <Header route={route} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      {submission && <Toast submission={submission} />}
      <main>
        {route === '/' && <HomePage metrics={metrics} go={go} />}
        {route === '/mudfest' && <MudFestPage go={go} />}
        {routedEvent && route !== '/mudfest' && <EventDetailPage event={routedEvent} go={go} />}
        {route === '/events' && <EventsPage selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} go={go} />}
        {route === '/event-day' && <FaqPage handleSubmit={handleSubmit} />}
        {route === '/qr-kit' && <HomePage metrics={metrics} go={go} />}
        {route === '/donate' && <DonatePage selectedFund={selectedFund} setSelectedFund={setSelectedFund} selectedPayment={selectedPayment} setSelectedPayment={setSelectedPayment} handleHostedPayment={handleHostedPayment} />}
        {route === '/tickets' && <TicketsPage selectedTicket={selectedTicket} setSelectedTicket={setSelectedTicket} selectedPayment={selectedPayment} setSelectedPayment={setSelectedPayment} ticketQuantities={ticketQuantities} updateTicketQuantity={updateTicketQuantity} handleHostedPayment={handleHostedPayment} />}
        {(route === '/register' || route === '/participants' || route === '/pullers') && <ParticipantsPage handleSubmit={handleSubmit} />}
        {route === '/vendors' && <VendorsPage handleSubmit={handleSubmit} />}
        {route === '/faq' && <FaqPage handleSubmit={handleSubmit} />}
        {route === '/success' && <SuccessPage go={go} />}
        {route === '/admin' && <AdminPage setSelectedEvent={setSelectedEvent} go={go} handleSubmit={handleSubmit} backendStatus={backendStatus} />}
      </main>
      <Footer />
    </div>
  )
}

function Header({ route, mobileOpen, setMobileOpen }) {
  const activeRoute = route === '/mudfest' || route.startsWith('/events/') || route === '/event-day'
    ? '/'
    : route === '/pullers' || route === '/participants'
      ? '/'
      : route === '/qr-kit'
        ? '/'
        : route

  return (
    <header className="site-header">
      <a className="brand logo-brand" href="#/" aria-label="Log A Load Minnesota home">
        <img src={assetPath('log-a-load-cobrand-logo.avif')} alt="Log A Load for Kids and Children's Miracle Network Hospitals logo" decoding="async" />
        <span>
          <strong>Log A Load MN</strong>
          <small>Charity Tickets</small>
        </span>
      </a>
      <nav className={mobileOpen ? 'nav open' : 'nav'} aria-label="Primary navigation">
        {routes.map((item) => (
          <a className={activeRoute === item.path ? 'active' : ''} href={`#${item.path}`} key={item.path}>
            {item.label}
          </a>
        ))}
      </nav>
      <div className="header-actions">
        <a className="primary-button" href="#/donate">Donate</a>
        <button className="icon-button" type="button" onClick={() => setMobileOpen((value) => !value)} aria-label="Toggle menu">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  )
}

function HomePage({ metrics, go }) {
  const quickActions = [
    { path: '/tickets', icon: Ticket, label: 'Buy Mud Bog tickets', detail: 'Admission, kids, pit, and camping.' },
    { path: '/donate', icon: BadgeDollarSign, label: 'Donate to the cause', detail: 'Choose the charity fund before checkout.' },
    { path: '/vendors', icon: Store, label: 'Vendor or sponsor', detail: 'Food, booth, and sponsor interest.' },
    { path: '/faq', icon: FileText, label: 'Rules and FAQ', detail: 'Pricing notes, payment safety, and event questions.' },
  ]

  return (
    <>
      <section className="hero-section page-hero">
        <div className="hero-media" aria-hidden="true">
          <div className="tree-line" />
          <div className="track-lane" />
          <div className="truck-card"><HandHeart size={22} /><span>Charity tickets + donations</span></div>
        </div>
        <div className="hero-content">
          <div className="eyebrow"><HandHeart size={16} /> Log A Load Minnesota charity fundraiser</div>
          <div className="event-logo-lockup">
            <img src={assetPath('mudfest-logo.png')} alt="Mud Fest Hillman logo" decoding="async" />
            <span>Current event: Hillman Mud Bog</span>
          </div>
          <h1>Buy Mud Bog tickets. Support the cause.</h1>
          <p className="hero-copy">
            This is the Log A Load Minnesota charity ticket and donation page for the Hillman Mud Bog. Buy admission, pit passes, kids tickets, and camping, add a donation if you want, and see where the money is going.
          </p>
          <div className="hero-actions">
            <button className="primary-button large" type="button" onClick={() => go('/tickets')}>Buy Mud Bog tickets <ArrowRight size={18} /></button>
            <button className="secondary-button large" type="button" onClick={() => go('/donate')}>Donate now</button>
            <button className="secondary-button large" type="button" onClick={() => go('/vendors')}>Vendor or sponsor info</button>
          </div>
          <div className="hero-signal-row" aria-label="Home page priorities">
            {homeSignals.map((signal) => {
              const Icon = signal.icon
              return (
                <span key={signal.label}>
                  <Icon size={17} />
                  <strong>{signal.value}</strong>
                  <small>{signal.label}</small>
                </span>
              )
            })}
          </div>
        </div>
        <aside className="hero-panel" aria-label="Event quick actions">
          <img className="hero-panel-photo" src={assetPath('mudfest-2024-event.jpg')} alt="Mud Fest trucks and off-road event preview" decoding="async" />
          <div className="panel-topline">Hillman Mud Bog fundraiser</div>
          <h2>One clean place for tickets, donations, and event questions.</h2>
          <div className="hero-ticket-list" aria-label="Mud Bog ticket options">
            {ticketOptions.map((ticket) => (
              <span key={ticket.id}>
                <strong>{ticket.price}</strong>
                <small>{ticket.label}</small>
              </span>
            ))}
          </div>
          <div className="quick-grid">
            <a href="#/tickets"><Ticket size={17} /> Buy tickets</a>
            <a href="#/donate"><BadgeDollarSign size={17} /> Donate</a>
            <a href="#/vendors"><Store size={17} /> Vendors</a>
            <a href="#/faq"><FileText size={17} /> Rules</a>
          </div>
        </aside>
      </section>

      <section className="metrics-band" aria-label="Fundraising metrics">
        {metrics.map((metric) => (
          <div className="metric" key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
            <small>{metric.detail}</small>
          </div>
        ))}
      </section>

      <section className="home-action-strip" aria-label="Visitor quick actions">
        <div>
          <div className="section-kicker"><ArrowRight size={16} /> Fast lane</div>
          <h2>Most visitors only need one of these paths.</h2>
        </div>
        <div className="scan-actions">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button type="button" onClick={() => go(action.path)} key={action.label}>
                <Icon size={22} />
                <span><strong>{action.label}</strong><small>{action.detail}</small></span>
              </button>
            )
          })}
        </div>
      </section>

      <MudFestExperience go={go} />
      <TicketInventoryStrip />
      <TrustFlow />
      <ImpactLedger go={go} />
    </>
  )
}

function MudFestExperience({ go }) {
  return (
    <section className="mudfest-showcase">
      <div className="showcase-copy">
        <div className="section-kicker"><Mountain size={16} /> Featured event</div>
        <h2>The Mud Bog gets the energy. Log A Load makes the giving simple.</h2>
        <p>
          The host event can keep its own site. This page gives sponsors, families, and ticket buyers the simple charity purchase path:
          tickets, optional fund selection, payment, receipt, and admin tracking.
        </p>
        <div className="hero-actions">
          <button className="primary-button large" type="button" onClick={() => go('/tickets')}>Start ticket order</button>
          <button className="secondary-button large" type="button" onClick={() => go('/donate')}>Choose donation fund</button>
        </div>
      </div>
      <div className="showcase-board" aria-label="Mud Bog highlights">
        <div className="mud-track" />
        <img className="showcase-photo main-photo" src={assetPath('mudfest-2024.jpg')} alt="Mud Fest off-road event crowd and vehicles" loading="lazy" decoding="async" />
        <img className="showcase-photo side-photo" src={assetPath('mudfest-2024-event.jpg')} alt="Mud Fest event action preview" loading="lazy" decoding="async" />
        {experienceHighlights.map((item) => (
          <div className="showcase-tile" key={item.label}>
            <strong>{item.label}</strong>
            <span>{item.detail}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function MudFestPage({ go }) {
  return (
    <>
      <PageIntro
        kicker="Mud Fest Hillman"
        icon={Mountain}
        title="The Mud Bog charity lane is ready for tickets, funds, and event updates."
        copy="Mud Fest Hillman keeps the event energy. Log A Load Minnesota gets a professional path for admission, pit passes, camping, donations, sponsor visibility, and admin records."
      />
      <section className="event-brief">
        <div className="brief-media">
          <img src={assetPath('mudfest-2024.jpg')} alt="Mud Fest vehicle moving through mud in front of event crowd" loading="lazy" decoding="async" />
          <div className="brief-badges">
            <span><CalendarDays size={16} /> Memorial & Labor Day 2026</span>
            <span><MapPin size={16} /> Hillman, Minnesota</span>
            <span><HandHeart size={16} /> Log A Load charity ticket lane</span>
          </div>
        </div>
        <div className="brief-copy">
          <div className="section-kicker"><Ticket size={16} /> Launch event</div>
          <h2>Everything a visitor needs before buying or donating.</h2>
          <p>
            Buyers should not need to hunt around for price notes, payment choices, rules, or where the money goes. This page makes the Mud Bog path obvious:
            buy tickets, add a donation, understand the cause, and know what still needs final confirmation before public launch.
          </p>
          <div className="hero-actions">
            <button className="primary-button large" type="button" onClick={() => go('/tickets')}>Buy Mud Bog tickets</button>
            <button className="secondary-button large" type="button" onClick={() => go('/donate')}>Donate to a fund</button>
            <button className="secondary-button large" type="button" onClick={() => go('/faq')}>Rules + contact</button>
          </div>
          <EventActionPanel event={events[0]} go={go} compact />
        </div>
      </section>

      <section className="schedule-section">
        <div>
          <div className="section-kicker"><CalendarDays size={16} /> Event flow</div>
          <h2>Mud Bog highlights, ticketed through the charity page.</h2>
        </div>
        <div className="schedule-grid">
          {mudFestSchedule.map((item) => (
            <div className="schedule-card" key={item.label}>
              <strong>{item.label}</strong>
              <span>{item.detail}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rules-section">
        <div className="rules-panel">
          <div className="section-kicker"><ShieldCheck size={16} /> General rules</div>
          <h2>Clear rules before checkout protects buyers and admins.</h2>
          <div className="rule-list">
            {mudFestRules.map((rule) => <span key={rule}><CheckCircle2 size={17} /> {rule}</span>)}
          </div>
        </div>
        <div className="video-panel">
          <div className="section-kicker"><FileText size={16} /> Video slots</div>
          <h2>Ready for event videos.</h2>
          <p>Drop in approved Mud Fest clips or sponsor reels later. For v1, keep videos hosted on YouTube/Vimeo and embed only after permission is clear.</p>
          <div className="video-slots">
            <span>Hero recap</span>
            <span>Safety/rules</span>
            <span>Sponsor thank-you</span>
          </div>
        </div>
      </section>
      <MoneyClaritySection />
      <SponsorDirectory />
      <ImpactReportSection event={events[0]} />
    </>
  )
}

function TicketInventoryStrip() {
  return (
    <section className="inventory-strip" aria-label="Mud Bog ticket availability">
      <div>
        <div className="section-kicker"><Ticket size={16} /> Ticket availability</div>
        <h2>Show buyers what is still available before they wait in line.</h2>
      </div>
      <div className="inventory-grid">
        {ticketInventory.map((ticket) => (
          <div className={ticket.remaining <= 25 ? 'inventory-card low' : 'inventory-card'} key={ticket.id}>
            <span>{ticket.label}</span>
            <strong>{ticket.remaining} left</strong>
            <div className="inventory-bar" aria-label={`${ticket.percentSold}% sold`}>
              <i style={{ width: `${ticket.percentSold}%` }} />
            </div>
            <small>{ticket.sold}/{ticket.capacity} sold</small>
          </div>
        ))}
      </div>
    </section>
  )
}

function TrustFlow() {
  return (
    <section className="trust-flow">
      <div className="section-kicker"><LockKeyhole size={16} /> Checkout clarity</div>
      <h2>Make every dollar explain itself.</h2>
      <div className="trust-steps">
        {trustSteps.map((step) => {
          const Icon = step.icon
          return (
            <div className="trust-step" key={step.title}>
              <Icon size={22} />
              <strong>{step.title}</strong>
              <p>{step.copy}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function ImpactLedger({ go }) {
  return (
    <section className="impact-ledger">
      <div>
        <div className="section-kicker"><BadgeDollarSign size={16} /> Fund transparency</div>
        <h2>Donors can choose the cause. Admins can prove where it went.</h2>
        <p>
          This is the part that makes the site feel trustworthy: funds are explicit, checkout is hosted, and the admin side keeps a record for receipts,
          exports, and reconciliation.
        </p>
      </div>
      <div className="ledger-card">
        {funds.map((fund, index) => (
          <button type="button" onClick={() => go('/donate')} key={fund.id}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{fund.label}</strong>
            <small>{fund.note}</small>
          </button>
        ))}
      </div>
    </section>
  )
}

function EventsPage({ selectedEvent, setSelectedEvent, go }) {
  return (
    <>
      <PageIntro kicker="Current event" icon={CalendarDays} title="Hillman Mud Bog tickets and charity details." copy="For now, Log A Load Minnesota is focused on this one fundraiser. Future events can be added once the Mud Bog flow is approved." />
      <section className="page-grid">
        <div className="event-list">
          {[events[0]].map((event) => (
            <button className={selectedEvent.id === event.id ? 'event-card active' : 'event-card'} key={event.id} type="button" onClick={() => setSelectedEvent(event)}>
              <EventVisual event={event} compact />
              <span>{event.status}</span>
              <strong>{event.label}</strong>
              <small><CalendarDays size={14} /> {event.date}</small>
              <small><MapPin size={14} /> {event.location}</small>
              <small><UsersLabel event={event} /></small>
              <p>{event.summary}</p>
            </button>
          ))}
        </div>
        <div className="event-detail-panel">
          <EventVisual event={selectedEvent} />
          <div className="event-detail-copy">
            <div className="section-kicker"><Trophy size={16} /> Selected event</div>
            <h2>{selectedEvent.label}</h2>
            <p>{selectedEvent.summary}</p>
          </div>
          <div className="event-impact-note">
            <strong>{selectedEvent.audience}</strong>
            <span>{selectedEvent.impact}</span>
          </div>
          <div className="event-stats">
            <span><strong>{selectedEvent.goal}</strong> goal</span>
            <span><strong>{selectedEvent.raised}</strong> raised</span>
            <span><strong>{selectedEvent.status}</strong> status</span>
          </div>
          <div className="event-timeline compact-timeline">
            {selectedEvent.schedule.map((item) => {
              const [time, ...rest] = item.split(' ')
              return <div key={item}><strong>{time}</strong><span>{rest.join(' ')}</span></div>
            })}
          </div>
          <EventActionPanel event={selectedEvent} go={go} compact />
          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={() => go(selectedEvent.pagePath)}>{selectedEvent.actionLabel}</button>
            <button className="secondary-button" type="button" onClick={() => go('/tickets')}>Tickets</button>
            <button className="secondary-button" type="button" onClick={() => go('/donate')}>Donate to this event</button>
          </div>
        </div>
      </section>
    </>
  )
}

function UsersLabel({ event }) {
  return (
    <>
      <ClipboardList size={14} /> {event.audience}
    </>
  )
}

function PageSignalBand({ items }) {
  return (
    <section className="page-signal-band" aria-label="Page status and next steps">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div className="page-signal" key={item.label}>
            <Icon size={18} />
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.detail}</small>
          </div>
        )
      })}
    </section>
  )
}

function VendorUrl({ url }) {
  const isExternal = url.includes('.') && !url.toLowerCase().includes('pending')
  if (!isExternal) return <small>{url}</small>

  const href = url.startsWith('http') ? url : `https://${url}`
  return <a className="vendor-link" href={href} target="_blank" rel="noreferrer">{url}</a>
}

function EventVisual({ event, compact = false }) {
  const Icon = event.icon || CalendarDays
  if (event.image) {
    return (
      <div className={compact ? 'event-visual compact' : 'event-visual'}>
        <img src={assetPath(event.image)} alt={event.visualAlt || event.label} loading="lazy" decoding="async" />
        <span><Icon size={16} /> {event.label}</span>
      </div>
    )
  }

  return (
    <div className={compact ? `event-visual event-art ${event.visual || ''} compact` : `event-visual event-art ${event.visual || ''}`}>
      <div className="event-art-mark"><Icon size={compact ? 26 : 42} /></div>
      <span><Icon size={16} /> {event.label}</span>
      <i aria-hidden="true" />
    </div>
  )
}

function HostSiteAction({ event }) {
  if (!event.hostUrl) {
    return (
      <span className="host-link pending">
        <Globe2 size={17} />
        <strong>{event.hostLabel}</strong>
        <small>{event.hostNote}</small>
      </span>
    )
  }

  return (
    <a className="host-link" href={event.hostUrl} target="_blank" rel="noreferrer">
      <Globe2 size={17} />
      <strong>{event.hostLabel}</strong>
      <small>{event.hostNote}</small>
    </a>
  )
}

function EventActionPanel({ event, go, compact = false }) {
  return (
    <div className={compact ? 'event-action-panel compact' : 'event-action-panel'}>
      <HostSiteAction event={event} />
      <button type="button" onClick={() => go('/tickets')}><Ticket size={17} /><span>Tickets</span></button>
      <button type="button" onClick={() => go('/donate')}><BadgeDollarSign size={17} /><span>Donate</span></button>
      <button type="button" onClick={() => go('/vendors')}><Store size={17} /><span>Vendors</span></button>
      <button type="button" onClick={() => go('/faq')}><FileText size={17} /><span>Rules / FAQ</span></button>
    </div>
  )
}

function EventDetailPage({ event, go }) {
  const Icon = event.icon || CalendarDays
  return (
    <>
      <PageIntro
        kicker="Event page"
        icon={Icon}
        title={`${event.label} charity command page.`}
        copy={`${event.summary} This page shows the exact V3 structure each Minnesota fundraiser can receive: host links, tickets, donations, registration, sponsors, event-day instructions, and after-event impact.`}
      />
      <section className="event-command-page">
        <div className="event-command-media">
          <EventVisual event={event} />
        </div>
        <div className="event-command-copy">
          <div className="section-kicker"><LayoutDashboard size={16} /> Event command center</div>
          <h2>{event.label}</h2>
          <p>{event.impact}</p>
          <div className="event-stats">
            <span><strong>{event.goal}</strong> goal</span>
            <span><strong>{event.raised}</strong> raised</span>
            <span><strong>{event.status}</strong> status</span>
          </div>
          <EventActionPanel event={event} go={go} />
        </div>
      </section>
      <section className="schedule-section">
        <div>
          <div className="section-kicker"><CalendarDays size={16} /> Event flow</div>
          <h2>Draft schedule and operating lanes.</h2>
          <p>{event.eventDayNote}</p>
        </div>
        <div className="schedule-grid">
          {event.schedule.map((item) => (
            <div className="schedule-card" key={item}>
              <strong>{item}</strong>
              <span>Admin can replace this with event-specific timing, owner, rule notes, and check-in instructions.</span>
            </div>
          ))}
        </div>
      </section>
      <SponsorDirectory />
      <ImpactReportSection event={event} />
    </>
  )
}

function MoneyClaritySection() {
  return (
    <section className="money-clarity-section">
      <div>
        <div className="section-kicker"><ShieldCheck size={16} /> Money clarity</div>
        <h2>Trust is the product.</h2>
        <p>Before this takes real money, visitors need clear fund ownership, hosted payment receipts, refund/weather wording, and a payment-problem contact path.</p>
      </div>
      <div className="money-clarity-grid">
        <span><strong>Receiver</strong>Log A Load Minnesota or the approved fiscal host owns payment accounts.</span>
        <span><strong>Fund selected</strong>Donors choose Mud Bog, CMN, local support, or where it helps most.</span>
        <span><strong>Receipt</strong>PayPal or Stripe sends the payment receipt; this site returns a confirmation page.</span>
        <span><strong>Issue path</strong>FAQ/contact form routes buyer, vendor, camping, pit pass, and payment questions.</span>
      </div>
    </section>
  )
}

function SponsorDirectory() {
  return (
    <section className="sponsor-directory">
      <div>
        <div className="section-kicker"><Store size={16} /> Sponsor + vendor directory</div>
        <h2>Make partners feel worth clicking.</h2>
        <p>Sponsors and vendors should not look like footnotes. Give them tier, event, status, website, and a short reason people should care.</p>
      </div>
      <div className="sponsor-directory-grid">
        {sponsorDirectory.map((sponsor) => (
          <div className="sponsor-directory-card" key={sponsor.name}>
            <span>{sponsor.status}</span>
            <strong>{sponsor.name}</strong>
            <small>{sponsor.tier} - {sponsor.event}</small>
            <p>{sponsor.detail}</p>
            {sponsor.url ? <a href={sponsor.url} target="_blank" rel="noreferrer">Visit website</a> : <em>Website pending</em>}
          </div>
        ))}
      </div>
    </section>
  )
}

function ImpactReportSection({ event = events[0] }) {
  return (
    <section className="impact-report-section">
      <div>
        <div className="section-kicker"><HeartPulse size={16} /> After-event impact</div>
        <h2>Turn every fundraiser into proof for the next one.</h2>
        <p>{event.reportNote}</p>
      </div>
      <div className="impact-report-grid">
        {impactReportMetrics.map((metric) => (
          <span key={metric.label}><strong>{metric.value}</strong>{metric.label}<small>{metric.detail}</small></span>
        ))}
      </div>
      <div className="thank-you-wall">
        <strong>Thank-you wall preview</strong>
        {thankYouWall.map((name) => <span key={name}>{name}</span>)}
      </div>
    </section>
  )
}

function DonatePage({ selectedFund, setSelectedFund, selectedPayment, setSelectedPayment, handleHostedPayment }) {
  const [donationAmount, setDonationAmount] = useState('$100')

  return (
    <>
      <PageIntro kicker="Donations" icon={BadgeDollarSign} title="Let donors choose the exact charity lane." copy="Mud Bog ticket money can feed the event charity pool, while extra gifts can go to Children’s Miracle Network, local family support, or wherever Log A Load needs it most." />
      <PageSignalBand items={pageSignals.donate} />
      <section className="form-page-grid">
        <div className="fund-grid tall">
          {funds.map((fund) => (
            <button className={selectedFund.id === fund.id ? 'fund selected' : 'fund'} type="button" key={fund.id} onClick={() => setSelectedFund(fund)}>
              <strong>{fund.label}</strong>
              <small>{fund.note}</small>
            </button>
          ))}
          <div className="payment-status-panel">
            <div className="section-kicker"><LockKeyhole size={16} /> Hosted payment</div>
            <h3>No card data touches this site.</h3>
            <p>PayPal is the v1 path. Stripe/Card and Venmo can be connected with hosted links once the organization owns the accounts.</p>
          </div>
        </div>
        <form className="form-card" onSubmit={(event) => handleHostedPayment(event, 'donation', selectedPayment, { fund: selectedFund.label })}>
          <h2>{selectedFund.label}</h2>
          <p>{selectedFund.note}</p>
          <div className="checkout-steps" aria-label="Donation checkout steps">
            <span>1 Fund</span>
            <span>2 Donor info</span>
            <span>3 Hosted payment</span>
          </div>
          <div className="amount-presets" aria-label="Quick donation amounts">
            {donationPresets.map((amount) => (
              <button className={donationAmount === amount ? 'selected' : ''} type="button" key={amount} onClick={() => setDonationAmount(amount)}>{amount}</button>
            ))}
          </div>
          <label>Selected fund<input name="fund" value={selectedFund.label} readOnly /></label>
          <label>Donation amount<input name="amount" value={donationAmount} inputMode="decimal" onChange={(event) => setDonationAmount(event.target.value)} /></label>
          <label>Donor name<input name="name" placeholder="Name or company" required /></label>
          <div className="two-col">
            <label>Email<input name="email" type="email" placeholder="you@example.com" required /></label>
            <label>Phone<input name="phone" type="tel" placeholder="(555) 000-0000" /></label>
          </div>
          <label>Dedication or note<textarea name="note" placeholder="Optional: in honor of, company note, event note, or receipt memo" /></label>
          <div className="payment-method-grid" aria-label="Payment method options">
            {paymentMethods.map((method) => (
              <button className={selectedPayment.id === method.id ? 'payment-method selected' : 'payment-method'} type="button" key={method.id} onClick={() => setSelectedPayment(method)}>
                <CreditCard size={18} />
                <strong>{method.label}</strong>
                <small>{method.note}</small>
              </button>
            ))}
          </div>
          <button className="primary-button full" type="submit">Continue with {selectedPayment.label}</button>
        </form>
      </section>
      <MoneyClaritySection />
    </>
  )
}

function TicketsPage({ selectedTicket, setSelectedTicket, selectedPayment, setSelectedPayment, ticketQuantities, updateTicketQuantity, handleHostedPayment }) {
  const ticketTotal = getTicketTotal(ticketQuantities)
  const selectedItems = ticketOptions.filter((ticket) => (ticketQuantities[ticket.id] || 0) > 0)

  return (
    <>
      <PageIntro kicker="Mud Bog tickets" icon={Ticket} title="Build a Hillman Mud Bog order and send it to hosted checkout." copy="General admission, kids tickets, pit passes, and camping are separated with final wording notes. PayPal is the v1 checkout path; Stripe and Venmo can be connected without storing card data here." />
      <PageSignalBand items={pageSignals.tickets} />
      <section className="tickets-page">
        <div className="ticket-stack">
          <div className="ticket-product-grid">
            {ticketInventory.map((ticket) => (
              <div className={getTicketProductClass(ticket, selectedTicket, ticketQuantities)} key={ticket.id} onClick={() => setSelectedTicket(ticket)} onFocusCapture={() => setSelectedTicket(ticket)}>
                <button type="button" aria-pressed={selectedTicket.id === ticket.id} onClick={() => setSelectedTicket(ticket)}>
                  <strong>{ticket.price}</strong>
                  <span>{ticket.label}</span>
                  <small>{ticket.note}</small>
                  <em>{ticket.remaining <= 25 ? `Only ${ticket.remaining} left` : `${ticket.remaining} available`}</em>
                </button>
                <label>Quantity<input name={`${ticket.id}-quantity`} type="number" min="0" max={ticket.remaining} inputMode="numeric" value={ticketQuantities[ticket.id] || 0} onChange={(event) => updateTicketQuantity(ticket.id, event.target.value)} /></label>
              </div>
            ))}
          </div>
          <div className="ticket-cap-note">
            <ShieldCheck size={18} />
            <span>Availability is a launch model right now. Real sold-out protection needs provider inventory limits or a database-backed checkout before taking money.</span>
          </div>
          <div className="event-vibe-card">
            <div><Mountain size={22} /><strong>Hillman Mud Bog</strong></div>
            <span>Food trucks</span>
            <span>Beer garden</span>
            <span>Camping</span>
            <span>Truck action</span>
            <small>Details based on notes plus public Mud Fest Hillman event framing. Prices marked uncertain should be confirmed before launch.</small>
          </div>
        </div>
        <form className="form-card ticket-checkout" onSubmit={(event) => handleHostedPayment(event, 'tickets', selectedPayment, { total: formatMoney(ticketTotal) })}>
          <h2>Order summary</h2>
          <p>{selectedTicket.label}: {selectedTicket.note}</p>
          <div className="checkout-steps" aria-label="Ticket checkout steps">
            <span>1 Tickets</span>
            <span>2 Buyer info</span>
            <span>3 Hosted payment</span>
          </div>
          <div className="order-summary" aria-label="Selected ticket order">
            {selectedItems.length === 0 && <span>No tickets selected yet.</span>}
            {selectedItems.map((ticket) => (
              <span key={ticket.id}>
                <strong>{ticket.label}</strong>
                <small>{ticketQuantities[ticket.id]} x {ticket.price}</small>
              </span>
            ))}
            <em>Total {formatMoney(ticketTotal)}</em>
          </div>
          <label>Event<input name="event" value="Hillman Mud Bog" readOnly /></label>
          <div className="payment-method-grid" aria-label="Payment method options">
            {paymentMethods.map((method) => (
              <button className={selectedPayment.id === method.id ? 'payment-method selected' : 'payment-method'} type="button" key={method.id} onClick={() => setSelectedPayment(method)}>
                <CreditCard size={18} />
                <strong>{method.label}</strong>
                <small>{method.note}</small>
              </button>
            ))}
          </div>
          <label>Payment method<input name="payment" value={selectedPayment.label} readOnly /></label>
          <label>Buyer name<input name="name" placeholder="Buyer name" required /></label>
          <label>Email receipt<input name="email" type="email" placeholder="buyer@example.com" required /></label>
          <button className="primary-button full" type="submit" disabled={ticketTotal <= 0}>Continue with {selectedPayment.label}</button>
          <small className="form-note">If hosted payment links are not configured yet, this button opens the local confirmation preview.</small>
        </form>
      </section>
      <MoneyClaritySection />
    </>
  )
}

function ParticipantsPage({ handleSubmit }) {
  return (
    <>
      <PageIntro kicker="Event registration" icon={ClipboardList} title="One signup lane for every event role." copy="Each event can define what registration means: volunteer, competitor, golfer, camping helper, sponsor rep, raffle donor, or day-of operations crew." />
      <PageSignalBand items={pageSignals.register} />
      <section className="page-grid">
        <div className="class-table">
          <div className="rules-box">
            <h3>Built for more than truck pulls</h3>
            <span><CheckCircle2 size={15} /> Event-specific roles, fees, capacity, and status</span>
            <span><CheckCircle2 size={15} /> Contact details for admin email alerts and check-in exports</span>
            <span><CheckCircle2 size={15} /> Rules, notes, waivers, or vehicle/team details by event type</span>
          </div>
          {participantOptions.map((item) => (
            <div className="class-row participant-row" key={`${item.event}-${item.option}`}>
              <strong>{item.event}</strong>
              <span>{item.option}</span>
              <span>{item.registered}/{item.cap} registered</span>
              <span>{item.fee}</span>
              <em>{item.status}</em>
              <small>{item.detail}</small>
            </div>
          ))}
        </div>
        <form className="form-card" onSubmit={(event) => handleSubmit(event, 'Event registration')}>
          <h2>Sign up for an event</h2>
          <label>Full name<input name="name" placeholder="Registrant full name" required /></label>
          <div className="two-col">
            <label>Phone<input name="phone" type="tel" placeholder="(555) 000-0000" required /></label>
            <label>Email<input name="email" type="email" placeholder="you@example.com" required /></label>
          </div>
          <div className="two-col">
            <label>Event<select name="event" defaultValue="Hillman Mud Bog">{[events[0]].map((event) => <option key={event.id}>{event.label}</option>)}</select></label>
            <label>Signup type<select name="signupType" defaultValue={participantOptions[0].option}>{participantOptions.map((item) => <option key={item.option}>{item.option}</option>)}</select></label>
          </div>
          <div className="two-col">
            <label>Team, vehicle, or company<input name="group" placeholder="Optional" /></label>
            <label>City / hometown<input name="city" placeholder="Optional" /></label>
          </div>
          <label>Notes for admins<textarea name="notes" placeholder="Shift preference, class info, sponsor notes, accessibility needs, or questions" /></label>
          <label className="check-field"><input name="acknowledgement" type="checkbox" required /> I understand the event team will confirm final role details, rules, fees, and check-in instructions before the event.</label>
          <button className="primary-button full" type="submit">Submit event registration</button>
        </form>
      </section>
    </>
  )
}

function VendorsPage({ handleSubmit }) {
  return (
    <>
      <PageIntro kicker="Vendors + sponsors" icon={Store} title="Give every Mud Bog partner a clean public lane." copy="Food vendors, beer garden sponsors, camping operations, Log A Load booths, and sponsor packages all need a clean form, clear status, and admin follow-up path." />
      <PageSignalBand items={pageSignals.vendors} />
      <section className="page-grid">
        <div className="vendor-page-stack">
          <div className="vendor-list rich-list">
            {vendors.map((vendor) => (
              <div className="vendor-row" key={vendor.name}>
                <strong>{vendor.name}</strong>
                <span>{vendor.type}</span>
                <em>{vendor.status}</em>
                <VendorUrl url={vendor.url} />
              </div>
            ))}
          </div>
          <div className="sponsor-grid">
            {sponsorTiers.map((tier) => (
              <div className="sponsor-tier" key={tier.name}>
                <strong>{tier.price}</strong>
                <span>{tier.name}</span>
                <small>{tier.detail}</small>
              </div>
            ))}
          </div>
        </div>
        <form className="form-card" onSubmit={(event) => handleSubmit(event, 'Vendor application')}>
          <h2>Vendor interest form</h2>
          <label>Business name<input name="business" placeholder="Company or booth name" required /></label>
          <label>Contact name<input name="name" placeholder="Primary contact" required /></label>
          <div className="two-col">
            <label>Email<input name="email" type="email" placeholder="contact@example.com" required /></label>
            <label>Phone<input name="phone" type="tel" placeholder="(555) 000-0000" /></label>
          </div>
          <label>Booth type<select name="booth" defaultValue="10x10 Vendor Booth"><option>10x10 Vendor Booth</option><option>20x20 Vendor Booth</option><option>Food Vendor</option><option>Sponsor Table</option></select></label>
          <label>Event interest<select name="eventInterest" defaultValue="Hillman Mud Bog"><option>Hillman Mud Bog</option><option>General sponsor</option></select></label>
          <label>Website or social page<input name="website" placeholder="https://example.com or Facebook page" /></label>
          <label>Setup needs<textarea name="setupNeeds" placeholder="Power, space, arrival timing, product/menu, sponsor questions, or insurance notes" /></label>
          <button className="primary-button full" type="submit">Send vendor request</button>
        </form>
      </section>
      <SponsorDirectory />
    </>
  )
}

function FaqPage({ handleSubmit }) {
  return (
    <>
      <PageIntro kicker="FAQ + rules" icon={FileText} title="Answer the buyer questions before they slow down checkout." copy="This page keeps pricing notes, payment safety, event rules, and contact paths in one place so visitors can make a decision quickly." />
      <PageSignalBand items={pageSignals.faq} />
      <section className="faq-layout">
        <div className="faq-list">
          {faqItems.map((item) => (
            <details key={item.question} open={item.question === faqItems[0].question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
        <div className="rules-box launch-rules">
          <h3>Mud Bog rule notes</h3>
          {mudFestRules.map((rule) => <span key={rule}><CheckCircle2 size={15} /> {rule}</span>)}
        </div>
        <form className="form-card contact-card" onSubmit={(event) => handleSubmit(event, 'Contact request')}>
          <h2>Contact the event team</h2>
          <label>Name<input name="name" placeholder="Your name" required /></label>
          <div className="two-col">
            <label>Email<input name="email" type="email" placeholder="you@example.com" required /></label>
            <label>Phone<input name="phone" type="tel" placeholder="(555) 000-0000" /></label>
          </div>
          <label>Question type<select name="questionType" defaultValue="Ticket question"><option>Ticket question</option><option>Vendor or sponsor</option><option>Donation fund</option><option>Camping or pit pass</option><option>Admin handoff</option></select></label>
          <label>Message<textarea name="message" placeholder="Ask the question here" required /></label>
          <button className="primary-button full" type="submit">Send contact request</button>
        </form>
      </section>
    </>
  )
}

function SuccessPage({ go }) {
  const params = getSuccessParams()
  const flow = params.get('flow') || 'tickets'
  const method = params.get('method') || 'PayPal'
  const preview = params.get('preview') === 'true'
  const total = params.get('total')
  const fund = params.get('fund')

  return (
    <>
      <PageIntro
        kicker={preview ? 'Preview confirmation' : 'Payment confirmation'}
        icon={ReceiptText}
        title={preview ? 'Checkout preview captured. Hosted payment link still needs to be connected.' : 'Thank you. Your confirmation is ready.'}
        copy="This is the receipt-style landing page visitors should return to after PayPal or Stripe checkout. It tells buyers what happened, what to bring, and what admins should reconcile."
      />
      <section className="success-layout">
        <div className="confirmation-card">
          <div className="section-kicker"><CheckCircle2 size={16} /> Confirmation</div>
          <h2>{flow === 'donation' ? 'Donation intent' : 'Event ticket order'}</h2>
          <div className="receipt-grid">
            <span><strong>Method</strong>{method}</span>
            {total && <span><strong>Total</strong>{total}</span>}
            {fund && <span><strong>Fund</strong>{fund}</span>}
            <span><strong>Status</strong>{preview ? 'Preview mode' : 'Payment provider complete'}</span>
          </div>
          <p>
            Bring the payment provider receipt to check-in until digital ticket validation is connected. Admins should reconcile this record against PayPal/Stripe reports before final settlement.
          </p>
          <div className="hero-actions">
            <button className="primary-button large" type="button" onClick={() => go('/mudfest')}>Back to Mud Bog</button>
            <button className="secondary-button large" type="button" onClick={() => go('/faq')}>Rules + contact</button>
          </div>
        </div>
        <div className="next-steps-card">
          <h2>What happens next</h2>
          <span><CheckCircle2 size={17} /> Buyer gets a PayPal or Stripe receipt once real checkout is connected.</span>
          <span><CheckCircle2 size={17} /> Admin receives a payment webhook/form record in production.</span>
          <span><CheckCircle2 size={17} /> Gate check-in uses CSV export until digital ticket validation is added.</span>
          <span><CheckCircle2 size={17} /> Donation fund selection stays visible for reconciliation.</span>
        </div>
      </section>
    </>
  )
}

function AdminPage({ setSelectedEvent, go, handleSubmit, backendStatus }) {
  const [adminUnlocked, setAdminUnlocked] = useState(false)
  const [adminCode, setAdminCode] = useState('')
  const [adminError, setAdminError] = useState('')
  const [adminSuccess, setAdminSuccess] = useState('')
  const [adminMode, setAdminMode] = useState('demo')
  const [adminTokenState, setAdminTokenState] = useState(getAdminToken)
  const [dashboard, setDashboard] = useState(null)

  async function loadDashboard(token = adminTokenState) {
    const data = await apiGet('/api/admin/dashboard', token)
    setDashboard(data)
    return data
  }

  async function handleAdminUnlock(event) {
    event.preventDefault()
    setAdminError('')
    setAdminSuccess('')

    if (hasApiBase()) {
      try {
        const login = await apiPost('/api/admin/login', { password: adminCode })
        setAdminToken(login.token)
        setAdminTokenState(login.token)
        const data = await loadDashboard(login.token)
        setDashboard(data)
        setAdminMode('backend')
        setAdminUnlocked(true)
        setAdminSuccess('Backend V1 admin login connected.')
        return
      } catch (error) {
        if (!adminPreviewEnabled) {
          setAdminError(error.message)
          return
        }
      }
    }

    if (adminCode.trim() === adminDemoCode) {
      setAdminUnlocked(true)
      setAdminMode('demo')
      setAdminError('')
      return
    }
    setAdminError('That admin password/demo code did not match. Backend V1 uses ADMIN_PASSWORD; local demo uses VITE_ADMIN_DEMO_CODE.')
  }

  async function handleAdminNote(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    if (adminMode === 'backend') {
      try {
        await apiPost('/api/admin/notes', {
          text: formData.get('name'),
          priority: formData.get('priority'),
        }, adminTokenState)
        await loadDashboard()
        setAdminSuccess('Admin note saved to Backend V1.')
        form.reset()
        return
      } catch (error) {
        setAdminError(error.message)
      }
    }
    handleSubmit(event, 'Admin note')
  }

  async function handleEventSave(event) {
    event.preventDefault()
    if (adminMode !== 'backend') {
      setAdminError('Use Backend V1 login before saving event edits.')
      return
    }
    const formData = new FormData(event.currentTarget)
    try {
      await apiPut(`/api/admin/events/${formData.get('eventId')}`, {
        date: formData.get('date'),
        status: formData.get('status'),
        summary: formData.get('summary'),
        eventDayNote: formData.get('rules'),
      }, adminTokenState)
      await loadDashboard()
      setAdminSuccess('Event draft saved to Backend V1.')
    } catch (error) {
      setAdminError(error.message)
    }
  }

  async function handlePaymentLinksSave(event) {
    event.preventDefault()
    if (adminMode !== 'backend') {
      setAdminError('Use Backend V1 login before saving payment links.')
      return
    }
    const formData = new FormData(event.currentTarget)
    try {
      await apiPut('/api/admin/payment-links', Object.fromEntries(formData.entries()), adminTokenState)
      await loadDashboard()
      setAdminSuccess('Hosted payment links saved to Backend V1.')
    } catch (error) {
      setAdminError(error.message)
    }
  }

  const adminTools = [
    { icon: PlusCircle, title: 'Add event', copy: 'Non-technical event setup wizard for future Mud Fest, truck pull, golf, raffle, or dinner pages.' },
    { icon: Edit3, title: 'Edit content', copy: 'Update hero copy, videos, prices, schedules, sponsor blocks, rules, and public links.' },
    { icon: Settings2, title: 'Tickets + funds', copy: 'Change admission, kids pricing, pit pass, camping, fund options, limits, and disclaimers.' },
    { icon: Mail, title: 'Admin alerts', copy: 'Route vendor, registration, ticket, donation, and sponsor emails to the right people.' },
    { icon: Download, title: 'Exports', copy: 'Download CSV lists for gate check-in, vendor setup, donor follow-up, and sponsors.' },
    { icon: ShieldCheck, title: 'Payment control', copy: 'Reconcile Stripe/PayPal sessions with donor records and event funds.' },
  ]
  const liveTicketInventory = dashboard?.ticketTypes || ticketInventory
  const liveEvents = dashboard?.events || events
  const liveFunds = dashboard?.funds || funds
  const livePaymentLinks = dashboard?.paymentLinks || paymentLinks
  const adminMetrics = dashboard
    ? [
      { value: dashboard.counts.orders, label: 'orders', detail: 'Ticket checkout intents' },
      { value: formatCents(dashboard.money.projectedCents), label: 'paid tracked', detail: 'Webhook-reconciled total' },
      { value: dashboard.counts.registrations, label: 'registrations', detail: 'Event signup records' },
      { value: liveTicketInventory.reduce((sum, ticket) => sum + ticket.remaining, 0), label: 'tickets left', detail: 'Backend capacity model' },
    ]
    : [
      { value: '312', label: 'visitors', detail: 'Preview analytics placeholder' },
      { value: '$12,640', label: 'launch raised', detail: 'Static prototype metric' },
      { value: '64%', label: 'PayPal checkout', detail: 'Preview payment mix' },
      { value: '219', label: 'tickets left', detail: 'Static inventory model' },
    ]
  const recentAdminRows = dashboard
    ? [
      ...dashboard.recent.orders.map((row) => ({ id: row.id, type: 'Order', name: row.buyer?.name || 'Ticket buyer', event: row.eventId, detail: `${row.items.length} ticket line(s)`, status: row.status, amount: formatCents(row.totalCents), method: row.paymentMethod })),
      ...dashboard.recent.donations.map((row) => ({ id: row.id, type: 'Donation', name: row.donor?.name || 'Donor', event: row.fundLabel, detail: row.note || 'Donation intent', status: row.status, amount: formatCents(row.amountCents), method: row.paymentMethod })),
      ...dashboard.recent.registrations.map((row) => ({ id: row.id, type: 'Registration', name: row.name, event: row.event, detail: row.signupType, status: row.status, amount: '$0', method: 'Form' })),
      ...dashboard.recent.vendorApplications.map((row) => ({ id: row.id, type: 'Vendor', name: row.business, event: row.eventInterest, detail: row.booth, status: row.status, amount: '$0', method: 'Form' })),
    ].slice(0, 10)
    : adminRows

  if (!adminPreviewEnabled && !hasApiBase()) {
    return <AdminLockedPage go={go} />
  }

  if (!adminUnlocked) {
    return (
      <>
        <PageIntro kicker="Admin access" icon={LockKeyhole} title="Admin dashboard is locked on the public site." copy="This preview needs an access gate for demo work, and real production needs server-side authentication before admins can edit events, tickets, funds, or exports." />
        <PageSignalBand items={pageSignals.admin} />
        <section className="admin-lock-layout">
          <form className="form-card admin-lock-card" onSubmit={handleAdminUnlock}>
            <div className="section-kicker"><ShieldCheck size={16} /> Backend V1 access</div>
            <h2>Enter the admin password.</h2>
            <p>{hasApiBase() ? 'Backend V1 will verify this server-side and load live records.' : 'Local demo deployments can still use the preview code. Real launch needs Backend V1 or hosted auth.'}</p>
            <label>Admin password<input name="adminCode" type="password" value={adminCode} onChange={(event) => setAdminCode(event.target.value)} placeholder="ADMIN_PASSWORD or demo code" required /></label>
            {adminError && <span className="form-error">{adminError}</span>}
            {adminSuccess && <span className="form-success">{adminSuccess}</span>}
            <button className="primary-button full" type="submit">{hasApiBase() ? 'Open Backend V1 admin' : 'Open admin preview'}</button>
          </form>
          <div className="admin-lock-card guidance-card">
            <div className="section-kicker"><Globe2 size={16} /> Professional launch path</div>
            <h2>Use protected hosting or real auth for production.</h2>
            <span><CheckCircle2 size={17} /> GitHub Pages is fine for a public brochure/demo.</span>
            <span><CheckCircle2 size={17} /> Backend V1 now supports server-side admin login, edits, exports, form records, and local email outbox.</span>
            <span><CheckCircle2 size={17} /> Final launch should move JSON storage to a managed database and verify PayPal/Stripe webhooks.</span>
            <span><Gauge size={17} /> {backendStatus.message}</span>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <PageIntro kicker="Admin preview" icon={LayoutDashboard} title="Run every fundraiser without making non-technical admins fight the website." copy="This is the v1 admin blueprint: login gate, analytics, orders, exports, event editor, payment setup status, and the fields admins need to change without touching code." />
      <PageSignalBand items={pageSignals.admin} />
      <section className="admin-workspace">
        <div className="admin-sidebar">
          <button className="active" type="button"><BarChart3 size={17} /> Overview</button>
          <button type="button"><CalendarDays size={17} /> Events</button>
          <button type="button"><Ticket size={17} /> Tickets</button>
          <button type="button"><Store size={17} /> Vendors</button>
          <button type="button"><BadgeDollarSign size={17} /> Funds</button>
          <button type="button"><FileText size={17} /> Site content</button>
        </div>
        <div className="admin-main">
          <div className="admin-login-preview">
            <div>
              <div className="section-kicker"><LockKeyhole size={16} /> {adminMode === 'backend' ? 'Backend dashboard unlocked' : 'Demo dashboard unlocked'}</div>
              <h2>{adminMode === 'backend' ? 'Backend V1 is tracking real local records.' : 'Admin preview is for operations planning, not public editing yet.'}</h2>
              <p>{adminMode === 'backend' ? 'Forms, checkout intents, event edits, payment links, exports, and local email notifications now write to the server datastore.' : 'Use this to review the event workflow, exports, ticket caps, funds, and payment setup. Before real launch, protect editing with server-side authentication and audit logs.'}</p>
              {adminError && <span className="form-error">{adminError}</span>}
              {adminSuccess && <span className="form-success">{adminSuccess}</span>}
            </div>
            <form className="login-mini-form" onSubmit={handleAdminNote}>
              <label>Admin note<input name="name" placeholder="Example: camping wording still needs approval" required /></label>
              <label>Priority<select name="priority" defaultValue="Event copy"><option>Event copy</option><option>Ticket setup</option><option>Payment setup</option><option>Vendor follow-up</option></select></label>
              <button className="primary-button full" type="submit">Add admin note</button>
            </form>
          </div>
          <div className="admin-metrics">
            {adminMetrics.map((metric) => (
              <span key={metric.label}><strong>{metric.value}</strong>{metric.label}<small>{metric.detail}</small></span>
            ))}
          </div>
          <div className="traffic-grid admin-traffic">
            {trafficMetrics.map((metric) => (
              <span key={metric.label}><Gauge size={17} /><strong>{metric.value}</strong>{metric.label}<small>{metric.detail}</small></span>
            ))}
          </div>
          <div className="admin-tool-grid">
            {adminTools.map((tool) => {
              const Icon = tool.icon
              return <div className="admin-tool" key={tool.title}><Icon size={20} /><strong>{tool.title}</strong><p>{tool.copy}</p></div>
            })}
          </div>
          <div className="admin-inventory-panel">
            <div>
              <div className="section-kicker"><Ticket size={16} /> Ticket inventory model</div>
              <h2>Low-ticket warnings before checkout.</h2>
              <p>These caps are demo data. Production should update them from confirmed orders and payment webhooks so buyers cannot oversell an event.</p>
            </div>
            <div className="admin-inventory-grid">
              {liveTicketInventory.map((ticket) => (
                <span className={ticket.remaining <= 25 ? 'low' : ''} key={ticket.id}>
                  <strong>{ticket.label}</strong>
                  <small>{ticket.remaining} left</small>
                  <i><b style={{ width: `${ticket.percentSold}%` }} /></i>
                  <em>{ticket.percentSold}% sold</em>
                </span>
              ))}
            </div>
          </div>
          <div className="export-strip" aria-label="Prototype CSV exports">
            <strong>CSV exports</strong>
            <button type="button" onClick={() => adminMode === 'backend' ? downloadAdminExport('orders', adminTokenState) : exportCsv('log-a-load-orders.csv', adminExportData.orders)}><Download size={17} /> Orders</button>
            <button type="button" onClick={() => adminMode === 'backend' ? downloadAdminExport('tickets', adminTokenState) : exportCsv('log-a-load-tickets.csv', adminExportData.tickets)}><Download size={17} /> Tickets</button>
            <button type="button" onClick={() => adminMode === 'backend' ? downloadAdminExport('funds', adminTokenState) : exportCsv('log-a-load-funds.csv', adminExportData.funds)}><Download size={17} /> Funds</button>
            <button type="button" onClick={() => adminMode === 'backend' ? downloadAdminExport('vendors', adminTokenState) : exportCsv('log-a-load-vendors.csv', adminExportData.vendors)}><Download size={17} /> Vendors</button>
            <button type="button" onClick={() => adminMode === 'backend' ? downloadAdminExport('outbox', adminTokenState) : exportCsv('log-a-load-outbox.csv', [])}><Download size={17} /> Email outbox</button>
          </div>
          <div className="admin-editor-grid">
            <form className="form-card admin-editor" onSubmit={handleEventSave}>
              <h2>Edit event</h2>
              <label>Event<select name="eventId" defaultValue="mud-fest">{liveEvents.map((event) => <option value={event.id} key={event.id}>{event.label}</option>)}</select></label>
              <div className="two-col">
                <label>Date<input name="date" defaultValue="Memorial & Labor Day 2026" /></label>
                <label>Status<select name="status" defaultValue="Registration open"><option>Draft</option><option>Registration open</option><option>Sold out</option><option>Closed</option></select></label>
              </div>
              <label>Public summary<textarea name="summary" defaultValue="Food, trucks, beer garden, camping, pit passes, kids pricing, and charity fund selection through Log A Load." /></label>
              <label>Rules copy<textarea name="rules" defaultValue={mudFestRules.join('\n')} /></label>
              <label>Fund options<textarea value={liveFunds.map((fund) => fund.label).join('\n')} readOnly /></label>
              <button className="primary-button full" type="submit">Save event draft</button>
            </form>
            <div className="class-table admin-classes">
              <h2>Ticket + fund manager</h2>
              {liveTicketInventory.map((item) => (
                <div className="class-row" key={item.id}>
                  <strong>{item.label}</strong>
                  <span>{item.price || formatCents(item.priceCents)}</span>
                  <span>{item.id === 'camping' ? 'Confirm details' : 'Published'}</span>
                  <button type="button">Edit</button>
                </div>
              ))}
              <h3>Donation funds</h3>
              {liveFunds.map((fund) => (
                <div className="class-row" key={fund.id}>
                  <strong>{fund.label}</strong>
                  <span>{fund.id === 'mud-fest' ? 'Event default' : 'Optional'}</span>
                  <span>Published</span>
                  <button type="button">Edit</button>
                </div>
              ))}
            </div>
          </div>
          <div className="setup-wizard">
            <div>
              <div className="section-kicker"><PlusCircle size={16} /> New event flow</div>
              <h2>How a non-technical admin adds the next event.</h2>
            </div>
            <div className="setup-steps">
              {adminSetupSteps.map((step, index) => (
                <span key={step.title}><strong>{index + 1}. {step.title}</strong><small>{step.detail}</small></span>
              ))}
            </div>
          </div>
          <form className="payment-config-grid payment-config-form" onSubmit={handlePaymentLinksSave}>
            {Object.entries(paymentEnvKeys).map(([key, envName]) => (
              <label className={livePaymentLinks[key] ? 'payment-config connected' : 'payment-config'} key={key}>
                <strong>{adminMode === 'backend' ? key : envName}</strong>
                <span>{livePaymentLinks[key] ? 'Connected' : 'Needs hosted link'}</span>
                <input name={key} defaultValue={livePaymentLinks[key] || ''} placeholder="https://www.paypal.com/..." />
                <small>{adminMode === 'backend' ? 'Saved server-side for Backend V1 checkout handoff.' : 'Set this in Vercel/Netlify environment variables after the org creates the hosted link.'}</small>
              </label>
            ))}
            <button className="primary-button full" type="submit">Save hosted payment links</button>
          </form>
          <div className="lead-table admin-leads">
            {recentAdminRows.map((row) => (
              <div className="lead-row" key={row.id}>
                <span className="lead-type">{row.type}</span>
                <strong>{row.name}</strong>
                <small>{row.id} - {row.event} - {row.detail} - {row.amount} via {row.method}</small>
                <em>{row.status}</em>
              </div>
            ))}
          </div>
          <div className="hero-actions">
            <button className="secondary-button" type="button" onClick={() => { setSelectedEvent(events[0]); go('/mudfest') }}>Preview Mud Bog</button>
            <button className="secondary-button" type="button" onClick={() => go('/donate')}>Preview donation flow</button>
          </div>
        </div>
      </section>
    </>
  )
}

function AdminLockedPage({ go }) {
  return (
    <>
      <PageIntro kicker="Admin locked" icon={LockKeyhole} title="Admin dashboard is not public." copy="The public GitHub Pages demo intentionally hides the dashboard. That keeps the URL clean for buyers and protects the site from looking like anyone can access back-office tools." />
      <PageSignalBand items={pageSignals.admin} />
      <section className="admin-lock-layout">
        <div className="admin-lock-card guidance-card">
          <div className="section-kicker"><ShieldCheck size={16} /> What this means</div>
          <h2>Good public demo. Not the final admin host.</h2>
          <span><CheckCircle2 size={17} /> Public visitors can browse events, buy ticket previews, donate, register, and contact vendors.</span>
          <span><CheckCircle2 size={17} /> Real admin login should move to Vercel/Netlify protected deployment or a backend app.</span>
          <span><CheckCircle2 size={17} /> Payment links can launch first; inventory locks require provider limits or database-backed checkout.</span>
        </div>
        <div className="admin-lock-card">
          <div className="section-kicker"><Globe2 size={16} /> Next production step</div>
          <h2>Connect auth before edit power.</h2>
          <p>For now, this route is a professional handoff screen instead of an open admin dashboard. The local project still contains the dashboard blueprint for review and backend wiring.</p>
          <div className="hero-actions">
            <button className="primary-button large" type="button" onClick={() => go('/events')}>Back to events</button>
            <button className="secondary-button large" type="button" onClick={() => go('/tickets')}>View tickets</button>
          </div>
        </div>
      </section>
    </>
  )
}

function PageIntro({ kicker, icon: Icon, title, copy }) {
  return (
    <section className="page-intro">
      <div className="section-kicker"><Icon size={16} /> {kicker}</div>
      <h1>{title}</h1>
      <p>{copy}</p>
    </section>
  )
}

function Toast({ submission }) {
  return (
    <div className="toast" role="status">
      <CheckCircle2 size={18} />
      <span>{submission.detail || `${submission.type} captured for ${submission.name} at ${submission.time}. Admin email/payment hook will connect in production.`}</span>
    </div>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <strong>Log A Load Minnesota</strong>
        <span>Prototype for local review. Final copy, photos, videos, logo permission, payment accounts, and nonprofit details still need customer approval.</span>
      </div>
      <nav className="footer-links" aria-label="Footer links">
        <a href="#/">Home</a>
        <a href="https://github.com/YAHHP/log-a-load-mn/blob/main/ATTRIBUTIONS.md">Image credits</a>
      </nav>
    </footer>
  )
}

export default App
