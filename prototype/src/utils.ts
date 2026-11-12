import { CITY_CENTRE, POSTCODES, TODAY, catName, type Opportunity } from './data'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const parse = (d: string) => {
  const [y, m, day] = d.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, day))
}
export const fmtDate = (d: string, year = false) => {
  const dt = parse(d)
  return `${DAYS[dt.getUTCDay()]} ${dt.getUTCDate()} ${MONTHS[dt.getUTCMonth()]}${year ? ` ${dt.getUTCFullYear()}` : ''}`
}
export const fmtShort = (d: string) => {
  const dt = parse(d)
  return `${DAYS[dt.getUTCDay()].slice(0, 3)} ${dt.getUTCDate()} ${MONTHS[dt.getUTCMonth()].slice(0, 3)}`
}
export const dayParts = (d: string) => {
  const dt = parse(d)
  return { dow: DAYS[dt.getUTCDay()].slice(0, 3), day: dt.getUTCDate(), mon: MONTHS[dt.getUTCMonth()].slice(0, 3) }
}
export const daysFromToday = (d: string) => Math.round((parse(d).getTime() - parse(TODAY).getTime()) / 86400000)
export const relDay = (d: string) => {
  const n = daysFromToday(d)
  if (n === 0) return 'Today'
  if (n === 1) return 'Tomorrow'
  if (n > 1 && n < 7) return `In ${n} days`
  return null
}
export const endTime = (start: string, hours: number) => {
  const [h, m] = start.split(':').map(Number)
  const total = h * 60 + m + hours * 60
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}
export const fmtHours = (h: number) => (h === 1 ? '1 hour' : `${h} hours`)
export const fmtHrs = (h: number) => (h === 1 ? '1 hr' : `${h} hrs`)
export const isWeekend = (d: string) => {
  const n = daysFromToday(d)
  return n >= 0 && n <= 3 && [0, 6].includes(parse(d).getUTCDay())
}

export const POSTCODE_RE = /^([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})$/i
export const normalisePostcode = (p: string) => {
  const m = p.trim().match(POSTCODE_RE)
  return m ? `${m[1].toUpperCase()} ${m[2].toUpperCase()}` : null
}
export const district = (p: string) => (normalisePostcode(p) ?? p).split(' ')[0].toUpperCase()
export const originFor = (postcode: string) => {
  const d = POSTCODES[district(postcode)]
  return d ? { lat: d.lat, lng: d.lng, inArea: true, area: d.area } : { ...CITY_CENTRE, inArea: false, area: 'Brighton city centre' }
}
export const miles = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 3958.8
  const toR = (x: number) => (x * Math.PI) / 180
  const dLat = toR(b.lat - a.lat)
  const dLng = toR(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10
}

export const ageOn = (dob: string, on = TODAY) => {
  const [y, m, d] = dob.split('-').map(Number)
  const [ty, tm, td] = on.split('-').map(Number)
  let age = ty - y
  if (tm < m || (tm === m && td < d)) age--
  return age
}

export const shareCaption = (o: Opportunity) =>
  `Join me for a ${o.title} on ${fmtShort(o.date)}, ${o.startTime} – ${fmtHrs(o.hours)} 🌊 #GoodDeeds #Brighton`
export const deedCaption = (o: Opportunity) => `I just gave ${fmtHours(o.hours)} to a ${o.title} with Good Deeds 💚 #GoodDeeds`
export const oppLink = (o: Opportunity) => `https://gooddeeds.example/o/${o.id}`

export async function share(text: string, url: string): Promise<'shared' | 'copied' | 'cancelled'> {
  try {
    if (navigator.share) {
      await navigator.share({ text, url })
      return 'shared'
    }
  } catch (e) {
    if ((e as Error).name === 'AbortError') return 'cancelled'
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`)
  } catch {
    /* clipboard may be blocked in the preview; still confirm */
  }
  return 'copied'
}

export function downloadIcs(o: Opportunity) {
  const stamp = (d: string, t: string) => `${d.replace(/-/g, '')}T${t.replace(':', '')}00`
  const esc = (s: string) => s.replace(/[,;\\]/g, (c) => `\\${c}`).replace(/\n/g, '\\n')
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Good Deeds//Demo//EN',
    'BEGIN:VEVENT',
    `UID:${o.id}@gooddeeds.example`,
    `DTSTAMP:${stamp(TODAY, '09:00')}`,
    `DTSTART;TZID=Europe/London:${stamp(o.date, o.startTime)}`,
    `DTEND;TZID=Europe/London:${stamp(o.date, endTime(o.startTime, o.hours))}`,
    `SUMMARY:${esc(o.title)}`,
    `LOCATION:${esc(`${o.place}, ${o.address}, ${o.postcode}`)}`,
    `DESCRIPTION:${esc(`${catName(o.category)} with Good Deeds. ${o.description}`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const blob = new Blob([ics], { type: 'text/calendar' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${o.title.replace(/\s+/g, '-').toLowerCase()}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export const voucherCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return `GD-${Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}`
}
export const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`
