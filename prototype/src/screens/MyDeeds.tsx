import { useState } from 'react'
import { Bookmark, CalendarPlus, CalendarX2, CheckCircle2, ChevronRight, Hourglass, MapPin, Search, Share2, Clock } from 'lucide-react'
import type { Opportunity, Signup } from '../data'
import { useStore } from '../store'
import { useNav } from '../nav'
import { dayParts, deedCaption, downloadIcs, endTime, fmtDate, fmtHours, oppLink, relDay } from '../utils'
import { Button, EmptyState, LargeTitle, Segmented, StatusBadge, cx } from '../components/ui'
import { OppListCard } from '../components/OppCard'
import { useCancelFlow, useDoneFlow, useShare } from './Detail'

export function CommitmentCard({ o, su }: { o: Opportunity; su: Signup }) {
  const s = useStore()
  const nav = useNav()
  const done = useDoneFlow()
  const cancel = useCancelFlow()
  const shareIt = useShare()
  const d = dayParts(o.date)
  const rel = relDay(o.date)
  const poster = s.posterName(o.posterId)
  return (
    <li className={cx('rounded-[20px] bg-paper shadow-soft', su.status === 'cancelled' && 'opacity-80')}>
      <button type="button" onClick={() => nav.push({ name: 'detail', id: o.id })} className="flex w-full gap-3 p-4 text-left">
        <span className={cx('flex w-14 shrink-0 flex-col items-center justify-center rounded-[14px] py-2', su.status === 'joined' ? 'bg-signal' : 'bg-pale')} aria-hidden>
          <span className="text-[12px] font-semibold uppercase text-ink">{d.dow}</span>
          <span className="text-[22px] font-bold leading-none text-ink">{d.day}</span>
          <span className="text-[12px] font-medium text-ink">{d.mon}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="mb-1 flex flex-wrap items-center gap-1.5">
            <StatusBadge kind={su.status} />
            {rel && su.status === 'joined' && <span className="text-[13px] font-semibold text-ink">{rel}</span>}
          </span>
          <span className="block text-[17px] font-semibold leading-snug text-ink">{o.title}</span>
          <span className="mt-0.5 flex items-center gap-1 text-[14px] text-grey">
            <Clock className="size-3.5" aria-hidden /> {fmtDate(o.date)}, {o.startTime}–{endTime(o.startTime, o.hours)}
          </span>
          <span className="flex items-center gap-1 text-[14px] text-grey">
            <MapPin className="size-3.5" aria-hidden /> {o.place} · {poster}
          </span>
          {su.status === 'pending' && <span className="mt-1 block text-[14px] text-wait">{fmtHours(o.hours)} waiting for {poster} to confirm</span>}
          {su.status === 'confirmed' && <span className="mt-1 block text-[14px] font-medium text-ok">{fmtHours(o.hours)} confirmed · +{su.points} points</span>}
        </span>
        <ChevronRight className="mt-1 size-5 shrink-0 text-util" aria-hidden />
      </button>
      {su.status === 'joined' && (
        <div className="grid grid-cols-3 gap-2 border-t border-mist p-3">
          <Button size="sm" onClick={() => done(o)}>
            I’ve done it
          </Button>
          <Button size="sm" variant="secondary" icon={CalendarPlus} onClick={() => (downloadIcs(o), nav.toast('Calendar file downloaded', 'ok'))} aria-label={`Add ${o.title} to calendar`}>
            Calendar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => cancel(o)} aria-label={`Cancel your place at ${o.title}`}>
            Cancel
          </Button>
        </div>
      )}
      {su.status === 'confirmed' && (
        <div className="border-t border-mist p-3">
          <Button size="sm" variant="secondary" full icon={Share2} onClick={() => shareIt(deedCaption(o), oppLink(o))}>
            Share your good deed
          </Button>
        </div>
      )}
    </li>
  )
}

type Seg = 'upcoming' | 'pending' | 'done' | 'saved'

