import { useRef, useState } from 'react'
import { CheckCircle2, Eye, Minus, Plus, Share2, XCircle } from 'lucide-react'
import { CATEGORIES, CATEGORY_IMAGE, POSTCODES, SKILLS, TODAY, catName, type CategoryId } from '../data'
import { useStore } from '../store'
import { useNav } from '../nav'
import { district, fmtDate, fmtHours, normalisePostcode, oppLink, shareCaption } from '../utils'
import { Button, CATEGORY_ICON, Chip, Field, LargeTitle, cx } from '../components/ui'
import { useShare } from './Detail'

type Bin = '' | 'a' | 'b'

function Err({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-[14px] font-medium text-bad">
      <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      {msg}
    </p>
  )
}

function Choice({ legend, value, onChange, a, b, err, id }: { legend: string; value: Bin; onChange: (v: Bin) => void; a: string; b: string; err?: string; id: string }) {
  return (
    <fieldset id={id} tabIndex={-1} className="outline-none" aria-describedby={err ? `${id}-err` : undefined}>
      <legend className="mb-1.5 text-[15px] font-semibold text-ink">{legend}</legend>
      <div className="flex gap-2">
        <Chip selected={value === 'a'} onClick={() => onChange('a')} className="flex-1 justify-center">
          {a}
        </Chip>
        <Chip selected={value === 'b'} onClick={() => onChange('b')} className="flex-1 justify-center">
          {b}
        </Chip>
      </div>
      <Err id={`${id}-err`} msg={err} />
    </fieldset>
  )
}

function Stepper({ label, value, onChange, min, max, step, fmt }: { label: string; value: number; onChange: (n: number) => void; min: number; max: number; step: number; fmt: (n: number) => string }) {
  return (
    <div>
      <p className="mb-1.5 text-[15px] font-semibold text-ink" id={`${label}-l`}>
        {label}
      </p>
      <div className="flex items-center gap-3 rounded-[14px] border-2 border-mist bg-paper p-1" role="group" aria-labelledby={`${label}-l`}>
        <button type="button" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))} className="flex size-11 items-center justify-center rounded-[10px] bg-pale text-ink disabled:opacity-40">
          <Minus className="size-5" aria-hidden />
        </button>
        <span className="flex-1 text-center text-[17px] font-semibold text-ink" aria-live="polite">
          {fmt(value)}
        </span>
        <button type="button" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + step))} className="flex size-11 items-center justify-center rounded-[10px] bg-pale text-ink disabled:opacity-40">
          <Plus className="size-5" aria-hidden />
        </button>
      </div>
    </div>
  )
}

const blank = {
  title: '',
  category: '' as CategoryId | '',
  description: '',
  date: '',
  time: '',
  hours: 2,
  postcode: '',
  place: '',
  io: '' as Bin,
  manual: '' as Bin,
  online: '' as Bin,
  type: '' as Bin,
  capacity: 10,
  skills: [] as string[],
}

