import { useEffect, useState } from 'react'
import {
  Bell,
  CalendarCheck,
  ChevronRight,
  CloudOff,
  List,
  Map as MapIcon,
  MapPin,
  Search,
  SearchX,
  SlidersHorizontal,
  Sparkles,
  X,
  Info,
} from 'lucide-react'
import { catName, CATEGORIES, SKILLS, type CategoryId } from '../data'
import { EMPTY_FILTERS, activeFilterCount, useStore, type Filters } from '../store'
import { useNav } from '../nav'
import { daysFromToday, fmtDate, relDay } from '../utils'
import { Banner, Button, CATEGORY_ICON, CardSkeleton, Chip, EmptyState, IconButton, RemovableChip, Segmented, Sheet, Skeleton, cx } from '../components/ui'
import { OppFeatureCard, OppListCard } from '../components/OppCard'
import { MapView } from '../components/MapView'
import { Wordmark } from './Auth'

let loadedOnce = false

export function FindScreen() {
  const s = useStore()
  const nav = useNav()
  const [loading, setLoading] = useState(!loadedOnce)
  useEffect(() => {
    if (loadedOnce) return
    const t = setTimeout(() => ((loadedOnce = true), setLoading(false)), 900)
    return () => clearTimeout(t)
  }, [])

  const f = s.filters
  const results = s.applyFilters(s.findable, f)
  const nFilters = activeFilterCount(f)
  const unseen = s.myNotes.filter((n) => !n.seen).length
  const next = s.me
    ? s.db.signups
        .filter((x) => x.userId === s.me!.id && x.status === 'joined')
        .map((x) => s.opp(x.oppId)!)
        .filter((o) => o && daysFromToday(o.date) >= 0)
        .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))[0]
    : undefined
  const searching = f.q.trim().length > 0 || nFilters > 0

  return (
    <div className="pb-6">
      <header className="px-5 pb-2 pt-2">
        <div className="flex items-center justify-between">
          <Wordmark />
          <IconButton label={unseen ? `Updates, ${unseen} new` : 'Updates'} icon={Bell} tone="soft" badge={unseen} onClick={() => (nav.requireAccount('Create an account to get updates about your good deeds.') ? nav.push({ name: 'updates' }) : null)} />
        </div>
        <h1 className="mt-4 text-[30px] font-semibold leading-tight tracking-[-0.02em] text-ink">
          {s.me ? `Hi ${s.me.firstName}, ready for a good deed?` : 'Good deeds near you'}
        </h1>
        <p className="mt-1 flex items-center gap-1 text-[15px] text-util">
          <MapPin className="size-4" aria-hidden />
          {s.me ? `${s.origin.area} · ${s.me.postcode.split(' ')[0]}` : 'Brighton city centre'}
        </p>
      </header>

      <div className="space-y-3 px-5">
        {s.offline && (
          <Banner tone="warn" icon={CloudOff}>
            You’re offline. You can still browse; joining will work once you’re back online.
          </Banner>
        )}
        {s.me && !s.origin.inArea && (
          <Banner icon={Info}>Good deeds are live in Brighton & Hove. Here’s what’s on there.</Banner>
        )}
        {!s.me && (
          <Banner
            icon={Sparkles}
            action={
              <button type="button" className="min-h-11 shrink-0 font-semibold underline" onClick={() => nav.setPhase('signup')}>
                Sign up
              </button>
            }
          >
            You’re looking around as a guest. Sign up to join, save and get recommendations.
          </Banner>
        )}
        {next && (
          <button type="button" onClick={() => nav.openOpp(next.id, 'deeds')} className="flex w-full items-center gap-3 rounded-[20px] bg-ink p-4 text-left text-paper active:opacity-90">
            <CalendarCheck className="size-6 shrink-0 text-signal" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium text-paper/75">Your next good deed · {relDay(next.date) ?? fmtDate(next.date)}</span>
              <span className="block truncate text-[16px] font-semibold">{next.title}</span>
              <span className="block text-[14px] text-paper/80">
                {fmtDate(next.date)}, {next.startTime} · {next.place}
              </span>
            </span>
            <ChevronRight className="size-5 shrink-0" aria-hidden />
          </button>
        )}

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-util" aria-hidden />
          <input
            type="search"
            aria-label="Search good deeds"
            placeholder="Search beach clean, dogs, Hove…"
            value={f.q}
            onChange={(e) => s.setFilters({ ...f, q: e.target.value })}
            className="min-h-[52px] w-full rounded-full border-2 border-mist bg-paper pl-12 pr-12 text-[17px] text-ink outline-none placeholder:text-quiet focus:border-ink"
          />
          {f.q && (
            <span className="absolute right-1 top-1/2 -translate-y-1/2">
              <IconButton label="Clear search" icon={X} onClick={() => s.setFilters({ ...f, q: '' })} />
            </span>
          )}
        </div>
      </div>

      {!searching && (
        <section aria-labelledby="rec-h">
          <div className="flex items-center justify-between px-5 pb-3 pt-6">
            <h2 id="rec-h" className="text-[20px] font-semibold tracking-[-0.01em] text-ink">
              Recommended for you
            </h2>
          </div>
          {loading ? (
            <div className="flex gap-3 overflow-hidden px-5" aria-label="Loading recommendations" role="status">
              {[0, 1].map((i) => (
                <div key={i} className="w-[272px] shrink-0 overflow-hidden rounded-[28px] bg-paper shadow-soft">
                  <Skeleton className="h-[150px] rounded-none" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : s.recommended.length ? (
            <>
              <ul className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-2" aria-label="Recommended good deeds">
                {s.recommended.map((o) => (
                  <OppFeatureCard key={o.id} o={o} />
                ))}
              </ul>
              <p className="px-5 pt-1 text-[13px] text-util">
                Based on your preferences.{' '}
                <button type="button" className="min-h-11 font-semibold text-ink underline" onClick={() => (nav.setTab('profile'), nav.push({ name: 'prefs' }))}>
                  Change preferences
                </button>
              </p>
            </>
          ) : (
            <div className="mx-5 flex items-center gap-4 rounded-[28px] bg-pale p-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-signal" aria-hidden>
                <Sparkles className="size-6 text-ink" />
              </span>
              <div className="flex-1">
                <p className="text-[16px] font-semibold text-ink">{s.me ? 'Tell us what suits you' : 'Get picks that suit you'}</p>
                <p className="text-[14px] leading-snug text-grey">Choose indoor or outdoor, solo or group and your skills – it takes 20 seconds.</p>
                <button
                  type="button"
                  className="mt-1 min-h-11 text-[15px] font-semibold text-ink underline"
                  onClick={() => nav.requireAccount('Create an account to get recommendations based on your preferences.') && (nav.setTab('profile'), nav.push({ name: 'prefs' }))}
                >
                  Set preferences
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      <section aria-labelledby="near-h">
        <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-7">
          <h2 id="near-h" className="text-[20px] font-semibold tracking-[-0.01em] text-ink">
            {searching ? 'Results' : 'All good deeds nearby'}
          </h2>
          <button
            type="button"
            onClick={() => nav.present({ name: 'filters' })}
            className={cx('inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 px-4 text-[15px] font-semibold', nFilters ? 'border-ink bg-ink text-paper' : 'border-mist bg-paper text-ink')}
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Filters{nFilters ? ` · ${nFilters}` : ''}
          </button>
        </div>
        <div className="px-5">
          <Segmented
            label="View as"
            value={s.view}
            onChange={s.setView}
            options={[
              { value: 'list', label: 'List', icon: List },
              { value: 'map', label: 'Map', icon: MapIcon },
            ]}
          />
        </div>
        {nFilters > 0 && <ActiveChips />}
        <p className="px-5 pb-3 pt-3 text-[14px] text-util" role="status" aria-live="polite">
          {loading ? 'Finding good deeds near you…' : `${results.length} ${results.length === 1 ? 'good deed' : 'good deeds'}${s.view === 'list' ? ' · nearest first' : ''}`}
        </p>
        {loading ? (
          <ul className="space-y-3 px-5">
            {[0, 1, 2].map((i) => (
              <li key={i}>
                <CardSkeleton />
              </li>
            ))}
          </ul>
        ) : results.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={f.q && !nFilters ? `Nothing found for “${f.q}”` : 'No good deeds match these filters'}
            body={f.q && !nFilters ? 'Try a different word, like “beach”, “food” or “dogs”.' : 'Try removing a filter or two to see more.'}
            action={
              <Button onClick={() => s.setFilters(EMPTY_FILTERS)} variant="dark">
                Clear filters
              </Button>
            }
          />
        ) : s.view === 'map' ? (
          <MapView opps={results} onUseList={() => s.setView('list')} />
        ) : (
          <ul className="space-y-3 px-5">
            {results.map((o) => (
              <OppListCard key={o.id} o={o} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function filterLabels(f: Filters): { label: string; clear: (f: Filters) => Filters }[] {
  const out: { label: string; clear: (f: Filters) => Filters }[] = []
  f.cats.forEach((c) => out.push({ label: catName(c), clear: (x) => ({ ...x, cats: x.cats.filter((y) => y !== c) }) }))
  const one = (k: 'io' | 'manual' | 'sg' | 'mode' | 'when' | 'time', map: Record<string, string>) =>
    f[k] !== 'any' && out.push({ label: map[f[k]], clear: (x) => ({ ...x, [k]: 'any' }) })
  one('io', { indoor: 'Indoor', outdoor: 'Outdoor' })
  one('manual', { manual: 'Hands-on', nonmanual: 'Non-manual' })
  one('sg', { individual: 'Individual', group: 'Group' })
  one('mode', { inperson: 'In person', online: 'Online' })
  one('when', { weekend: 'This weekend', week: 'Next 7 days' })
  one('time', { '1': 'Up to 1 hour', '2': 'Up to 2 hours' })
  f.skills.forEach((sk) => out.push({ label: sk, clear: (x) => ({ ...x, skills: x.skills.filter((y) => y !== sk) }) }))
  return out
}

function ActiveChips() {
  const s = useStore()
  const labels = filterLabels(s.filters)
  return (
    <div className="no-scrollbar mt-3 flex items-center gap-2 overflow-x-auto px-5" aria-label="Active filters">
      {labels.map((l) => (
        <RemovableChip key={l.label} onRemove={() => s.setFilters(l.clear(s.filters))}>
          {l.label}
        </RemovableChip>
      ))}
      <button type="button" onClick={() => s.setFilters({ ...EMPTY_FILTERS, q: s.filters.q })} className="min-h-9 shrink-0 px-2 text-[14px] font-semibold text-ink underline">
        Clear filters
      </button>
    </div>
  )
}

function Radio3<T extends string>({ legend, value, onChange, options }: { legend: string; value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <fieldset className="px-5 pt-5">
      <legend className="pb-2 text-[16px] font-semibold text-ink">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, l]) => (
          <Chip key={v} selected={value === v} onClick={() => onChange(v)}>
            {l}
          </Chip>
        ))}
      </div>
    </fieldset>
  )
}

export function FiltersSheet({ onClose }: { onClose: () => void }) {
  const s = useStore()
  const [d, setD] = useState<Filters>(s.filters)
  const count = s.applyFilters(s.findable, d).length
  const toggleCat = (c: CategoryId) => setD({ ...d, cats: d.cats.includes(c) ? d.cats.filter((x) => x !== c) : [...d.cats, c] })
  return (
    <Sheet
      title="Filters"
      onClose={onClose}
      full
      footer={
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => setD({ ...EMPTY_FILTERS, q: d.q })} disabled={activeFilterCount(d) === 0}>
            Clear all
          </Button>
          <Button
            full
            size="lg"
            onClick={() => {
              s.setFilters(d)
              onClose()
            }}
          >
            {count === 0 ? 'No matches – show anyway' : `Show ${count} ${count === 1 ? 'good deed' : 'good deeds'}`}
          </Button>
        </div>
      }
    >
      <div className="pb-6">
        <Radio3
          legend="Setting"
          value={d.io}
          onChange={(io) => setD({ ...d, io })}
          options={[['any', 'Any'], ['outdoor', 'Outdoor'], ['indoor', 'Indoor']]}
        />
        <Radio3
          legend="On your own or in a group"
          value={d.sg}
          onChange={(sg) => setD({ ...d, sg })}
          options={[['any', 'Any'], ['group', 'Group'], ['individual', 'Individual']]}
        />
        <fieldset className="px-5 pt-5">
          <legend className="pb-2 text-[16px] font-semibold text-ink">Category</legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c.id} icon={CATEGORY_ICON[c.id]} selected={d.cats.includes(c.id)} onClick={() => toggleCat(c.id)}>
                {c.name}
              </Chip>
            ))}
          </div>
        </fieldset>
        <Radio3
          legend="Type of task"
          value={d.manual}
          onChange={(manual) => setD({ ...d, manual })}
          options={[['any', 'Any'], ['manual', 'Hands-on'], ['nonmanual', 'Non-manual']]}
        />
        <Radio3
          legend="When"
          value={d.when}
          onChange={(when) => setD({ ...d, when })}
          options={[['any', 'Any time'], ['weekend', 'This weekend'], ['week', 'Next 7 days']]}
        />
        <Radio3
          legend="Time needed"
          value={d.time}
          onChange={(time) => setD({ ...d, time })}
          options={[['any', 'Any length'], ['1', 'Up to 1 hour'], ['2', 'Up to 2 hours']]}
        />
        <Radio3
          legend="In person or online"
          value={d.mode}
          onChange={(mode) => setD({ ...d, mode })}
          options={[['any', 'Any'], ['inperson', 'In person'], ['online', 'Online']]}
        />
        <fieldset className="px-5 pt-5">
          <legend className="pb-2 text-[16px] font-semibold text-ink">Skills needed</legend>
          <div className="flex flex-wrap gap-2">
            {SKILLS.map((sk) => (
              <Chip key={sk} selected={d.skills.includes(sk)} onClick={() => setD({ ...d, skills: d.skills.includes(sk) ? d.skills.filter((x) => x !== sk) : [...d.skills, sk] })}>
                {sk}
              </Chip>
            ))}
          </div>
        </fieldset>
        <p className="px-5 pt-5 text-[13px] text-util">All good deeds are open to anyone aged 16 or over.</p>
      </div>
    </Sheet>
  )
}
