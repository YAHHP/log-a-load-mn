import QRCode from 'qrcode'

const baseUrl = process.env.PUBLIC_SITE_URL || 'https://yahhp.github.io/log-a-load-mn/'

const targets = [
  ['qr-home.svg', baseUrl],
  ['qr-mudfest.svg', `${baseUrl}#/mudfest`],
  ['qr-tickets.svg', `${baseUrl}#/tickets`],
  ['qr-donate.svg', `${baseUrl}#/donate`],
  ['qr-register.svg', `${baseUrl}#/register`],
  ['qr-vendors.svg', `${baseUrl}#/vendors`],
  ['qr-event-day.svg', `${baseUrl}#/event-day`],
]

await Promise.all(targets.map(([file, url]) => QRCode.toFile(`public/${file}`, url, {
  color: {
    dark: '#16261d',
    light: '#fffaf0',
  },
  errorCorrectionLevel: 'M',
  margin: 2,
  width: 320,
})))

for (const [file, url] of targets) {
  console.log(`${file} -> ${url}`)
}
