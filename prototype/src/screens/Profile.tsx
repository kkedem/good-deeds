import { useEffect, useState } from 'react'
import {
  BadgeCheck,
  Bell,
  ChevronRight,
  FileText,
  FlaskConical,
  LogOut,
  Megaphone,
  Repeat,
  SlidersHorizontal,
  Sparkles,
  Ticket,
  UserRound,
  Search,
} from 'lucide-react'
import { catName, type CategoryId } from '../data'
import { EMPTY_FILTERS, useStore } from '../store'
import { useNav } from '../nav'
import { fmtDate, fmtHours } from '../utils'
import { Button, Card, EmptyState, StatusBadge, Tag, cx } from '../components/ui'
import { PrefsEditor, VerifyId, type Prefs } from './Auth'

function Row({ icon: Icon, label, onClick, sub, danger }: { icon: typeof Bell; label: string; onClick: () => void; sub?: string; danger?: boolean }) {
  return (
    <li>
      <button type="button" onClick={onClick} className="flex min-h-14 w-full items-center gap-3 px-4 text-left active:bg-mist/50">
        <Icon className={cx('size-5 shrink-0', danger ? 'text-bad' : 'text-ink')} aria-hidden />
        <span className="flex-1">
          <span className={cx('block text-[16px] font-medium', danger ? 'text-bad' : 'text-ink')}>{label}</span>
          {sub && <span className="block text-[13px] text-util">{sub}</span>}
        </span>
        {!danger && <ChevronRight className="size-5 text-util" aria-hidden />}
      </button>
    </li>
  )
}

const prefLabel = {
  indoorOutdoor: { indoor: 'Indoors', outdoor: 'Outdoors', either: 'Indoors or outdoors' },
  manualPref: { manual: 'Hands-on', nonmanual: 'Non-manual', either: 'Any type of task' },
  soloGroup: { solo: 'Solo', group: 'Group', either: 'Solo or group' },
}

