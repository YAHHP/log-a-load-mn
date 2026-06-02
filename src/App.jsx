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
  QrCode,
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

const routes = [
  { path: '/', label: 'Home' },
  { path: '/events', label: 'Events' },
  { path: '/tickets', label: 'Tickets' },
  { path: '/donate', label: 'Donate' },
  { path: '/register', label: 'Register' },
  { path: '/vendors', label: 'Vendors' },
  { path: '/faq', label: 'FAQ' },
]

const events = [
  {
    id: 'mud-fest',
    label: 'Mud Fest Hillman',
    date: 'Memorial & Labor Day 2026',
    location: 'Hillman, Minnesota',
    status: 'Registration open',
    goal: '$40,000',
    raised: '$12,640',
    image: 'mudfest-2024.jpg',
    visualAlt: 'Mud Fest vehicle moving through mud in front of a crowd',
    icon: Mountain,
    audience: 'Families, truck fans, campers',
    impact: 'Tickets + donations feed the launch charity lane.',
    actionLabel: 'Open Mud Fest page',
    summary: 'Log A Load charity ticketing and donation lane for Mud Fest: food, trucks, beer gardens, camping, pits, kids tickets, and fund selection.',
    schedule: ['Gates Friday 8:00 AM', 'Food trucks + vendors', 'Beer garden', 'Camping + pit access'],
  },
  {
    id: 'truck-pull',
    label: 'Truck Pull',
    date: 'Future 2026',
    location: 'Minnesota event site TBD',
    status: 'Planning',
    goal: '$50,000',
    raised: '$18,420',
    image: 'mudfest-2024-event.jpg',
    visualAlt: 'Off-road event vehicle preview for truck pull planning',
    icon: Tractor,
    audience: 'Drivers, crews, sponsors',
    impact: 'A future event template for classes, tickets, vendors, and check-in.',
    actionLabel: 'Preview ticket flow',
    summary: 'Event registration, class rules, tickets, vendors, sponsors, and event-day check-in.',
    schedule: ['Vendor row opens', 'Participant check-in', 'Opening ceremony', 'Classes begin'],
  },
  {
    id: 'golf-classic',
    label: 'Golf Classic',
    date: 'Future 2026',
    location: 'Northwoods Golf Club',
    status: 'Draft',
    goal: '$25,000',
    raised: '$9,800',
    visual: 'golf',
    icon: Trophy,
    audience: 'Teams, hole sponsors, donors',
    impact: 'A clean hub for teams, sponsor tiers, banquet tickets, and raffle funds.',
    actionLabel: 'Preview sponsor flow',
    summary: 'Teams, hole sponsors, banquet tickets, raffle donations, and sponsor recognition.',
    schedule: ['Team check-in', 'Shotgun start', 'Lunch', 'Awards and raffle'],
  },
]

const funds = [
  { id: 'mud-fest', label: 'Mud Fest Charity Fund', note: 'Ticket proceeds and event donations tied to the Hillman Mud Fest charity lane.' },
  { id: 'cmn', label: 'Children’s Miracle Network', note: 'Route the donor gift toward the core Log A Load children’s hospital mission.' },
  { id: 'local-family', label: 'Local Family Support', note: 'A donor-friendly lane for people who want the gift focused close to home.' },
  { id: 'general', label: 'Where it helps most', note: 'Lets Log A Load direct the gift to the highest-priority fundraiser need.' },
]