export function PostScreen() {
  const s = useStore()
  const nav = useNav()
  const [f, setF] = useState(blank)
  const [e, setE] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const top = useRef<HTMLDivElement>(null)
  const set = <K extends keyof typeof blank>(k: K, v: (typeof blank)[K]) => {
    setF((x) => ({ ...x, [k]: v }))
    if (e[k]) setE((x) => ({ ...x, [k]: '' }))
  }

  const submit = () => {
    const er: Record<string, string> = {}
    if (!f.title.trim()) er.title = 'Give your good deed a title.'
    if (!f.category) er.category = 'Choose a category.'
    if (!f.description.trim()) er.description = 'Describe what volunteers will do.'
    if (!f.date) er.date = 'Choose a date.'
    else if (f.date <= TODAY) er.date = 'Choose a date in the future.'
    if (!f.time) er.time = 'Choose a start time.'
    const pc = normalisePostcode(f.postcode)
    if (!f.postcode.trim()) er.postcode = 'Enter the postcode where people should meet.'
    else if (!pc) er.postcode = 'Please enter a valid UK postcode, for example BN1 1AA.'
    else if (!POSTCODES[district(pc)]) er.postcode = 'Good deeds can only be posted in Brighton & Hove (BN1, BN2, BN3 or BN41).'
    if (!f.place.trim()) er.place = 'Tell people where exactly to meet.'
    if (!f.io) er.io = 'Choose indoor or outdoor.'
    if (!f.manual) er.manual = 'Choose hands-on or non-manual.'
    if (!f.online) er.online = 'Choose in person or online.'
    if (!f.type) er.type = 'Choose individual or group.'
    setE(er)
    const order = ['title', 'category', 'description', 'date', 'time', 'postcode', 'place', 'io', 'manual', 'online', 'type']
    const first = order.find((k) => er[k])
    if (first) {
      const el = document.getElementById(`post-${first}`)
      el?.focus()
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      nav.toast(`${Object.keys(er).length} ${Object.keys(er).length === 1 ? 'thing needs' : 'things need'} fixing`, 'error')
      return
    }
    setBusy(true)
    setTimeout(() => {
      const base = POSTCODES[district(pc!)]
      const created = s.post({
        title: f.title.trim(),
        category: f.category as CategoryId,
        description: f.description.trim(),
        tasks: [],
        date: f.date,
        startTime: f.time,
        hours: f.hours,
        place: f.place.trim(),
        address: f.place.trim(),
        postcode: pc!,
        lat: base.lat + (Math.random() - 0.5) * 0.004,
        lng: base.lng + (Math.random() - 0.5) * 0.006,
        indoorOutdoor: f.io === 'a' ? 'indoor' : 'outdoor',
        manual: f.manual === 'a',
        online: f.online === 'b',
        type: f.type === 'a' ? 'individual' : 'group',
        capacity: f.type === 'a' ? 1 : f.capacity,
        skills: f.skills,
        provided: 'Ask the organiser what’s provided.',
        bring: ['Comfortable clothes'],
        access: 'Ask the organiser about access.',
        image: CATEGORY_IMAGE[f.category as CategoryId],
        imageAlt: catName(f.category as CategoryId),
      })
      setBusy(false)
      setF(blank)
      nav.push({ name: 'postDone', id: created.id })
    }, 600)
  }

  return (
    <div ref={top} className="pb-8">
      <LargeTitle sub="Organising something local? Share it in under a minute.">Post a good deed</LargeTitle>
      <form className="space-y-5 px-5" noValidate onSubmit={(ev) => (ev.preventDefault(), submit())}>
        <div>
          <Field id="post-title" label="Title" value={f.title} onChange={(v) => set('title', v.slice(0, 60))} maxLength={60} placeholder="e.g. Litter Pick on The Level" error={e.title} />
          <p className="mt-1 text-right text-[13px] text-util">{f.title.length}/60</p>
        </div>
        <fieldset id="post-category" tabIndex={-1} className="outline-none">
          <legend className="mb-1.5 text-[15px] font-semibold text-ink">Category</legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c.id} icon={CATEGORY_ICON[c.id]} selected={f.category === c.id} onClick={() => set('category', c.id)}>
                {c.name}
              </Chip>
            ))}
          </div>
          <Err id="post-category-err" msg={e.category} />
        </fieldset>
        <div>
          <label htmlFor="post-description" className="mb-1.5 block text-[15px] font-semibold text-ink">
            Description
          </label>
          <textarea
            id="post-description"
            value={f.description}
            maxLength={500}
            onChange={(ev) => set('description', ev.target.value)}
            rows={4}
            aria-invalid={!!e.description || undefined}
            aria-describedby={e.description ? 'post-description-err' : undefined}
            placeholder="What will people do? What should they bring?"
            className={cx('w-full rounded-[14px] border-2 bg-paper px-4 py-3 text-[17px] text-ink outline-none placeholder:text-quiet focus:border-ink', e.description ? 'border-bad' : 'border-mist')}
          />
          <div className="flex justify-between">
            <Err id="post-description-err" msg={e.description} />
            <p className="ml-auto mt-1 text-[13px] text-util">{f.description.length}/500</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field id="post-date" label="Date" type="date" min="2026-11-13" value={f.date} onChange={(v) => set('date', v)} error={e.date} />
          <Field id="post-time" label="Start time" type="time" value={f.time} onChange={(v) => set('time', v)} error={e.time} />
        </div>
        <Stepper label="Hours required" value={f.hours} onChange={(n) => set('hours', n)} min={0.5} max={8} step={0.5} fmt={fmtHours} />
        <Field id="post-postcode" label="Postcode" autoCapitalize="characters" value={f.postcode} onChange={(v) => set('postcode', v)} error={e.postcode} hint="Must be in Brighton & Hove." />
        <Field id="post-place" label="Meeting point" value={f.place} onChange={(v) => set('place', v)} placeholder="e.g. By The Level café, Union Road" error={e.place} />
        <Choice id="post-io" legend="Indoor or outdoor" value={f.io} onChange={(v) => set('io', v)} a="Indoor" b="Outdoor" err={e.io} />
        <Choice id="post-manual" legend="Type of task" value={f.manual} onChange={(v) => set('manual', v)} a="Hands-on" b="Non-manual" err={e.manual} />
        <Choice id="post-online" legend="In person or online" value={f.online} onChange={(v) => set('online', v)} a="In person" b="Online" err={e.online} />
        <Choice id="post-type" legend="Individual or group" value={f.type} onChange={(v) => set('type', v)} a="Individual" b="Group" err={e.type} />
        {f.type === 'b' && <Stepper label="How many people?" value={f.capacity} onChange={(n) => set('capacity', n)} min={2} max={50} step={1} fmt={(n) => `${n} people`} />}
        <fieldset>
          <legend className="mb-1.5 flex w-full justify-between text-[15px] font-semibold text-ink">
            Skills needed <span className="text-[13px] font-medium text-util">Optional</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {SKILLS.map((sk) => (
              <Chip key={sk} selected={f.skills.includes(sk)} onClick={() => set('skills', f.skills.includes(sk) ? f.skills.filter((x) => x !== sk) : [...f.skills, sk])}>
                {sk}
              </Chip>
            ))}
          </div>
        </fieldset>
        <Button type="submit" size="lg" full loading={busy}>
          Post
        </Button>
      </form>
    </div>
  )
}

export function PostDoneScreen({ id }: { id: string }) {
  const s = useStore()
  const nav = useNav()
  const shareIt = useShare()
  const o = s.opp(id)!
  return (
    <div className="flex flex-col items-center px-5 pb-8 pt-6 text-center">
      <span className="anim-pop flex size-20 items-center justify-center rounded-full bg-signal" aria-hidden>
        <CheckCircle2 className="size-10 text-ink" />
      </span>
      <h1 className="mt-5 text-[28px] font-semibold text-ink" role="status">
        Your good deed is live
      </h1>
      <p className="mt-2 max-w-[32ch] text-[16px] text-grey">
        {o.title} on {fmtDate(o.date)} at {o.startTime} now shows on the map and list for everyone.
      </p>
      <div className="mt-8 w-full space-y-2">
        <Button size="lg" full icon={Share2} onClick={() => shareIt(shareCaption(o), oppLink(o))}>
          Share
        </Button>
        <Button size="lg" variant="secondary" full icon={Eye} onClick={() => nav.push({ name: 'detail', id: o.id })}>
          View post
        </Button>
        <Button variant="ghost" full onClick={nav.popToRoot}>
          Post another
        </Button>
      </div>
    </div>
  )
}