export function ProfileScreen() {
  const s = useStore()
  const nav = useNav()
  const me = s.me!
  const st = s.stats()
  const mine = s.db.signups.filter((x) => x.userId === me.id).map((su) => ({ su, o: s.opp(su.oppId)! })).filter((x) => x.o)
  const history = mine.slice().sort((a, b) => b.o.date.localeCompare(a.o.date))
  const vouchers = s.db.redemptions.filter((r) => r.userId === me.id)
  const posts = s.db.opps.filter((o) => o.posterId === me.id)
  const confirmedOpps = st.confirmed.map((c) => s.opp(c.oppId)!).filter(Boolean)
  const causes = [...new Set(confirmedOpps.map((o) => o.category))] as CategoryId[]
  const organisers = [...new Set(confirmedOpps.map((o) => o.posterId))]
  const last = confirmedOpps.sort((a, b) => b.date.localeCompare(a.date))[0]
  const sameOrg = last ? s.findable.find((o) => o.posterId === last.posterId && !s.mySignup(o.id)) : undefined

  return (
    <div className="pb-8">
      <div className="px-5 pt-2">
        <div className="flex items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-full bg-signal text-[26px] font-bold text-ink" aria-hidden>
            {me.firstName[0]}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-ink">{me.firstName}</h1>
            <p className="text-[15px] text-util">
              {me.postcode.split(' ')[0]} · {s.origin.area}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {me.idVerified ? (
            <StatusBadge kind="verified" label="Verified ✓" />
          ) : (
            <>
              <StatusBadge kind="unverified" />
              <button type="button" onClick={() => nav.push({ name: 'verify' })} className="min-h-11 px-1 text-[15px] font-semibold text-ink underline">
                Verify now
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2.5 px-5">
        <div className="rounded-[20px] bg-signal p-3">
          <p className="text-[28px] font-semibold leading-none text-ink">{st.confirmedHours}</p>
          <p className="mt-1.5 text-[13px] font-medium leading-tight text-ink">Confirmed hours</p>
        </div>
        <div className="rounded-[20px] bg-paper p-3 shadow-soft">
          <p className="text-[28px] font-semibold leading-none text-ink">{st.pendingHours}</p>
          <p className="mt-1.5 text-[13px] font-medium leading-tight text-grey">Pending hours</p>
        </div>
        <button type="button" onClick={() => nav.setTab('rewards')} className="rounded-[20px] bg-paper p-3 text-left shadow-soft active:scale-[0.98]">
          <p className="text-[28px] font-semibold leading-none text-ink">{st.points}</p>
          <p className="mt-1.5 flex items-center text-[13px] font-medium leading-tight text-grey">
            Points <ChevronRight className="size-3.5" aria-hidden />
          </p>
        </button>
      </div>

      <section className="px-5 pt-6" aria-labelledby="impact-h">
        <h2 id="impact-h" className="pb-2 text-[20px] font-semibold text-ink">
          Your impact
        </h2>
        {st.deeds > 0 ? (
          <Card className="p-5">
            <p className="text-[18px] leading-snug text-ink">
              You’ve given <span className="font-semibold">{fmtHours(st.confirmedHours)}</span> across{' '}
              <span className="font-semibold">
                {st.deeds} good {st.deeds === 1 ? 'deed' : 'deeds'}
              </span>
              , helping {organisers.length} local {organisers.length === 1 ? 'organiser' : 'organisers'}.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {causes.map((c) => (
                <Tag key={c} tone="soft">
                  {catName(c)}
                </Tag>
              ))}
            </div>
            {me.skills.length > 0 && <p className="mt-3 text-[14px] text-util">Skills you offer: {me.skills.join(', ')}</p>}
            <p className="mt-3 text-[13px] text-util">Only counts hours your organisers have confirmed.</p>
          </Card>
        ) : (
          <Card className="p-5">
            <p className="text-[16px] leading-snug text-ink">Your confirmed hours, causes and points will show here after your first good deed.</p>
          </Card>
        )}
      </section>

      <section className="px-5 pt-6" aria-labelledby="next-h">
        <h2 id="next-h" className="pb-2 text-[20px] font-semibold text-ink">
          What next?
        </h2>
        <ul className="divide-y divide-mist overflow-hidden rounded-[20px] bg-paper shadow-soft">
          {last && (
            <Row
              icon={Repeat}
              label={`Find another ${catName(last.category).toLowerCase()} good deed`}
              sub={`You enjoyed ${last.title}`}
              onClick={() => {
                s.setFilters({ ...EMPTY_FILTERS, cats: [last.category] })
                s.setView('list')
                nav.setTab('find')
              }}
            />
          )}
          {sameOrg && <Row icon={Sparkles} label={`Volunteer with ${s.posterName(sameOrg.posterId)} again`} sub={sameOrg.title} onClick={() => nav.push({ name: 'detail', id: sameOrg.id })} />}
          <Row icon={SlidersHorizontal} label="Update your preferences" sub="Changes your recommendations straight away" onClick={() => nav.push({ name: 'prefs' })} />
          {!last && <Row icon={Search} label="Find your first good deed" onClick={() => nav.setTab('find')} />}
        </ul>
      </section>

      <section className="px-5 pt-6" aria-labelledby="hist-h">
        <h2 id="hist-h" className="pb-2 text-[20px] font-semibold text-ink">
          History
        </h2>
        {history.length ? (
          <ul className="divide-y divide-mist overflow-hidden rounded-[20px] bg-paper shadow-soft">
            {history.map(({ su, o }) => (
              <li key={su.id}>
                <button type="button" onClick={() => nav.push({ name: 'detail', id: o.id })} className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left active:bg-mist/50">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[16px] font-medium text-ink">{o.title}</span>
                    <span className="block text-[13px] text-util">
                      {fmtDate(o.date)} · {fmtHours(o.hours)}
                    </span>
                  </span>
                  <StatusBadge kind={su.status} label={su.status === 'joined' ? 'Joined' : undefined} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-[20px] bg-pale p-4 text-[15px] text-ink">No good deeds yet – join one from Find.</p>
        )}
      </section>

      <section className="px-5 pt-6" aria-labelledby="v-h">
        <h2 id="v-h" className="pb-2 text-[20px] font-semibold text-ink">
          My vouchers
        </h2>
        {vouchers.length ? (
          <ul className="divide-y divide-mist overflow-hidden rounded-[20px] bg-paper shadow-soft">
            {vouchers.map((r) => {
              const of = s.offers.find((x) => x.id === r.offerId)!
              const b = s.businesses.find((x) => x.id === of.businessId)!
              return (
                <li key={r.id}>
                  <button type="button" onClick={() => nav.push({ name: 'voucher', id: r.id })} className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left active:bg-mist/50">
                    <Ticket className="size-5 shrink-0 text-ink" aria-hidden />
                    <span className="flex-1">
                      <span className="block text-[16px] font-medium text-ink">{of.title}</span>
                      <span className="block text-[13px] text-util">{b.name}</span>
                    </span>
                    <span className="font-mono text-[15px] font-bold tracking-wider text-ink">{r.code}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="rounded-[20px] bg-pale p-4 text-[15px] text-ink">Vouchers you redeem in Rewards show here with their codes.</p>
        )}
      </section>

      {posts.length > 0 && (
        <section className="px-5 pt-6" aria-labelledby="p-h">
          <h2 id="p-h" className="pb-2 text-[20px] font-semibold text-ink">
            My posts
          </h2>
          <ul className="divide-y divide-mist overflow-hidden rounded-[20px] bg-paper shadow-soft">
            {posts.map((o) => (
              <li key={o.id}>
                <button type="button" onClick={() => nav.push({ name: 'manage', id: o.id })} className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left active:bg-mist/50">
                  <Megaphone className="size-5 shrink-0 text-ink" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[16px] font-medium text-ink">{o.title}</span>
                    <span className="block text-[13px] text-util">
                      {fmtDate(o.date)} · {s.attendees(o.id).length + o.otherAttendees} going
                    </span>
                  </span>
                  <StatusBadge kind={o.status === 'completed' ? 'completed' : 'open'} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="px-5 pt-6" aria-labelledby="pref-h">
        <div className="flex items-center justify-between pb-2">
          <h2 id="pref-h" className="text-[20px] font-semibold text-ink">
            Preferences
          </h2>
          <button type="button" onClick={() => nav.push({ name: 'prefs' })} className="min-h-11 px-2 text-[15px] font-semibold text-ink underline">
            Edit
          </button>
        </div>
        <Card className="p-4">
          {me.prefsSet ? (
            <div className="flex flex-wrap gap-1.5">
              <Tag tone="line">{prefLabel.indoorOutdoor[me.indoorOutdoor]}</Tag>
              <Tag tone="line">{prefLabel.manualPref[me.manualPref]}</Tag>
              <Tag tone="line">{prefLabel.soloGroup[me.soloGroup]}</Tag>
              {me.skills.map((sk) => (
                <Tag key={sk} tone="soft">
                  {sk}
                </Tag>
              ))}
            </div>
          ) : (
            <p className="text-[15px] text-ink">Not set yet. Add a few to get “Recommended for you”.</p>
          )}
        </Card>
      </section>

      <section className="px-5 pt-6">
        <ul className="divide-y divide-mist overflow-hidden rounded-[20px] bg-paper shadow-soft">
          <Row icon={Bell} label="Updates" sub="In-app only – no push notifications or emails" onClick={() => nav.push({ name: 'updates' })} />
          <Row icon={FileText} label="Terms & Conditions" onClick={() => nav.push({ name: 'terms' })} />
          <Row icon={FlaskConical} label="Prototype controls" sub="Simulate organiser, offline, reset" onClick={() => nav.present({ name: 'demo' })} />
          <Row
            icon={LogOut}
            label="Log out"
            danger
            onClick={() =>
              nav.alert({
                title: 'Log out of Good Deeds?',
                message: 'Your good deeds, hours and points are kept. Log in with your email to come back.',
                actions: [
                  { label: 'Cancel', style: 'cancel' },
                  { label: 'Log out', style: 'destructive', onPress: () => (s.logout(), nav.setPhase('login')) },
                ],
              })
            }
          />
        </ul>
        <p className="pt-3 text-center text-[13px] text-util">{me.email}</p>
      </section>
    </div>
  )
}

export function PrefsScreen() {
  const s = useStore()
  const nav = useNav()
  const me = s.me!
  const [p, setP] = useState<Prefs>({ indoorOutdoor: me.indoorOutdoor, manualPref: me.manualPref, soloGroup: me.soloGroup, skills: me.skills })
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <p className="text-[16px] text-grey">These shape “Recommended for you”. Changes apply straight away.</p>
        <PrefsEditor value={p} onChange={setP} />
      </div>
      <div className="border-t border-mist bg-cream px-5 pt-3" style={{ paddingBottom: 'calc(var(--safe-bottom) + 12px)' }}>
        <Button
          size="lg"
          full
          onClick={() => {
            s.updateMe({ ...p, prefsSet: true })
            nav.pop()
            nav.toast('Preferences saved – recommendations updated', 'ok')
          }}
        >
          Save preferences
        </Button>
      </div>
    </div>
  )
}

export function VerifyRoute() {
  const nav = useNav()
  return (
    <div className="px-5 pb-8">
      <VerifyId onDone={nav.pop} />
    </div>
  )
}

export function UpdatesScreen() {
  const s = useStore()
  const nav = useNav()
  const notes = s.myNotes
  useEffect(() => {
    const t = setTimeout(s.markNotesSeen, 600)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="pb-8">
      <p className="px-5 pb-4 text-[15px] text-grey">Confirmations and points from organisers. Good Deeds doesn’t send push notifications or emails.</p>
      {notes.length ? (
        <ul className="space-y-3 px-5">
          {notes.map((n) => (
            <li key={n.id}>
              <button type="button" onClick={() => n.oppId && nav.push({ name: 'detail', id: n.oppId })} className="flex w-full items-start gap-3 rounded-[20px] bg-paper p-4 text-left shadow-soft">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-signal" aria-hidden>
                  <BadgeCheck className="size-5 text-ink" />
                </span>
                <span className="flex-1">
                  <span className="block text-[16px] font-medium leading-snug text-ink">{n.text}</span>
                  {!n.seen && <span className="mt-1 inline-block rounded-full bg-ink px-2 py-0.5 text-[12px] font-semibold text-paper">New</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={Bell} title="No updates yet" body="When an organiser confirms your hours, you’ll see it here along with your points." />
      )}
    </div>
  )
}

export function TermsContent() {
  return (
    <div className="space-y-4 px-5 pb-8 text-[16px] leading-relaxed text-grey">
      <p className="rounded-[20px] bg-pale p-4 text-[14px] text-ink">Demo terms for the Good Deeds hackathon prototype. All data is fictional.</p>
      {[
        ['1. Who can use Good Deeds', 'You must be 16 or over. You agree to give accurate details when you sign up.'],
        ['2. Joining good deeds', 'Joining holds a space for you. If you can’t make it, cancel in the app so someone else can take your place.'],
        ['3. Logging hours', 'Only log good deeds you took part in. Hours are confirmed by the organiser, who can decline hours for people who didn’t attend.'],
        ['4. Points and rewards', 'You earn 10 points per confirmed hour. Points have no cash value. Offers are provided by local businesses and may change.'],
        ['5. Safety', 'Organisers are members of the public. Follow their safety briefing and never do a task you feel unsafe doing. Report anything that worries you.'],
        ['6. Posting good deeds', 'Only post low-risk activities you’re organising. Be clear about what’s involved, who can take part and any accessibility details.'],
        ['7. Your data', 'We store your first name, email, date of birth, postcode and preferences. We never store passwords or ID photos. Organisers see your first name only.'],
        ['8. Sharing', 'Sharing uses your phone’s share sheet or a copied link. Nothing is posted for you automatically.'],
      ].map(([t, b]) => (
        <div key={t}>
          <h3 className="text-[17px] font-semibold text-ink">{t}</h3>
          <p className="mt-1">{b}</p>
        </div>
      ))}
    </div>
  )
}

export function GuestProfile() {
  const nav = useNav()
  return (
    <div className="px-5 pt-6">
      <EmptyState
        icon={UserRound}
        title="Your hours and points live here"
        body="Create a free account to join good deeds, track confirmed hours and spend points locally."
        action={
          <div className="flex flex-col gap-2">
            <Button onClick={() => nav.setPhase('signup')}>Create an account</Button>
            <Button variant="ghost" onClick={() => nav.setPhase('login')}>
              Log in
            </Button>
          </div>
        }
      />
    </div>
  )
}