export function MyDeedsScreen() {
  const s = useStore()
  const nav = useNav()
  const [seg, setSeg] = useState<Seg>('upcoming')
  const mine = s.me ? s.db.signups.filter((x) => x.userId === s.me!.id) : []
  const withOpp = mine.map((su) => ({ su, o: s.opp(su.oppId)! })).filter((x) => x.o)
  const byDate = (a: { o: Opportunity }, b: { o: Opportunity }) => `${a.o.date}${a.o.startTime}`.localeCompare(`${b.o.date}${b.o.startTime}`)
  const upcoming = withOpp.filter((x) => x.su.status === 'joined').sort(byDate)
  const pending = withOpp.filter((x) => x.su.status === 'pending').sort(byDate)
  const confirmed = withOpp.filter((x) => x.su.status === 'confirmed').sort((a, b) => -byDate(a, b))
  // Latest signup per opportunity only, so re-joined deeds don’t also show as cancelled
  const cancelled = withOpp.filter((x) => x.su.status === 'cancelled' && !mine.some((m) => m.oppId === x.o.id && m.status !== 'cancelled'))
  const saved = s.me ? s.db.saved.filter((x) => x.userId === s.me!.id).map((x) => s.opp(x.oppId)!).filter(Boolean) : []
  const st = s.stats()

  const findCta = (
    <Button variant="dark" icon={Search} onClick={() => nav.setTab('find')}>
      Find a good deed
    </Button>
  )

  return (
    <div className="pb-6">
      <LargeTitle sub={st.pendingHours ? `${fmtHours(st.pendingHours)} pending · ${fmtHours(st.confirmedHours)} confirmed` : `${fmtHours(st.confirmedHours)} confirmed so far`}>My deeds</LargeTitle>
      <div className="px-5">
        <Segmented
          label="Show"
          value={seg}
          onChange={setSeg}
          options={[
            { value: 'upcoming', label: `Going${upcoming.length ? ` ${upcoming.length}` : ''}` },
            { value: 'pending', label: `Pending${pending.length ? ` ${pending.length}` : ''}` },
            { value: 'done', label: 'Done' },
            { value: 'saved', label: `Saved${saved.length ? ` ${saved.length}` : ''}` },
          ]}
        />
      </div>
      <div className="pt-4">
        {seg === 'upcoming' &&
          (upcoming.length ? (
            <ul className="space-y-3 px-5">
              {upcoming.map((x) => (
                <CommitmentCard key={x.su.id} {...x} />
              ))}
            </ul>
          ) : (
            <EmptyState icon={CalendarX2} title="Nothing booked yet" body="When you join a good deed it shows here, with everything you need for the day." action={findCta} />
          ))}
        {seg === 'pending' &&
          (pending.length ? (
            <>
              <p className="px-5 pb-3 text-[15px] leading-snug text-grey">
                You’ve said you took part. Hours stay pending until the organiser confirms, then your points arrive.
              </p>
              <ul className="space-y-3 px-5">
                {pending.map((x) => (
                  <CommitmentCard key={x.su.id} {...x} />
                ))}
              </ul>
            </>
          ) : (
            <EmptyState icon={Hourglass} title="Nothing waiting to be confirmed" body="After a good deed, tap “I’ve done it” and it waits here until the organiser confirms your hours." />
          ))}
        {seg === 'done' &&
          (confirmed.length || cancelled.length ? (
            <div className="space-y-3 px-5">
              {confirmed.length > 0 && (
                <ul className="space-y-3">
                  {confirmed.map((x) => (
                    <CommitmentCard key={x.su.id} {...x} />
                  ))}
                </ul>
              )}
              {cancelled.length > 0 && (
                <>
                  <h2 className="pt-4 text-[17px] font-semibold text-ink">Cancelled</h2>
                  <ul className="space-y-3">
                    {cancelled.map((x) => (
                      <CommitmentCard key={x.su.id} {...x} />
                    ))}
                  </ul>
                </>
              )}
            </div>
          ) : (
            <EmptyState icon={CheckCircle2} title="Your confirmed deeds will live here" body="Each one shows the hours and points you earned, and you can share it if you like." action={findCta} />
          ))}
        {seg === 'saved' &&
          (saved.length ? (
            <ul className="space-y-3 px-5">
              {saved.map((o) => (
                <OppListCard key={o.id} o={o} />
              ))}
            </ul>
          ) : (
            <EmptyState icon={Bookmark} title="No saved good deeds" body="Tap the bookmark on any good deed to keep it here for later." action={findCta} />
          ))}
      </div>
    </div>
  )
}
