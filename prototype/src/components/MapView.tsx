import { useState } from 'react'
import { CloudOff, List, MapPin, Users, User as UserIcon, X } from 'lucide-react'
import type { Opportunity } from '../data'
import { useStore } from '../store'
import { useNav } from '../nav'
import { fmtShort, fmtHrs } from '../utils'
import { Button, CATEGORY_ICON, IconButton, cx } from './ui'

const B = { minLat: 50.812, maxLat: 50.846, minLng: -0.195, maxLng: -0.085 }
const W = 400
const H = 300
const px = (lat: number, lng: number) => ({
  x: ((Math.min(Math.max(lng, B.minLng), B.maxLng) - B.minLng) / (B.maxLng - B.minLng)) * W,
  y: ((B.maxLat - Math.min(Math.max(lat, B.minLat), B.maxLat)) / (B.maxLat - B.minLat)) * H,
})

function BrightonSvg() {
  const coast = [
    [50.8232, -0.195],
    [50.8222, -0.175],
    [50.8214, -0.16],
    [50.82, -0.145],
    [50.8178, -0.136],
    [50.8168, -0.125],
    [50.8158, -0.11],
    [50.8145, -0.095],
    [50.8135, -0.085],
  ].map(([a, b]) => px(a, b))
  const coastPath = coast.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const road = (pts: number[][]) => pts.map(([a, b], i) => {
    const p = px(a, b)
    return `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
  }).join(' ')
  const park = (lat: number, lng: number, rx: number, ry: number) => {
    const p = px(lat, lng)
    return <ellipse cx={p.x} cy={p.y} rx={rx} ry={ry} fill="#dfe8c9" />
  }
  const pier = px(50.8178, -0.1365)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
      <rect width={W} height={H} fill="#f3efe3" />
      {Array.from({ length: 14 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 30 + 8} y1={0} x2={i * 30 - 6} y2={H} stroke="#ebe6d6" strokeWidth={1.2} />
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 30 + 4} x2={W} y2={i * 30 - 4} stroke="#ebe6d6" strokeWidth={1.2} />
      ))}
      {park(50.8405, -0.147, 22, 15)}
      {park(50.8318, -0.1335, 8, 12)}
      {park(50.8237, -0.1625, 26, 5)}
      {park(50.838, -0.095, 34, 18)}
      {park(50.8325, -0.115, 12, 10)}
      <path d={road([[50.846, -0.1395], [50.835, -0.1372], [50.826, -0.1385], [50.8185, -0.137]])} stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d={road([[50.8286, -0.195], [50.8282, -0.17], [50.827, -0.15], [50.8262, -0.139]])} stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d={road([[50.8262, -0.139], [50.8285, -0.12], [50.832, -0.105], [50.838, -0.085]])} stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d={road([[50.846, -0.165], [50.835, -0.158], [50.8262, -0.148]])} stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d={`${coastPath} L${W},${H} L0,${H} Z`} fill="#d8eaf0" />
      <path d={coastPath} stroke="#e6dcc0" strokeWidth={5} fill="none" />
      <line x1={pier.x} y1={pier.y} x2={pier.x + 2} y2={pier.y + 22} stroke="#c9bfa5" strokeWidth={4} strokeLinecap="round" />
      <text x={pier.x + 6} y={pier.y + 24} fontSize="9" fill="#6f6d66" fontFamily="Space Grotesk">Palace Pier</text>
      <text x={W - 90} y={H - 14} fontSize="10" fill="#6f8f9a" fontFamily="Space Grotesk" letterSpacing="2">ENGLISH CHANNEL</text>
      <text x={px(50.8395, -0.147).x - 24} y={px(50.8395, -0.147).y + 4} fontSize="9" fill="#5d6a46" fontFamily="Space Grotesk">Preston Park</text>
      <text x={px(50.83, -0.18).x} y={px(50.83, -0.18).y - 8} fontSize="11" fill="#9b9990" fontFamily="Space Grotesk" fontWeight="600">HOVE</text>
      <text x={px(50.832, -0.125).x} y={px(50.832, -0.125).y - 22} fontSize="11" fill="#9b9990" fontFamily="Space Grotesk" fontWeight="600">BRIGHTON</text>
    </svg>
  )
}

export function MapView({ opps, onUseList }: { opps: Opportunity[]; onUseList: () => void }) {
  const s = useStore()
  const nav = useNav()
  const [sel, setSel] = useState<string | null>(null)
  const selected = opps.find((o) => o.id === sel)
  const me = px(s.origin.lat, s.origin.lng)

  if (s.offline)
    return (
      <div className="mx-5 flex h-[300px] flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-quiet bg-paper px-6 text-center" role="status">
        <CloudOff className="size-9 text-ink" aria-hidden />
        <p className="mt-3 text-[17px] font-semibold text-ink">The map couldn’t load</p>
        <p className="mt-1 text-[15px] text-grey">You seem to be offline. The list view has every good deed and still works.</p>
        <Button className="mt-4" icon={List} onClick={onUseList}>
          Use list view
        </Button>
      </div>
    )

  return (
    <div className="mx-5">
      <div className="relative h-[340px] overflow-hidden rounded-[28px] shadow-soft">
        <BrightonSvg />
        <span className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${(me.x / W) * 100}%`, top: `${(me.y / H) * 100}%` }} aria-hidden>
          <span className="block size-4 rounded-full border-[3px] border-white bg-[#3b82f6] shadow" />
        </span>
        {opps.map((o) => {
          const p = px(o.lat, o.lng)
          const Icon = CATEGORY_ICON[o.category]
          const on = sel === o.id
          return (
            <button
              key={o.id}
              type="button"
              aria-label={`${o.title}, ${fmtShort(o.date)} ${o.startTime}, ${s.distance(o).toFixed(1)} miles`}
              aria-pressed={on}
              onClick={() => setSel(on ? null : o.id)}
              className={cx('absolute flex size-11 -translate-x-1/2 -translate-y-full items-end justify-center transition', on && 'z-10 scale-110')}
              style={{ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` }}
            >
              <span className={cx('flex size-8 items-center justify-center rounded-full rounded-br-none border-2 border-white shadow-lift rotate-45', on ? 'bg-ink text-paper' : 'bg-signal text-ink')}>
                <Icon className="size-4 -rotate-45" aria-hidden />
              </span>
            </button>
          )
        })}
        <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-3 py-1.5 text-[13px] font-medium text-ink backdrop-blur">
          {opps.length} on the map · tap a pin
        </span>
        {selected && (
          <div className="anim-sheet absolute inset-x-3 bottom-3 rounded-[20px] bg-paper p-3 shadow-soft">
            <div className="flex items-start gap-3">
              <img src={selected.image} alt="" className="size-14 shrink-0 rounded-[12px] object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-semibold text-ink">{selected.title}</p>
                <p className="text-[14px] text-grey">
                  {fmtShort(selected.date)}, {selected.startTime} · {fmtHrs(selected.hours)}
                </p>
                <p className="flex items-center gap-1 text-[14px] text-grey">
                  <MapPin className="size-3.5" aria-hidden /> {s.distance(selected).toFixed(1)} mi ·{' '}
                  {selected.type === 'group' ? <Users className="size-3.5" aria-hidden /> : <UserIcon className="size-3.5" aria-hidden />}
                  {s.spacesLeft(selected)} {s.spacesLeft(selected) === 1 ? 'space' : 'spaces'} left
                </p>
              </div>
              <IconButton label="Close preview" icon={X} onClick={() => setSel(null)} className="-mr-1 -mt-1" />
            </div>
            <Button full size="sm" className="mt-2" onClick={() => nav.push({ name: 'detail', id: selected.id })}>
              View
            </Button>
          </div>
        )}
      </div>
      <p className="mt-2 text-[13px] text-util">Every good deed on the map is also in the list view.</p>
    </div>
  )
}

export function MiniMap({ o }: { o: Opportunity }) {
  const s = useStore()
  const p = px(o.lat, o.lng)
  const Icon = CATEGORY_ICON[o.category]
  if (s.offline)
    return (
      <div className="flex h-[150px] items-center justify-center gap-2 rounded-[20px] bg-mist/60 px-4 text-center text-[14px] text-grey" role="status">
        <CloudOff className="size-5 shrink-0" aria-hidden /> Map unavailable offline – the address above still works.
      </div>
    )
  return (
    <div className="relative h-[150px] overflow-hidden rounded-[20px]" role="img" aria-label={`Map showing ${o.place}`}>
      <div className="absolute inset-0" style={{ transform: `scale(2.4)`, transformOrigin: `${(p.x / W) * 100}% ${(p.y / H) * 100}%` }}>
        <BrightonSvg />
      </div>
      <span className="absolute left-1/2 top-1/2 flex size-9 -translate-x-1/2 -translate-y-full rotate-45 items-center justify-center rounded-full rounded-br-none border-2 border-white bg-signal shadow-lift" style={{ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` }} aria-hidden>
        <Icon className="size-4 -rotate-45 text-ink" />
      </span>
    </div>
  )
}
