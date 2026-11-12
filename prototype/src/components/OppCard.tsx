import { Bookmark, CalendarDays, Clock, MapPin, Users, User as UserIcon, Wifi, Sparkles } from 'lucide-react'
import { catName, type Opportunity } from '../data'
import { useStore } from '../store'
import { useNav } from '../nav'
import { fmtHrs, fmtShort, relDay } from '../utils'
import { CategoryBadge, StatusBadge, Tag, cx } from './ui'

export function useSaveToggle() {
  const s = useStore()
  const nav = useNav()
  return (o: Opportunity) => {
    if (!nav.requireAccount('Create an account to save good deeds and come back to them later.')) return
    const now = s.toggleSave(o.id)
    nav.toast(now ? 'Saved to My deeds' : 'Removed from saved', now ? 'ok' : 'default')
  }
}

export function SaveButton({ o, tone = 'glass' }: { o: Opportunity; tone?: 'glass' | 'soft' }) {
  const s = useStore()
  const toggle = useSaveToggle()
  const saved = s.isSaved(o.id)
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Saved – remove ${o.title} from saved` : `Save ${o.title}`}
      onClick={(e) => {
        e.stopPropagation()
        toggle(o)
      }}
      className={cx(
        'flex size-11 shrink-0 items-center justify-center rounded-full transition active:scale-90',
        saved ? 'bg-signal text-ink' : tone === 'glass' ? 'bg-paper/90 text-ink shadow-lift backdrop-blur' : 'border border-mist bg-paper text-ink',
      )}
    >
      <Bookmark className={cx('size-5', saved && 'fill-current')} aria-hidden />
    </button>
  )
}

function useCardState(o: Opportunity) {
  const s = useStore()
  const su = s.mySignup(o.id)
  const left = s.spacesLeft(o)
  const status = su && su.status !== 'cancelled' ? su.status : o.status === 'completed' ? 'completed' : left === 0 ? 'full' : null
  return { su, left, status, dist: s.distance(o) }
}

function Meta({ o, dist }: { o: Opportunity; dist: number }) {
  return (
    <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[14px] text-grey">
      <li className="flex items-center gap-1">
        <CalendarDays className="size-4" aria-hidden />
        {fmtShort(o.date)}, {o.startTime}
      </li>
      <li className="flex items-center gap-1">
        <Clock className="size-4" aria-hidden />
        {fmtHrs(o.hours)}
      </li>
      <li className="flex items-center gap-1">
        {o.online ? <Wifi className="size-4" aria-hidden /> : <MapPin className="size-4" aria-hidden />}
        {o.online ? 'Online' : `${dist.toFixed(1)} mi`}
      </li>
    </ul>
  )
}

/** Compact list card – used in Find list, search results, saved and related */
export function OppListCard({ o }: { o: Opportunity }) {
  const nav = useNav()
  const { left, status, dist } = useCardState(o)
  const rel = relDay(o.date)
  return (
    <li className="relative">
      <button
        type="button"
        onClick={() => nav.push({ name: 'detail', id: o.id })}
        className="flex w-full gap-3 rounded-[20px] bg-paper p-3 text-left shadow-soft transition active:scale-[0.985]"
      >
        <div className="relative size-[96px] shrink-0 overflow-hidden rounded-[14px] bg-mist">
          <img src={o.image} alt="" className="size-full object-cover" loading="lazy" />
          <span className="absolute bottom-1.5 left-1.5">
            <CategoryBadge id={o.category} size="sm" />
          </span>
        </div>
        <div className="min-w-0 flex-1 pr-10">
          <p className="text-[13px] font-medium text-util">{catName(o.category)}</p>
          <h3 className="text-[17px] font-semibold leading-snug text-ink">{o.title}</h3>
          <Meta o={o} dist={dist} />
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {status ? (
              <StatusBadge kind={status as never} />
            ) : (
              <Tag tone="line" icon={o.type === 'group' ? Users : UserIcon}>
                {o.type === 'group' ? `Group · ${left} left` : 'Individual · 1 space'}
              </Tag>
            )}
            {rel && !status && <Tag tone="pale">{rel}</Tag>}
          </div>
        </div>
      </button>
      <span className="absolute right-2 top-2">
        <SaveButton o={o} tone="soft" />
      </span>
    </li>
  )
}

/** Feature card – Recommended for you strip, shows match rationale */
export function OppFeatureCard({ o }: { o: Opportunity }) {
  const s = useStore()
  const nav = useNav()
  const { left, dist } = useCardState(o)
  const reasons = s.matchReasons(o)
  return (
    <li className="relative w-[272px] shrink-0 snap-start">
      <button
        type="button"
        onClick={() => nav.push({ name: 'detail', id: o.id })}
        className="block w-full overflow-hidden rounded-[28px] bg-paper text-left shadow-soft transition active:scale-[0.985]"
      >
        <div className="relative h-[150px] bg-mist">
          <img src={o.image} alt="" className="size-full object-cover" loading="lazy" />
          <div className="absolute left-3 top-3 flex gap-1.5">
            <Tag tone="signal">{catName(o.category)}</Tag>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-[18px] font-semibold leading-snug text-ink">{o.title}</h3>
          <p className="mt-0.5 text-[14px] text-util">
            {s.posterName(o.posterId)} · {o.place}
          </p>
          <Meta o={o} dist={dist} />
          {reasons.length > 0 && (
            <p className="mt-3 flex items-start gap-1.5 rounded-[12px] bg-pale px-3 py-2 text-[14px] leading-snug text-ink">
              <Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                <span className="font-semibold">Matches you: </span>
                {reasons.slice(0, 3).join(' · ')}
              </span>
            </p>
          )}
          <p className="mt-2 text-[13px] font-medium text-util">
            {o.type === 'group' ? `${left} of ${o.capacity} spaces left` : 'Individual · 1 space'} · {o.hours * 10} points
          </p>
        </div>
      </button>
      <span className="absolute right-3 top-3">
        <SaveButton o={o} />
      </span>
    </li>
  )
}
