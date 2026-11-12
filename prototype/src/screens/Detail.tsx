import { useRef, useState } from 'react'
import {
  AlertTriangle,
  BadgeCheck,
  Backpack,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronLeft,
  Clock,
  Flag,
  Gift,
  Hand,
  HeartHandshake,
  Home,
  Accessibility,
  Mail,
  MapPin,
  PartyPopper,
  Share2,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  User as UserIcon,
  Wifi,
  Wrench,
  XCircle,
  Hourglass,
  CircleCheck,
  Settings2,
} from 'lucide-react'
import { catName, POSTER_ABOUT, type Opportunity } from '../data'
import { useStore } from '../store'
import { useNav } from '../nav'
import { deedCaption, downloadIcs, endTime, fmtDate, fmtHours, oppLink, share, shareCaption } from '../utils'
import { Banner, Button, Checkbox, IconButton, InfoRow, Sheet, StatusBadge, Tag, cx } from '../components/ui'
import { OppListCard, SaveButton } from '../components/OppCard'
import { MiniMap } from '../components/MapView'

export function useShare() {
  const nav = useNav()
  return async (text: string, url: string) => {
    const r = await share(text, url)
    if (r === 'copied') nav.toast('Copied – paste it anywhere', 'ok')
  }
}

export function useCancelFlow() {
  const s = useStore()
  const nav = useNav()
  return (o: Opportunity) =>
    nav.alert({
      sheet: true,
      title: `Cancel your place at ${o.title}?`,
      message: `Your space on ${fmtDate(o.date)} will be freed up for someone else. ${s.posterName(o.posterId)} will see you’re no longer coming. You can join again later if there are spaces.`,
      actions: [
        {
          label: 'Cancel my place',
          style: 'destructive',
          onPress: () => {
            s.cancel(o.id)
            nav.toast('Your place has been cancelled')
          },
        },
        { label: 'Keep my place', style: 'cancel' },
      ],
    })
}

export function useDoneFlow() {
  const s = useStore()
  const nav = useNav()
  return (o: Opportunity) => {
    s.markDone(o.id)
    nav.toast(
      o.status === 'completed' ? `Confirmed – +${o.hours * 10} points added` : 'Nice one! Your hours are pending until the organiser confirms.',
      'ok',
    )
  }
}

export function useJoin() {
  const s = useStore()
  const nav = useNav()
  const [busy, setBusy] = useState(false)
  const go = (o: Opportunity) => {
    if (!nav.requireAccount(`Create a free account to join ${o.title}. It takes under a minute.`, o.id)) return
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      const r = s.join(o.id)
      if (r === 'ok') nav.present({ name: 'joined', id: o.id })
      else if (r === 'offline')
        nav.alert({
          title: 'We couldn’t join you just now',
          message: 'It looks like you’re offline, so your place isn’t saved yet. Check your connection and try again.',
          actions: [
            { label: 'Not now', style: 'cancel' },
            { label: 'Try again', style: 'bold', onPress: () => go(o) },
          ],
        })
      else if (r === 'full') nav.toast('Sorry – this good deed just filled up', 'error')
    }, 650)
  }
  return { busy, go }
}

function Fact({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="rounded-[20px] bg-paper p-3 shadow-soft">
      <Icon className="size-5 text-ink" aria-hidden />
      <p className="mt-2 text-[13px] text-util">{label}</p>
      <p className="text-[16px] font-semibold leading-tight text-ink">{value}</p>
    </div>
  )
}
function Block({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section className="px-5 pt-7" aria-labelledby={id}>
      <h2 id={id} className="pb-2 text-[20px] font-semibold tracking-[-0.01em] text-ink">
        {title}
      </h2>
      {children}
    </section>
  )
}