const ticketOptions = [
  { id: 'general', amount: 15, capacity: 1500, sold: 842, price: '$15', label: 'General admission', note: 'Mud Fest entry ticket through the Log A Load charity lane.' },
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

const eventNetwork = [
  { icon: Mountain, status: 'Featured now', title: 'Mud Fest Hillman', copy: 'Tickets, camping, pit passes, donations, vendors, and QR-code checkout in one lane.' },
  { icon: Tractor, status: 'Template ready', title: 'Truck Pull', copy: 'Rules, classes, vehicle info, event registration, sponsors, and gate check-in.' },
  { icon: Trophy, status: 'Existing fundraiser', title: 'Golf Classic', copy: 'Teams, hole sponsors, banquet tickets, raffle funds, and sponsor recognition.' },
  { icon: PlusCircle, status: 'Expandable', title: 'Next Minnesota event', copy: 'A repeatable structure for dinners, raffles, auctions, rides, or local benefit events.' },
]

const participantOptions = [
  { option: 'Mud Fest volunteer shift', event: 'Mud Fest Hillman', cap: 24, registered: 9, fee: 'Free', status: 'Open', detail: 'Gate help, merch table, donation QR booth, or setup crew.' },
  { option: 'Camping check-in crew', event: 'Mud Fest Hillman', cap: 8, registered: 3, fee: 'Free', status: 'Open', detail: 'Arrival windows, camper notes, and event-day phone number.' },
  { option: 'Truck puller registration', event: 'Truck Pull', cap: 48, registered: 12, fee: 'TBD', status: 'Planning', detail: 'Driver contact, class, vehicle name, hometown, sponsor, and rules acknowledgement.' },
  { option: 'Golf team / sponsor signup', event: 'Golf Classic', cap: 36, registered: 10, fee: 'TBD', status: 'Draft', detail: 'Team captain, player count, sponsor tier, and dinner/raffle notes.' },
]

const vendors = [
  { name: 'Mud Fest Hillman', type: 'Host event partner', status: 'Featured', url: 'mudfesthillman.com' },
  { name: 'Food truck lane', type: 'Food vendor group', status: 'Open', url: 'Vendor page pending' },
  { name: 'Beer garden sponsor', type: 'Sponsor', status: 'Review', url: 'Sponsor page pending' },
  { name: 'Camping check-in', type: 'Operations', status: 'Setup needed', url: 'Admin workflow pending' },
  { name: 'Log A Load booth', type: 'Charity presence', status: 'Approved', url: 'Donation QR station' },
]

const sponsorTiers = [
  { name: 'Trail Sponsor', price: '$250', detail: 'Logo on event page, thank-you post, and booth mention.' },
  { name: 'Pit Sponsor', price: '$500', detail: 'Promoted placement near pit pass/ticket areas and vendor list.' },
  { name: 'Title Charity Sponsor', price: '$1,000+', detail: 'Hero placement, QR station recognition, and admin follow-up lane.' },
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
  { label: 'Food trucks + vendors', detail: 'Vendor row, sponsor booths, Log A Load QR donation station, and family area.' },
  { label: 'Beer garden + pit access', detail: 'Pit pass buyers get closer access while safety rules stay visible before purchase.' },
  { label: 'Mud trucks + event action', detail: 'Mud Fest stays the host event; Log A Load handles charity ticketing and donations.' },
]

const mudFestRules = [
  'All final event times, refund policy, and weather policy must be approved before launch.',
  'Kids 12 and under ticket wording is $5 in the prototype and needs final confirmation.',
  'Camping is listed as $40 per camper; confirm whether one admission pass is included.',
  'Pit pass buyers must follow posted safety boundaries and event staff instructions.',
  'Ticket receipt should be shown at check-in until barcode scanning is connected.',
]

const faqItems = [
  { question: 'Is this the official Mud Fest site?', answer: 'This is the Log A Load Minnesota charity ticket and donation lane for Mud Fest. Mud Fest can keep its host event site while this page handles charity checkout, donation routing, and admin records.' },
  { question: 'Where does the money go?', answer: 'Ticket proceeds and optional donations are tracked by fund so Log A Load can reconcile Mud Fest proceeds, Children’s Miracle Network giving, local support, and general charity needs.' },
  { question: 'Can I pay with PayPal, Venmo, or card?', answer: 'The v1 plan is PayPal first. Venmo and Stripe/Card are shown as supported/future-ready options and can be connected with hosted links once the organization owns the accounts.' },
  { question: 'Do you store my card number?', answer: 'No. This site should redirect to PayPal or Stripe hosted checkout. Card data stays with the payment provider, not this website.' },
  { question: 'Who do I contact for vendor or sponsor questions?', answer: 'Use the vendor/sponsor form on this site for v1. Production should route those submissions to the approved admin email list.' },
]

const adminSetupSteps = [
  { title: 'Create event', detail: 'Title, date, location, hero copy, photos, videos, and QR path.' },
  { title: 'Add tickets', detail: 'Price, inventory notes, legal wording, refund policy, and check-in instructions.' },
  { title: 'Choose funds', detail: 'Mud Fest fund, CMN, local support, and general giving options.' },
  { title: 'Publish links', detail: 'PayPal/Stripe hosted links, vendor form, QR code, and success URL.' },
]

const adminExportData = {
  orders: adminRows.map(({ id, type, name, event, detail, status, amount, method }) => ({ id, type, name, event, detail, status, amount, method })),
  tickets: ticketOptions.map(({ id, label, price, note }) => ({ id, label, price, note, event: 'Mud Fest Hillman' })),
  funds: funds.map(({ id, label, note }) => ({ id, label, note })),
  vendors: vendors.map(({ name, type, status, url }) => ({ name, type, status, url })),
}

const trafficMetrics = [
  { label: 'QR scans today', value: '312', detail: 'Preview analytics placeholder' },
  { label: 'Mobile visitors', value: '81%', detail: 'iPhone-first layout priority' },
  { label: 'Checkout starts', value: '74', detail: 'Ticket and donation intents' },
  { label: 'Admin exports', value: '4', detail: 'Orders, tickets, funds, vendors' },
]

const ticketInventory = ticketOptions.map((ticket) => {
  const remaining = ticket.capacity - ticket.sold
  const percentSold = Math.round((ticket.sold / ticket.capacity) * 100)
  return { ...ticket, remaining, percentSold }
})

const checkoutPlan = [
  { title: 'Hosted checkout now', detail: 'PayPal or Stripe Payment Links can accept the money without this site touching card data.' },
  { title: 'Inventory needs records', detail: 'Low-ticket warnings and sold-out locks need a database or provider inventory limit, plus payment webhooks.' },
  { title: 'Admin reconciles daily', detail: 'Orders, funds, tickets, vendor forms, and payment reports should export cleanly for check-in.' },
]

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

function formatMoney(amount) {
  return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

function getTicketTotal(ticketQuantities) {
  return ticketOptions.reduce((total, ticket) => total + (ticketQuantities[ticket.id] || 0) * ticket.amount, 0)
}

function getTicketRemaining(ticketId) {
  return ticketInventory.find((ticket) => ticket.id === ticketId)?.remaining ?? 999
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

function App() {
  const [route, setRoute] = useState(getRoute)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [submission, setSubmission] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(events[0])
  const [selectedFund, setSelectedFund] = useState(funds[0])
  const [selectedTicket, setSelectedTicket] = useState(ticketOptions[0])
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0])
  const [ticketQuantities, setTicketQuantities] = useState({ general: 1, kids: 0, pit: 0, camping: 0 })

  useEffect(() => {
    const onHashChange = () => {
      setRoute(getRoute())
      setMobileOpen(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const metrics = useMemo(
    () => [
      { label: 'Launch event', value: 'Mud Fest', detail: 'Hillman charity ticket lane' },
      { label: 'Event templates', value: '3', detail: 'Mud Fest, truck pull, golf' },
      { label: 'Launch goal', value: '$40K', detail: 'Tickets + event donations' },
      { label: 'Payment plan', value: 'PayPal', detail: 'Stripe + Venmo ready' },
    ],
    [],
  )

  function go(path) {
    window.location.hash = path
  }

  function handleSubmit(event, type) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') || formData.get('business') || 'New submission'
    setSubmission({
      type,
      name,
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    })
    event.currentTarget.reset()
  }

  function updateTicketQuantity(ticketId, value) {
    const quantity = Math.min(getTicketRemaining(ticketId), Math.max(0, Number(value) || 0))
    setTicketQuantities((current) => ({ ...current, [ticketId]: quantity }))
  }

  function handleHostedPayment(event, flow, paymentMethod, extraParams = {}) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') || formData.get('business') || 'New visitor'
    setSubmission({
      type: flow === 'donation' ? 'Donation checkout' : 'Ticket checkout',
      name,
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    })
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
        {route === '/events' && <EventsPage selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} go={go} />}
        {route === '/donate' && <DonatePage selectedFund={selectedFund} setSelectedFund={setSelectedFund} selectedPayment={selectedPayment} setSelectedPayment={setSelectedPayment} handleHostedPayment={handleHostedPayment} />}
        {route === '/tickets' && <TicketsPage selectedTicket={selectedTicket} setSelectedTicket={setSelectedTicket} selectedPayment={selectedPayment} setSelectedPayment={setSelectedPayment} ticketQuantities={ticketQuantities} updateTicketQuantity={updateTicketQuantity} handleHostedPayment={handleHostedPayment} />}
        {(route === '/register' || route === '/participants' || route === '/pullers') && <ParticipantsPage handleSubmit={handleSubmit} />}
        {route === '/vendors' && <VendorsPage handleSubmit={handleSubmit} />}
        {route === '/faq' && <FaqPage handleSubmit={handleSubmit} />}
        {route === '/success' && <SuccessPage go={go} />}
        {route === '/admin' && <AdminPage setSelectedEvent={setSelectedEvent} go={go} handleSubmit={handleSubmit} />}
      </main>
      <Footer />
    </div>
  )
}

function Header({ route, mobileOpen, setMobileOpen }) {
  const activeRoute = route === '/mudfest' ? '/events' : route === '/pullers' || route === '/participants' ? '/register' : route

  return (
    <header className="site-header">
      <a className="brand logo-brand" href="#/" aria-label="Log A Load Minnesota home">
        <img src={assetPath('log-a-load-cobrand-logo.avif')} alt="Log A Load for Kids and Children's Miracle Network Hospitals logo" />
        <span>
          <strong>Log A Load MN</strong>
          <small>Local Event Hub</small>
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
    { path: '/events', icon: CalendarDays, label: 'Browse events', detail: 'Mud Fest now, truck pull and golf templates ready.' },
    { path: '/tickets', icon: Ticket, label: 'Buy tickets', detail: 'Featured-event checkout without digging.' },
    { path: '/donate', icon: BadgeDollarSign, label: 'Pick a charity fund', detail: 'Choose exactly where the donation should go.' },
    { path: '/register', icon: ClipboardList, label: 'Register for an event', detail: 'Volunteer, competitor, golfer, crew, or sponsor rep.' },
  ]

  return (
    <>
      <section className="hero-section page-hero">
        <div className="hero-media" aria-hidden="true">
          <div className="tree-line" />
          <div className="track-lane" />
          <div className="truck-card"><Gauge size={22} /><span>Minnesota event command center</span></div>
        </div>
        <div className="hero-content">
          <div className="eyebrow"><HandHeart size={16} /> Log A Load Minnesota event hub</div>
          <div className="event-logo-lockup">
            <img src={assetPath('mudfest-logo.png')} alt="Mud Fest Hillman logo" />
            <span>Launch event: Mud Fest Hillman</span>
          </div>
          <h1>Minnesota events that fund the cause.</h1>
          <p className="hero-copy">
            Log A Load Minnesota gets one clean hub for tickets, donations, sponsors, vendors, event registration, and admin tracking. Mud Fest Hillman is the first featured fundraiser, and the same system can carry truck pulls, golf, raffles, dinners, and future events.
          </p>
          <div className="hero-actions">
            <button className="primary-button large" type="button" onClick={() => go('/events')}>Browse events <ArrowRight size={18} /></button>
            <button className="secondary-button large" type="button" onClick={() => go('/tickets')}>Buy Mud Fest tickets</button>
            <button className="secondary-button large" type="button" onClick={() => go('/donate')}>Donate now</button>
          </div>
        </div>
        <aside className="hero-panel" aria-label="Event quick actions">
          <img className="hero-panel-photo" src={assetPath('mudfest-2024-event.jpg')} alt="Mud Fest trucks and off-road event preview" />
          <div className="panel-topline">QR landing target</div>
          <h2>Scan, buy a ticket, pick a fund, and show the confirmation at check-in.</h2>
          <div className="qr-box"><QrCode size={84} /><span>logaloadmn.org/mudfest</span></div>
          <div className="quick-grid">
            <a href="#/events"><CalendarDays size={17} /> Event center</a>
            <a href="#/tickets"><Ticket size={17} /> Buy tickets</a>
            <a href="#/donate"><BadgeDollarSign size={17} /> Choose fund</a>
            <a href="#/register"><ClipboardList size={17} /> Register</a>
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

      <section className="scan-strip" aria-label="QR code quick paths">
        <div>
          <div className="section-kicker"><QrCode size={16} /> Scanned the QR code?</div>
          <h2>Pick the thing you came here to do.</h2>
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
      <EventNetwork go={go} />
      <TicketInventoryStrip />
      <TrustFlow />
      <CheckoutArchitecture />
      <ImpactLedger go={go} />
      <ReviewSection />
    </>
  )
}

function MudFestExperience({ go }) {
  return (
    <section className="mudfest-showcase">
      <div className="showcase-copy">
        <div className="section-kicker"><Mountain size={16} /> Featured event</div>
        <h2>Mud Fest gets the energy. Log A Load gets the clean charity lane.</h2>
        <p>
          The host event can keep its own site. This page gives sponsors, families, and QR-code buyers the simple charity purchase path:
          tickets, optional fund selection, payment, receipt, and admin tracking.
        </p>
        <div className="hero-actions">
          <button className="primary-button large" type="button" onClick={() => go('/tickets')}>Start ticket order</button>
          <button className="secondary-button large" type="button" onClick={() => go('/events')}>View event center</button>
        </div>
      </div>
      <div className="showcase-board" aria-label="Mud Fest highlights">
        <div className="mud-track" />
        <img className="showcase-photo main-photo" src={assetPath('mudfest-2024.jpg')} alt="Mud Fest off-road event crowd and vehicles" />
        <img className="showcase-photo side-photo" src={assetPath('mudfest-2024-event.jpg')} alt="Mud Fest event action preview" />
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
        title="The Mud Fest charity lane is ready for tickets, funds, and QR traffic."
        copy="Mud Fest keeps the event energy. Log A Load Minnesota gets a professional path for admission, pit passes, camping, donations, sponsor visibility, and admin records."
      />
      <section className="event-brief">
        <div className="brief-media">
          <img src={assetPath('mudfest-2024.jpg')} alt="Mud Fest vehicle moving through mud in front of event crowd" />
          <div className="brief-badges">
            <span><CalendarDays size={16} /> Memorial & Labor Day 2026</span>
            <span><MapPin size={16} /> Hillman, Minnesota</span>
            <span><HandHeart size={16} /> Log A Load charity ticket lane</span>
          </div>
        </div>
        <div className="brief-copy">
          <div className="section-kicker"><Ticket size={16} /> Launch event</div>
          <h2>Everything a visitor needs after scanning the QR code.</h2>
          <p>
            Buyers should not need to hunt around for price notes, payment choices, rules, or where the money goes. This page makes the Mud Fest path obvious:
            buy tickets, add a donation, understand the cause, and know what still needs final confirmation before public launch.
          </p>
          <div className="hero-actions">
            <button className="primary-button large" type="button" onClick={() => go('/tickets')}>Buy Mud Fest tickets</button>
            <button className="secondary-button large" type="button" onClick={() => go('/donate')}>Donate to a fund</button>
            <button className="secondary-button large" type="button" onClick={() => go('/faq')}>Rules + contact</button>
          </div>
        </div>
      </section>

      <section className="schedule-section">
        <div>
          <div className="section-kicker"><CalendarDays size={16} /> Event flow</div>
          <h2>Mud Fest highlights, ticketed through the charity page.</h2>
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
    </>
  )
}

function EventNetwork({ go }) {
  return (
    <section className="event-network">
      <div className="network-copy">
        <div className="section-kicker"><CalendarDays size={16} /> Minnesota event system</div>
        <h2>One professional hub, many local fundraisers.</h2>
        <p>
          The public pages should feel easy for a QR-code visitor, but the structure underneath needs to repeat. Each event can have its own tickets,
          donation funds, registration forms, vendor list, sponsors, videos, photos, and admin tracking.
        </p>
        <div className="hero-actions">
          <button className="primary-button large" type="button" onClick={() => go('/events')}>Browse event center</button>
          <button className="secondary-button large" type="button" onClick={() => go('/register')}>Open event registration</button>
        </div>
      </div>
      <div className="network-grid" aria-label="Event platform examples">
        {eventNetwork.map((item) => {
          const Icon = item.icon
          return (
            <button type="button" key={item.title} onClick={() => go('/events')}>
              <Icon size={24} />
              <span>{item.status}</span>
              <strong>{item.title}</strong>
              <small>{item.copy}</small>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function TicketInventoryStrip() {
  return (
    <section className="inventory-strip" aria-label="Mud Fest ticket availability">
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

function CheckoutArchitecture() {
  return (
    <section className="checkout-architecture">
      <div>
        <div className="section-kicker"><Globe2 size={16} /> Payment + inventory plan</div>
        <h2>Payments can launch with hosted links. Ticket limits need a real backend.</h2>
        <p>
          GitHub Pages is solid for a public demo and static QR traffic. For live ticket caps, admin login, webhooks, and payment reconciliation,
          the professional path is Vercel or Netlify plus a small database-backed API.
        </p>
      </div>
      <div className="architecture-steps">
        {checkoutPlan.map((step, index) => (
          <span key={step.title}>
            <strong>{index + 1}. {step.title}</strong>
            <small>{step.detail}</small>
          </span>
        ))}
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
      <PageIntro kicker="Event center" icon={CalendarDays} title="Every Minnesota fundraiser gets a clean event page." copy="Mud Fest is the launch event, but this is built as a repeatable Log A Load hub for truck pulls, golf outings, raffles, dinners, and future local fundraisers." />
      <section className="page-grid">
        <div className="event-list">
          {events.map((event) => (
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
          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={() => go(selectedEvent.id === 'mud-fest' ? '/mudfest' : selectedEvent.id === 'golf-classic' ? '/vendors' : '/tickets')}>{selectedEvent.actionLabel}</button>
            <button className="secondary-button" type="button" onClick={() => go('/tickets')}>Tickets</button>
            <button className="secondary-button" type="button" onClick={() => go('/register')}>Event registration</button>
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

function EventVisual({ event, compact = false }) {
  const Icon = event.icon || CalendarDays
  if (event.image) {
    return (
      <div className={compact ? 'event-visual compact' : 'event-visual'}>
        <img src={assetPath(event.image)} alt={event.visualAlt || event.label} loading="lazy" />
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

function DonatePage({ selectedFund, setSelectedFund, selectedPayment, setSelectedPayment, handleHostedPayment }) {
  return (
    <>
      <PageIntro kicker="Donations" icon={BadgeDollarSign} title="Let donors choose the exact charity lane." copy="Mud Fest ticket money can feed the event charity pool, while extra gifts can go to Children’s Miracle Network, local family support, or wherever Log A Load needs it most." />
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
          <label>Selected fund<input name="fund" value={selectedFund.label} readOnly /></label>
          <label>Donation amount<input name="amount" defaultValue="$100" inputMode="decimal" /></label>
          <label>Donor name<input name="name" placeholder="Name or company" required /></label>
          <div className="two-col">
            <label>Email<input name="email" type="email" placeholder="you@example.com" required /></label>
            <label>Phone<input name="phone" type="tel" placeholder="(555) 000-0000" /></label>
          </div>
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
    </>
  )
}

function TicketsPage({ selectedTicket, setSelectedTicket, selectedPayment, setSelectedPayment, ticketQuantities, updateTicketQuantity, handleHostedPayment }) {
  const ticketTotal = getTicketTotal(ticketQuantities)
  const selectedItems = ticketOptions.filter((ticket) => (ticketQuantities[ticket.id] || 0) > 0)

  return (
    <>
      <PageIntro kicker="Mud Fest tickets" icon={Ticket} title="Build a Mud Fest order and send it to hosted checkout." copy="General admission, kids tickets, pit passes, and camping are separated with final wording notes. PayPal is the v1 checkout path; Stripe and Venmo can be connected without storing card data here." />
      <section className="tickets-page">
        <div className="ticket-stack">
          <div className="ticket-product-grid">
            {ticketInventory.map((ticket) => (
              <div className={(ticketQuantities[ticket.id] || 0) > 0 ? 'ticket-product selected' : 'ticket-product'} key={ticket.id}>
                <button type="button" onClick={() => setSelectedTicket(ticket)}>
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
            <div><Mountain size={22} /><strong>Mud Fest Hillman</strong></div>
            <span>Food trucks</span>
            <span>Beer garden</span>
            <span>Camping</span>
            <span>Truck action</span>
            <small>Details based on notes plus public Mud Fest event framing. Prices marked uncertain should be confirmed before launch.</small>
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
          <label>Event<input name="event" value="Mud Fest Hillman" readOnly /></label>
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
    </>
  )
}

function ParticipantsPage({ handleSubmit }) {
  return (
    <>
      <PageIntro kicker="Event registration" icon={ClipboardList} title="One signup lane for every event role." copy="Each event can define what registration means: volunteer, competitor, golfer, camping helper, sponsor rep, raffle donor, or day-of operations crew." />
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
            <label>Event<select name="event" defaultValue="Mud Fest Hillman">{events.map((event) => <option key={event.id}>{event.label}</option>)}</select></label>
            <label>Signup type<select name="signupType" defaultValue={participantOptions[0].option}>{participantOptions.map((item) => <option key={item.option}>{item.option}</option>)}</select></label>
          </div>
          <div className="two-col">
            <label>Team, vehicle, or company<input name="group" placeholder="Optional" /></label>
            <label>City / hometown<input name="city" placeholder="Optional" /></label>
          </div>
          <label>Notes for admins<textarea name="notes" placeholder="Shift preference, class info, sponsor notes, accessibility needs, or questions" /></label>
          <button className="primary-button full" type="submit">Submit event registration</button>
        </form>
      </section>
    </>
  )
}

function VendorsPage({ handleSubmit }) {
  return (
    <>
      <PageIntro kicker="Vendors + sponsors" icon={Store} title="Give every event partner a clean public lane." copy="Food vendors, beer garden sponsors, camping operations, Log A Load booths, golf sponsors, and future sponsor packages all need a clean form, clear status, and admin follow-up path." />
      <section className="page-grid">
        <div className="vendor-page-stack">
          <div className="vendor-list rich-list">
            {vendors.map((vendor) => (
              <div className="vendor-row" key={vendor.name}>
                <strong>{vendor.name}</strong>
                <span>{vendor.type}</span>
                <em>{vendor.status}</em>
                <small>{vendor.url}</small>
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
          <label>Event interest<select name="eventInterest" defaultValue="Mud Fest Hillman"><option>Mud Fest Hillman</option><option>Future Truck Pull</option><option>Golf Classic</option><option>General sponsor</option></select></label>
          <button className="primary-button full" type="submit">Send vendor request</button>
        </form>
      </section>
    </>
  )
}

function FaqPage({ handleSubmit }) {
  return (
    <>
      <PageIntro kicker="FAQ + rules" icon={FileText} title="Answer the buyer questions before they slow down checkout." copy="This page keeps pricing notes, payment safety, event rules, and contact paths in one place so QR-code visitors can make a decision quickly." />
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
          <h3>Mud Fest rule notes</h3>
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
            Bring the payment provider receipt to check-in until barcode scanning is connected. Admins should reconcile this record against PayPal/Stripe reports before final settlement.
          </p>
          <div className="hero-actions">
            <button className="primary-button large" type="button" onClick={() => go('/mudfest')}>Back to Mud Fest</button>
            <button className="secondary-button large" type="button" onClick={() => go('/faq')}>Rules + contact</button>
          </div>
        </div>
        <div className="next-steps-card">
          <h2>What happens next</h2>
          <span><CheckCircle2 size={17} /> Buyer gets a PayPal or Stripe receipt once real checkout is connected.</span>
          <span><CheckCircle2 size={17} /> Admin receives a payment webhook/form record in production.</span>
          <span><CheckCircle2 size={17} /> Gate check-in uses CSV export until scanner/barcode logic is added.</span>
          <span><CheckCircle2 size={17} /> Donation fund selection stays visible for reconciliation.</span>
        </div>
      </section>
    </>
  )
}

function AdminPage({ setSelectedEvent, go, handleSubmit }) {
  const [adminUnlocked, setAdminUnlocked] = useState(false)
  const [adminCode, setAdminCode] = useState('')
  const [adminError, setAdminError] = useState('')

  function handleAdminUnlock(event) {
    event.preventDefault()
    if (adminCode.trim() === adminDemoCode) {
      setAdminUnlocked(true)
      setAdminError('')
      return
    }
    setAdminError('That demo code did not match. For public launch, this needs real server-side authentication.')
  }

  const adminTools = [
    { icon: PlusCircle, title: 'Add event', copy: 'Non-technical event setup wizard for future Mud Fest, truck pull, golf, raffle, or dinner pages.' },
    { icon: Edit3, title: 'Edit content', copy: 'Update hero copy, videos, prices, schedules, sponsor blocks, rules, and QR targets.' },
    { icon: Settings2, title: 'Tickets + funds', copy: 'Change admission, kids pricing, pit pass, camping, fund options, limits, and disclaimers.' },
    { icon: Mail, title: 'Admin alerts', copy: 'Route vendor, registration, ticket, donation, and sponsor emails to the right people.' },
    { icon: Download, title: 'Exports', copy: 'Download CSV lists for gate check-in, vendor setup, donor follow-up, and sponsors.' },
    { icon: ShieldCheck, title: 'Payment control', copy: 'Reconcile Stripe/PayPal sessions with donor records and event funds.' },
  ]

  if (!adminPreviewEnabled) {
    return <AdminLockedPage go={go} />
  }

  if (!adminUnlocked) {
    return (
      <>
        <PageIntro kicker="Admin access" icon={LockKeyhole} title="Admin dashboard is locked on the public site." copy="This preview needs an access gate for demo work, and real production needs server-side authentication before admins can edit events, tickets, funds, or exports." />
        <section className="admin-lock-layout">
          <form className="form-card admin-lock-card" onSubmit={handleAdminUnlock}>
            <div className="section-kicker"><ShieldCheck size={16} /> Local demo gate</div>
            <h2>Enter the admin demo code.</h2>
            <p>This is only for local or intentionally enabled demo deployments. It is not a replacement for real auth.</p>
            <label>Demo code<input name="adminCode" type="password" value={adminCode} onChange={(event) => setAdminCode(event.target.value)} placeholder="Ask site owner for code" required /></label>
            {adminError && <span className="form-error">{adminError}</span>}
            <button className="primary-button full" type="submit">Open admin preview</button>
          </form>
          <div className="admin-lock-card guidance-card">
            <div className="section-kicker"><Globe2 size={16} /> Professional launch path</div>
            <h2>Use protected hosting or real auth for production.</h2>
            <span><CheckCircle2 size={17} /> GitHub Pages is fine for a public brochure/demo.</span>
            <span><CheckCircle2 size={17} /> Admin editing needs Vercel/Netlify protection, Supabase Auth, Clerk, or another server-backed provider.</span>
            <span><CheckCircle2 size={17} /> Ticket limits and payment reconciliation need database records plus PayPal/Stripe webhooks.</span>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <PageIntro kicker="Admin preview" icon={LayoutDashboard} title="Run every fundraiser without making non-technical admins fight the website." copy="This is the v1 admin blueprint: login gate, analytics, orders, exports, event editor, payment setup status, and the fields admins need to change without touching code." />
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
              <div className="section-kicker"><LockKeyhole size={16} /> Demo dashboard unlocked</div>
              <h2>Admin preview is for operations planning, not public editing yet.</h2>
              <p>Use this to review the event workflow, exports, ticket caps, funds, and payment setup. Before real launch, protect editing with server-side authentication and audit logs.</p>
            </div>
            <form className="login-mini-form" onSubmit={(event) => handleSubmit(event, 'Admin note')}>
              <label>Admin note<input name="name" placeholder="Example: camping wording still needs approval" required /></label>
              <label>Priority<select name="priority" defaultValue="Event copy"><option>Event copy</option><option>Ticket setup</option><option>Payment setup</option><option>Vendor follow-up</option></select></label>
              <button className="primary-button full" type="submit">Add admin note</button>
            </form>
          </div>
          <div className="admin-metrics">
            <span><strong>312</strong> QR scans</span>
            <span><strong>$12,640</strong> launch raised</span>
            <span><strong>64%</strong> PayPal checkout</span>
            <span><strong>219</strong> tickets left</span>
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
              {ticketInventory.map((ticket) => (
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
            <button type="button" onClick={() => exportCsv('log-a-load-orders.csv', adminExportData.orders)}><Download size={17} /> Orders</button>
            <button type="button" onClick={() => exportCsv('log-a-load-tickets.csv', adminExportData.tickets)}><Download size={17} /> Tickets</button>
            <button type="button" onClick={() => exportCsv('log-a-load-funds.csv', adminExportData.funds)}><Download size={17} /> Funds</button>
            <button type="button" onClick={() => exportCsv('log-a-load-vendors.csv', adminExportData.vendors)}><Download size={17} /> Vendors</button>
          </div>
          <div className="admin-editor-grid">
            <div className="form-card admin-editor">
              <h2>Edit event</h2>
              <label>Event<select defaultValue="Mud Fest Hillman">{events.map((event) => <option key={event.id}>{event.label}</option>)}</select></label>
              <div className="two-col">
                <label>Date<input defaultValue="Memorial & Labor Day 2026" /></label>
                <label>Status<select defaultValue="Registration open"><option>Draft</option><option>Registration open</option><option>Sold out</option><option>Closed</option></select></label>
              </div>
              <label>Public summary<textarea defaultValue="Food, trucks, beer garden, camping, pit passes, kids pricing, and charity fund selection through Log A Load." /></label>
              <label>Rules copy<textarea defaultValue={mudFestRules.join('\n')} /></label>
              <label>Fund options<textarea defaultValue={funds.map((fund) => fund.label).join('\n')} /></label>
              <button className="primary-button full" type="button">Save event draft</button>
            </div>
            <div className="class-table admin-classes">
              <h2>Ticket + fund manager</h2>
              {ticketOptions.map((item) => (
                <div className="class-row" key={item.id}>
                  <strong>{item.label}</strong>
                  <span>{item.price}</span>
                  <span>{item.id === 'camping' ? 'Confirm details' : 'Published'}</span>
                  <button type="button">Edit</button>
                </div>
              ))}
              <h3>Donation funds</h3>
              {funds.map((fund) => (
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
          <div className="payment-config-grid">
            {Object.entries(paymentEnvKeys).map(([key, envName]) => (
              <div className={paymentLinks[key] ? 'payment-config connected' : 'payment-config'} key={key}>
                <strong>{envName}</strong>
                <span>{paymentLinks[key] ? 'Connected' : 'Needs hosted link'}</span>
                <small>{paymentLinks[key] || 'Set this in Vercel/Netlify environment variables after the org creates the hosted link.'}</small>
              </div>
            ))}
          </div>
          <div className="lead-table admin-leads">
            {adminRows.map((row) => (
              <div className="lead-row" key={row.id}>
                <span className="lead-type">{row.type}</span>
                <strong>{row.name}</strong>
                <small>{row.id} - {row.event} - {row.detail} - {row.amount} via {row.method}</small>
                <em>{row.status}</em>
              </div>
            ))}
          </div>
          <div className="hero-actions">
            <button className="secondary-button" type="button" onClick={() => { setSelectedEvent(events[0]); go('/mudfest') }}>Preview Mud Fest</button>
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

function ReviewSection() {
  return (
    <section className="review-section">
      <div>
        <div className="section-kicker"><ShieldCheck size={16} /> Product review</div>
        <h2>What is still missing before this is real.</h2>
      </div>
      <div className="review-grid">
        <span><CheckCircle2 size={17} /> Real Log A Load Minnesota logo approval and brand rules</span>
        <span><CheckCircle2 size={17} /> Confirm Mud Fest ticket wording: kids pricing and whether camping includes admission</span>
        <span><CheckCircle2 size={17} /> Admin login and permissions so only trusted users can edit</span>
        <span><CheckCircle2 size={17} /> Database tables for events, funds, vendors, tickets, donations, sponsors</span>
        <span><CheckCircle2 size={17} /> PayPal business/nonprofit account owned by the organization or fiscal host</span>
        <span><CheckCircle2 size={17} /> Registration role templates for each event: volunteer, competitor, golfer, sponsor, or staff</span>
        <span><CheckCircle2 size={17} /> Mud Fest photos/video permissions, sponsor assets, and QR-code landing URLs</span>
      </div>
    </section>
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
      <span>{submission.type} captured for {submission.name} at {submission.time}. Admin email/payment hook will connect in production.</span>
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
      <a href="#/">Home</a>
    </footer>
  )
}

export default App