export function DetailScreen({ id }: { id: string }) {
  const s = useStore()
  const nav = useNav()
  const o = s.opp(id)
  const shareIt = useShare()
  const cancelFlow = useCancelFlow()
  const doneFlow = useDoneFlow()
  const { busy, go } = useJoin()
  const scrollRef = useRef<HTMLDivElement>(null)
  if (!o) return null

  const su = s.mySignup(o.id)
  const st = su?.status
  const mine = s.me?.id === o.posterId
  const left = s.spacesLeft(o)
  const poster = s.posterName(o.posterId)
  const posterUser = s.db.users.find((u) => u.id === o.posterId)
  const posterVerified = posterUser ? posterUser.idVerified : o.posterId !== 'u-ben'
  const reasons = s.matchReasons(o)
  const related = s.findable.filter((x) => x.id !== o.id && (x.category === o.category || x.posterId === o.posterId)).slice(0, 3)
  const timeRange = `${o.startTime}–${endTime(o.startTime, o.hours)}`
  const points = o.hours * 10

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-6">
        <div className="relative h-[300px] bg-mist">
          <img src={o.image} alt={o.imageAlt} className="size-full object-cover" />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/35 to-transparent" aria-hidden />
          <div className="absolute inset-x-0 flex items-center justify-between px-3" style={{ top: 'calc(var(--safe-top) + 4px)' }}>
            <IconButton label="Back" icon={ChevronLeft} tone="glass" onClick={nav.pop} />
            <div className="flex gap-2">
              <IconButton label="Share this good deed" icon={Share2} tone="glass" onClick={() => shareIt(shareCaption(o), oppLink(o))} />
              <SaveButton o={o} />
            </div>
          </div>
          <div className="absolute bottom-4 left-5 flex gap-1.5">
            <Tag tone="signal">{catName(o.category)}</Tag>
            {o.online && <Tag tone="white" icon={Wifi}>Online</Tag>}
          </div>
        </div>

        <div className="-mt-4 rounded-t-[28px] bg-cream px-5 pt-5 relative">
          {st && st !== 'cancelled' && (
            <div className="mb-3">
              <StatusBadge kind={st} />
            </div>
          )}
          {o.status === 'completed' && !st && <div className="mb-3"><StatusBadge kind="completed" label="This good deed has finished" /></div>}
          <h1 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink">{o.title}</h1>
          <p className="mt-2 text-[16px] text-grey">
            Posted by <span className="font-semibold text-ink">{poster}</span> · {o.place}
          </p>

          {reasons.length > 0 && !st && (
            <p className="mt-4 flex items-start gap-2 rounded-[20px] bg-pale p-3 text-[15px] leading-snug text-ink">
              <Sparkles className="mt-0.5 size-5 shrink-0" aria-hidden />
              <span>
                <span className="font-semibold">Why it’s a match: </span>
                {reasons.join(' · ')}
              </span>
            </p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <Fact icon={CalendarDays} label="Date" value={fmtDate(o.date)} />
            <Fact icon={Clock} label="Time" value={`${timeRange} · ${fmtHours(o.hours)}`} />
            <Fact icon={o.type === 'group' ? Users : UserIcon} label={o.type === 'group' ? 'Group' : 'Individual'} value={o.status === 'completed' ? 'Closed' : `${left} of ${o.capacity} ${o.capacity === 1 ? 'space' : 'spaces'} left`} />
            <Fact icon={Gift} label="Points available" value={`${points} points`} />
          </div>
          <p className="mt-3 text-[14px] text-util">One-off good deed. No ongoing commitment.</p>
        </div>

        <Block title="About" id="about-h">
          <p className="text-[16px] leading-relaxed text-grey">{o.description}</p>
          {o.tasks.length > 0 && (
            <>
              <h3 className="pt-4 text-[16px] font-semibold text-ink">What you’ll do</h3>
              <ul className="mt-2 space-y-2">
                {o.tasks.map((t) => (
                  <li key={t} className="flex gap-2 text-[16px] leading-snug text-grey">
                    <Check className="mt-0.5 size-5 shrink-0 text-ink" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="mt-4 flex flex-wrap gap-1.5">
            <Tag tone="line" icon={o.indoorOutdoor === 'outdoor' ? Sun : Home}>{o.indoorOutdoor === 'outdoor' ? 'Outdoor' : 'Indoor'}</Tag>
            <Tag tone="line" icon={Hand}>{o.manual ? 'Hands-on' : 'Non-manual'}</Tag>
            <Tag tone="line" icon={o.type === 'group' ? Users : UserIcon}>{o.type === 'group' ? 'Group' : 'Individual'}</Tag>
            <Tag tone="line" icon={o.online ? Wifi : MapPin}>{o.online ? 'Online' : 'In person'}</Tag>
          </div>
        </Block>

        <Block title="Where to go" id="where-h">
          <div className="rounded-[20px] bg-paper p-4 shadow-soft">
            <p className="text-[16px] font-semibold text-ink">{o.place}</p>
            <p className="mt-0.5 text-[15px] text-grey">
              {o.address}
              {!o.online && `, ${o.postcode}`}
            </p>
            {!o.online && <p className="mt-1 text-[14px] text-util">{s.distance(o).toFixed(1)} miles from {s.origin.area}</p>}
            {!o.online && <div className="mt-3"><MiniMap o={o} /></div>}
          </div>
        </Block>

        <Block title="Before you join" id="before-h">
          <div className="divide-y divide-mist rounded-[20px] bg-paper px-4 shadow-soft">
            <InfoRow icon={Wrench} label="Skills needed">
              {o.skills.length ? o.skills.join(', ') : 'None – everyone’s welcome'}
            </InfoRow>
            <InfoRow icon={HeartHandshake} label="Support provided">
              {o.provided}
            </InfoRow>
            <InfoRow icon={Backpack} label="What to bring">
              {o.bring.join(' · ')}
            </InfoRow>
            <InfoRow icon={Accessibility} label="Accessibility">
              {o.access}
            </InfoRow>
            <InfoRow icon={ShieldCheck} label="Who can take part">
              Anyone aged 16 or over with a Good Deeds account. No background check needed.
            </InfoRow>
          </div>
        </Block>

        <Block title="What happens next" id="next-h">
          <ol className="space-y-3">
            {[
              ['Join in one tap', 'Your space is held straight away – no application or approval.'],
              ['Turn up on the day', `Meet ${poster} at ${o.place} at ${o.startTime}. Add it to your calendar so you don’t forget.`],
              ['Tap “I’ve done it”', `Afterwards, log your ${fmtHours(o.hours)}. They show as pending.`],
              ['The organiser confirms', `Once ${poster} marks it complete, your hours are confirmed and you get ${points} points.`],
            ].map(([t, b], i) => (
              <li key={t} className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-signal text-[15px] font-bold text-ink" aria-hidden>
                  {i + 1}
                </span>
                <div>
                  <p className="text-[16px] font-semibold text-ink">{t}</p>
                  <p className="text-[15px] leading-snug text-grey">{b}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 rounded-[20px] bg-pale p-4 text-[15px] leading-snug text-ink">
            <span className="font-semibold">Plans changed?</span> You can cancel any time before the organiser marks it complete. Your space goes to someone else – there’s no penalty.
          </p>
        </Block>

        <Block title="Organiser" id="org-h">
          <div className="rounded-[20px] bg-paper p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-full bg-soft text-[18px] font-bold text-ink" aria-hidden>
                {poster[0]}
              </span>
              <div className="flex-1">
                <p className="text-[17px] font-semibold text-ink">{poster}</p>
                <p className="text-[14px] text-util">Community organiser</p>
              </div>
              {posterVerified ? <StatusBadge kind="verified" label="ID verified" /> : <StatusBadge kind="unverified" />}
            </div>
            {POSTER_ABOUT[o.posterId] && <p className="mt-3 text-[15px] leading-snug text-grey">{POSTER_ABOUT[o.posterId]}</p>}
            <p className="mt-3 flex gap-2 text-[14px] leading-snug text-util">
              <Mail className="mt-0.5 size-4 shrink-0" aria-hidden />
              Questions before you go? Email help@gooddeeds.example and we’ll pass it on to {poster}.
            </p>
            <p className="mt-2 text-[13px] leading-snug text-util">
              Organisers are local people and groups. Good Deeds checks their ID, not their organisation.
            </p>
          </div>
          <button
            type="button"
            className="mt-3 flex min-h-11 items-center gap-2 text-[15px] font-medium text-grey underline"
            onClick={() =>
              nav.alert({
                sheet: true,
                title: 'Report this good deed',
                message: 'Tell us what’s wrong. The organiser won’t see who reported it.',
                actions: [
                  { label: 'It looks unsafe', onPress: () => nav.toast('Thanks – the Good Deeds team will take a look') },
                  { label: 'It seems misleading or fake', onPress: () => nav.toast('Thanks – the Good Deeds team will take a look') },
                  { label: 'Something else', onPress: () => nav.toast('Thanks – the Good Deeds team will take a look') },
                  { label: 'Cancel', style: 'cancel' },
                ],
              })
            }
          >
            <Flag className="size-4" aria-hidden /> Report this good deed
          </button>
        </Block>

        {related.length > 0 && (
          <Block title="You might also like" id="rel-h">
            <ul className="space-y-3">
              {related.map((r) => (
                <OppListCard key={r.id} o={r} />
              ))}
            </ul>
          </Block>
        )}
      </div>

      {/* Sticky action area */}
      <div className="border-t border-mist bg-paper/95 px-5 pt-3 backdrop-blur" style={{ paddingBottom: 'calc(var(--safe-bottom) + 10px)' }}>
        {mine ? (
          <Button size="lg" full icon={Settings2} onClick={() => nav.push({ name: 'manage', id: o.id })}>
            Manage
          </Button>
        ) : st === 'joined' ? (
          <div>
            <div className="flex items-center gap-2">
              <p className="flex flex-1 items-center gap-1.5 text-[16px] font-semibold text-ink" role="status">
                <CircleCheck className="size-5 text-ok" aria-hidden /> You’re going ✓
              </p>
              <Button size="sm" onClick={() => doneFlow(o)}>
                I’ve done it
              </Button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button size="sm" variant="secondary" icon={CalendarPlus} onClick={() => (downloadIcs(o), nav.toast('Calendar file downloaded', 'ok'))}>
                Add to calendar
              </Button>
              <Button size="sm" variant="ghost" icon={XCircle} onClick={() => cancelFlow(o)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : st === 'pending' ? (
          <div className="flex items-center gap-3 py-1" role="status">
            <Hourglass className="size-6 shrink-0 text-wait" aria-hidden />
            <p className="flex-1 text-[15px] leading-snug text-ink">
              <span className="font-semibold">Pending confirmation.</span> Your {fmtHours(o.hours)} will be confirmed once {poster} marks this complete.
            </p>
          </div>
        ) : st === 'confirmed' ? (
          <div className="flex items-center gap-3">
            <p className="flex flex-1 items-center gap-1.5 text-[15px] font-semibold text-ok">
              <BadgeCheck className="size-5" aria-hidden /> Confirmed · +{su!.points} points
            </p>
            <Button size="sm" variant="secondary" icon={Share2} onClick={() => shareIt(deedCaption(o), oppLink(o))}>
              Share your deed
            </Button>
          </div>
        ) : o.status === 'completed' ? (
          <p className="py-3 text-center text-[16px] font-semibold text-util">This good deed has finished</p>
        ) : left === 0 ? (
          <p className="py-3 text-center text-[16px] font-semibold text-util" role="status">This opportunity is full</p>
        ) : (
          <div className="flex items-center gap-4">
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-ink">
                {fmtDate(o.date).replace(/^(\w{3})\w*/, '$1')}, {o.startTime}
              </p>
              <p className="text-[13px] text-util">
                {fmtHours(o.hours)} · {points} points
              </p>
            </div>
            <Button size="lg" className="flex-1" loading={busy} onClick={() => go(o)}>
              {st === 'cancelled' ? 'Join again' : 'Join'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ============ Joined confirmation (full-screen sheet) ============ */
export function JoinedSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const s = useStore()
  const nav = useNav()
  const shareIt = useShare()
  const o = s.opp(id)!
  const poster = s.posterName(o.posterId)
  return (
    <Sheet onClose={onClose} full label="You’re going">
      <div className="px-5 pb-8 pt-2">
        <div className="flex flex-col items-center text-center" role="status" aria-live="polite">
          <span className="anim-pop flex size-20 items-center justify-center rounded-full bg-signal" aria-hidden>
            <PartyPopper className="size-9 text-ink" />
          </span>
          <h2 className="mt-4 text-[30px] font-semibold tracking-[-0.02em] text-ink">You’re going ✓</h2>
          <p className="mt-1 text-[16px] text-grey">Your space at {o.title} is held. No approval needed.</p>
        </div>

        <div className="mt-6 overflow-hidden rounded-[28px] bg-paper shadow-soft">
          <img src={o.image} alt="" className="h-28 w-full object-cover" />
          <div className="divide-y divide-mist px-4">
            <InfoRow icon={CalendarDays} label="When">
              {fmtDate(o.date, true)}, {o.startTime}–{endTime(o.startTime, o.hours)}
            </InfoRow>
            <InfoRow icon={MapPin} label="Where">
              {o.place}
              <span className="block text-[14px] text-grey">{o.address}</span>
            </InfoRow>
            <InfoRow icon={UserIcon} label="Organiser">
              {poster} · contact via help@gooddeeds.example
            </InfoRow>
          </div>
        </div>

        <div className="mt-4 rounded-[20px] bg-pale p-4">
          <p className="text-[16px] font-semibold text-ink">Get ready</p>
          <ul className="mt-2 space-y-1.5">
            {o.bring.map((b) => (
              <li key={b} className="flex gap-2 text-[15px] text-ink">
                <Backpack className="mt-0.5 size-4 shrink-0" aria-hidden /> {b}
              </li>
            ))}
            <li className="flex gap-2 text-[15px] text-ink">
              <HeartHandshake className="mt-0.5 size-4 shrink-0" aria-hidden /> {o.provided}
            </li>
          </ul>
        </div>

        <div className="mt-4 rounded-[20px] bg-paper p-4 shadow-soft">
          <p className="text-[16px] font-semibold text-ink">After the day</p>
          <p className="mt-1 text-[15px] leading-snug text-grey">
            Tap <span className="font-semibold text-ink">I’ve done it</span> in My deeds. When {poster} confirms, you’ll get {o.hours * 10} points to spend locally.
          </p>
        </div>

        <div className="mt-6 space-y-2">
          <Button size="lg" full icon={CalendarPlus} onClick={() => (downloadIcs(o), nav.toast('Calendar file downloaded', 'ok'))}>
            Add to calendar
          </Button>
          <Button size="lg" variant="secondary" full onClick={() => (onClose(), nav.openOpp(o.id, 'deeds'))}>
            View in My deeds
          </Button>
          <Button variant="ghost" full icon={Share2} onClick={() => shareIt(shareCaption(o), oppLink(o))}>
            Tell a friend about it
          </Button>
          <Button variant="ghost" full onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Sheet>
  )
}

/* ============ Manage (organiser view of own post) ============ */
export function ManageScreen({ id }: { id: string }) {
  const s = useStore()
  const nav = useNav()
  const shareIt = useShare()
  const o = s.opp(id)!
  const att = s.attendees(o.id)
  const confirmedCount = att.filter((a) => a.status === 'confirmed').length
  return (
    <div className="pb-8">
      <div className="px-5">
        <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-ink">{o.title}</h1>
        <p className="mt-1 text-[15px] text-grey">
          {fmtDate(o.date)}, {o.startTime} · {o.place}
        </p>
        <div className="mt-3">{o.status === 'completed' ? <StatusBadge kind="completed" /> : <StatusBadge kind="open" />}</div>
      </div>
      <div className="px-5 pt-6">
        <h2 className="pb-2 text-[20px] font-semibold text-ink">Who’s coming ({att.length + o.otherAttendees})</h2>
        {att.length === 0 && o.otherAttendees === 0 ? (
          <p className="rounded-[20px] bg-pale p-4 text-[15px] text-ink">No one has joined yet. Share your post to spread the word.</p>
        ) : (
          <ul className="divide-y divide-mist rounded-[20px] bg-paper px-4 shadow-soft">
            {att.map((a) => (
              <li key={a.id} className="flex min-h-14 items-center gap-3 py-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-soft font-bold text-ink" aria-hidden>
                  {s.personName(a.userId)[0]}
                </span>
                <span className="flex-1 text-[16px] text-ink">{s.personName(a.userId)}</span>
                <StatusBadge kind={a.status} label={a.status === 'joined' ? 'Joined' : undefined} />
              </li>
            ))}
            {o.otherAttendees > 0 && <li className="py-3 text-[14px] text-util">+ {o.otherAttendees} signed up outside the app</li>}
          </ul>
        )}
      </div>
      <div className="space-y-2 px-5 pt-6">
        <Button size="lg" variant="secondary" full icon={Share2} onClick={() => shareIt(shareCaption(o), oppLink(o))}>
          Share
        </Button>
        {o.status === 'open' ? (
          <Button size="lg" full icon={BadgeCheck} disabled={att.length === 0} onClick={() => nav.present({ name: 'complete', id: o.id })}>
            Mark complete
          </Button>
        ) : (
          <Banner tone="ok" icon={BadgeCheck}>
            Completed. {confirmedCount} {confirmedCount === 1 ? 'volunteer' : 'volunteers'} confirmed. A completed good deed can’t be joined, edited or completed again.
          </Banner>
        )}
      </div>
    </div>
  )
}

export function CompleteSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const s = useStore()
  const nav = useNav()
  const o = s.opp(id)!
  const att = s.attendees(o.id).filter((a) => a.status === 'joined' || a.status === 'pending')
  const [ticked, setTicked] = useState<string[]>(att.map((a) => a.userId))
  return (
    <Sheet
      title="Confirm hours for everyone who took part?"
      onClose={onClose}
      footer={
        <Button
          size="lg"
          full
          onClick={() => {
            const r = s.markComplete(o.id, ticked)
            onClose()
            nav.alert({ title: `Done! ${r.count} ${r.count === 1 ? 'volunteer' : 'volunteers'} confirmed for ${r.hours} total hours.`, actions: [{ label: 'OK', style: 'bold' }] })
          }}
        >
          Confirm {ticked.length} {ticked.length === 1 ? 'person' : 'people'}
        </Button>
      }
    >
      <div className="px-5 pb-4">
        <p className="text-[15px] leading-snug text-grey">
          Untick anyone who didn’t come. Ticked people get {fmtHours(o.hours)} confirmed and {o.hours * 10} points. Unticked people get no hours or points.
        </p>
        <div className="mt-3 divide-y divide-mist rounded-[20px] bg-paper px-4 shadow-soft">
          {att.map((a) => (
            <Checkbox key={a.id} id={`att-${a.id}`} checked={ticked.includes(a.userId)} onChange={(v) => setTicked(v ? [...ticked, a.userId] : ticked.filter((x) => x !== a.userId))}>
              <span className="flex items-center gap-2 py-2">
                {s.personName(a.userId)}
                <span className={cx('text-[13px]', a.status === 'pending' ? 'text-wait' : 'text-util')}>{a.status === 'pending' ? 'Said they’ve done it' : 'Joined'}</span>
              </span>
            </Checkbox>
          ))}
        </div>
        <p className="mt-3 flex items-start gap-2 text-[13px] text-util">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> This can’t be undone.
        </p>
      </div>
    </Sheet>
  )
}
