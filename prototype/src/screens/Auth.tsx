import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CircleAlert,
  Hand,
  Home,
  ImageIcon,
  Lock,
  MapPin,
  Shield,
  Sparkle,
  Sun,
  TreePine,
  User as UserIcon,
  Users,
  Gift,
  Zap,
  Info,
  Laptop,
} from 'lucide-react'
import { IMAGES, SKILLS, TODAY, type User } from '../data'
import { useStore } from '../store'
import { useNav } from '../nav'
import { ageOn, normalisePostcode } from '../utils'
import { Banner, Button, Checkbox, Chip, Eyebrow, Field, NavBar, cx } from '../components/ui'

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 text-[19px] font-bold tracking-[-0.02em] text-ink', className)}>
      <span className="flex size-7 items-center justify-center rounded-full bg-signal" aria-hidden>
        <Sparkle className="size-4 fill-current" />
      </span>
      Good Deeds
    </span>
  )
}

/* ================= Welcome ================= */
export function Welcome({ onStart, onLogin, onExplore }: { onStart: () => void; onLogin: () => void; onExplore: () => void }) {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-cream" style={{ paddingTop: 'var(--safe-top)', paddingBottom: 'calc(var(--safe-bottom) + 12px)' }}>
      <div className="px-5 pt-3">
        <Wordmark />
      </div>
      <div className="relative mx-5 mt-5 grid h-[300px] shrink-0 grid-cols-5 grid-rows-2 gap-2.5">
        <div className="col-span-3 row-span-2 overflow-hidden rounded-[28px] bg-mist">
          <img src={IMAGES.beach} alt="Volunteers with rubbish bags on a beach" className="size-full object-cover" />
        </div>
        <div className="col-span-2 overflow-hidden rounded-[20px] bg-mist">
          <img src={IMAGES.garden2} alt="Two people holding spades" className="size-full object-cover" />
        </div>
        <div className="col-span-2 overflow-hidden rounded-[20px] bg-mist">
          <img src={IMAGES.food} alt="Volunteers sorting tins at a food bank" className="size-full object-cover" />
        </div>
        <span className="absolute -bottom-3 left-4 inline-flex -rotate-3 items-center gap-1.5 rounded-full bg-signal px-4 py-2 text-[15px] font-semibold text-ink shadow-lift">
          <MapPin className="size-4" aria-hidden /> Live in Brighton & Hove
        </span>
      </div>

      <div className="px-5 pt-9">
        <h1 className="text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-ink">Good deeds, close to home.</h1>
        <p className="mt-3 text-[17px] leading-relaxed text-grey">
          Find a local good deed that fits your time, join in one tap, and get recognised for every hour you give.
        </p>
        <ul className="mt-5 space-y-3">
          {[
            { icon: TreePine, t: 'Beach cleans, litter picks, food banks, dog walks and more' },
            { icon: Zap, t: 'Many take an hour or two – no long-term commitment' },
            { icon: Gift, t: '10 points for every confirmed hour, to spend locally' },
          ].map((r) => (
            <li key={r.t} className="flex items-center gap-3 text-[16px] leading-snug text-ink">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pale" aria-hidden>
                <r.icon className="size-[18px]" />
              </span>
              {r.t}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto space-y-2 px-5 pt-8">
        <Button size="lg" full onClick={onStart} icon={ArrowRight} className="flex-row-reverse">
          Get started
        </Button>
        <Button size="lg" variant="secondary" full onClick={onLogin}>
          I already have an account
        </Button>
        <Button variant="ghost" full onClick={onExplore}>
          Have a look around first
        </Button>
      </div>
    </div>
  )
}

/* ================= Login ================= */
export function Login({ onBack, onSignup, onDone }: { onBack: () => void; onSignup: () => void; onDone: () => void }) {
  const s = useStore()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState<{ email?: React.ReactNode; pw?: string }>({})
  const [loading, setLoading] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const pwRef = useRef<HTMLInputElement>(null)

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const next: typeof err = {}
    if (!email.trim()) next.email = 'Enter your email address to log in.'
    if (!pw) next.pw = 'Enter your password. Any password works in this demo.'
    setErr(next)
    if (next.email) return emailRef.current?.focus()
    if (next.pw) return pwRef.current?.focus()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (s.login(email) === 'notfound') {
        setErr({
          email: (
            <>
              We couldn’t find an account with that email.{' '}
              <button type="button" className="font-semibold underline" onClick={onSignup}>
                Sign up
              </button>
            </>
          ),
        })
        emailRef.current?.focus()
      } else onDone()
    }, 500)
  }

  return (
    <div className="flex h-full flex-col bg-cream" style={{ paddingTop: 'var(--safe-top)' }}>
      <NavBar onBack={onBack} backLabel="Back" />
      <form onSubmit={submit} className="flex flex-1 flex-col overflow-y-auto px-5 pb-6" noValidate>
        <h1 className="text-[32px] font-semibold tracking-[-0.02em] text-ink">Welcome back</h1>
        <p className="mt-1 text-[16px] text-grey">Log in to see your good deeds, hours and points.</p>
        <div className="mt-6 space-y-4">
          <Field ref={emailRef} id="login-email" label="Email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" value={email} onChange={setEmail} error={err.email} />
          <Field ref={pwRef} id="login-pw" label="Password" type="password" autoComplete="current-password" value={pw} onChange={setPw} error={err.pw} hint="Demo only – passwords are never stored." />
        </div>
        <div className="mt-6 rounded-[20px] bg-pale p-4">
          <Eyebrow>Demo accounts</Eyebrow>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ['sam@example.com', 'Sam · volunteer'],
              ['dave@example.com', 'Dave · organiser'],
            ].map(([e, l]) => (
              <Chip key={e} onClick={() => (setEmail(e), setPw('demo'))}>
                {l}
              </Chip>
            ))}
          </div>
        </div>
        <div className="mt-auto pt-6">
          <Button type="submit" size="lg" full loading={loading}>
            Log in
          </Button>
          <p className="mt-4 text-center text-[15px] text-grey">
            New here?{' '}
            <button type="button" onClick={onSignup} className="min-h-11 font-semibold text-ink underline">
              Create an account
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}

/* ================= Preferences editor (shared by sign-up and profile) ================= */
export type Prefs = Pick<User, 'indoorOutdoor' | 'manualPref' | 'soloGroup' | 'skills'>

function PrefGroup<T extends string>({
  title,
  why,
  value,
  onChange,
  options,
}: {
  title: string
  why?: string
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string; icon: typeof Sun; sub: string }[]
}) {
  return (
    <fieldset className="mt-6">
      <legend className="text-[17px] font-semibold text-ink">{title}</legend>
      {why && <p className="mt-0.5 text-[14px] text-util">{why}</p>}
      <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label={title}>
        {options.map((o) => {
          const sel = value === o.value
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={sel}
              onClick={() => onChange(o.value)}
              className={cx(
                'flex min-h-[96px] flex-col items-start justify-between rounded-[20px] border-2 p-3 text-left transition active:scale-[0.97]',
                sel ? 'border-ink bg-soft' : 'border-transparent bg-paper shadow-soft',
              )}
            >
              <o.icon className="size-6 text-ink" aria-hidden />
              <span>
                <span className="block text-[15px] font-semibold leading-tight text-ink">{o.label}</span>
                <span className="block text-[12px] leading-tight text-util">{o.sub}</span>
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function PrefsEditor({ value, onChange }: { value: Prefs; onChange: (p: Prefs) => void }) {
  const set = (patch: Partial<Prefs>) => onChange({ ...value, ...patch })
  return (
    <div>
      <PrefGroup
        title="Where do you like to help?"
        value={value.indoorOutdoor}
        onChange={(v) => set({ indoorOutdoor: v })}
        options={[
          { value: 'outdoor', label: 'Outdoors', sub: 'Parks, beach', icon: Sun },
          { value: 'indoor', label: 'Indoors', sub: 'Halls, schools', icon: Home },
          { value: 'either', label: 'Either', sub: 'Show me both', icon: Sparkle },
        ]}
      />
      <PrefGroup
        title="What kind of task?"
        value={value.manualPref}
        onChange={(v) => set({ manualPref: v })}
        options={[
          { value: 'manual', label: 'Hands-on', sub: 'Picking, planting', icon: Hand },
          { value: 'nonmanual', label: 'Non-manual', sub: 'Tech, walking', icon: Laptop },
          { value: 'either', label: 'Either', sub: 'Happy with both', icon: Sparkle },
        ]}
      />
      <PrefGroup
        title="On your own or with others?"
        value={value.soloGroup}
        onChange={(v) => set({ soloGroup: v })}
        options={[
          { value: 'group', label: 'Group', sub: 'Meet people', icon: Users },
          { value: 'solo', label: 'Solo', sub: 'Just me', icon: UserIcon },
          { value: 'either', label: 'Either', sub: 'No preference', icon: Sparkle },
        ]}
      />
      <fieldset className="mt-6">
        <legend className="text-[17px] font-semibold text-ink">Skills you could offer</legend>
        <p className="mt-0.5 text-[14px] text-util">Choose any. Most good deeds need no special skills.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SKILLS.map((sk) => {
            const on = value.skills.includes(sk)
            return (
              <Chip key={sk} selected={on} onClick={() => set({ skills: on ? value.skills.filter((x) => x !== sk) : [...value.skills, sk] })}>
                {sk}
              </Chip>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}

/* ================= Sign-up ================= */
function Progress({ step }: { step: number }) {
  return (
    <div className="px-5 pb-2">
      <div className="flex items-center justify-between">
        <Eyebrow>Step {step} of 4</Eyebrow>
        <span className="text-[13px] text-util">{['Your details', 'Preferences', 'Terms', 'Verify ID'][step - 1]}</span>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1.5" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={cx('h-1.5 rounded-full transition', i <= step ? 'bg-signal-deep' : 'bg-mist')} />
        ))}
      </div>
    </div>
  )
}

const DEMO_MAYA = { firstName: 'Maya', email: 'maya@example.com', password: 'demo', dob: '1999-04-18', postcode: 'bn2 1ta' }

export function SignUp({ onExit, onLogin, onDone }: { onExit: () => void; onLogin: () => void; onDone: () => void }) {
  const s = useStore()
  const nav = useNav()
  const [step, setStep] = useState(1)
  const [d, setD] = useState({ firstName: '', email: '', password: '', dob: '', postcode: '' })
  const [prefs, setPrefs] = useState<Prefs>({ indoorOutdoor: 'either', manualPref: 'either', soloGroup: 'either', skills: [] })
  const [errors, setErrors] = useState<Record<string, React.ReactNode>>({})
  const [tooYoung, setTooYoung] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const refs = { firstName: useRef<HTMLInputElement>(null), email: useRef<HTMLInputElement>(null), password: useRef<HTMLInputElement>(null), dob: useRef<HTMLInputElement>(null), postcode: useRef<HTMLInputElement>(null) }
  const scroller = useRef<HTMLDivElement>(null)
  useEffect(() => scroller.current?.scrollTo({ top: 0 }), [step])

  const upd = (k: keyof typeof d) => (v: string) => {
    setD((x) => ({ ...x, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const validate1 = () => {
    const e: Record<string, React.ReactNode> = {}
    if (!d.firstName.trim()) e.firstName = 'Enter your first name.'
    if (!d.email.trim()) e.email = 'Enter your email address.'
    else if (!/^\S+@\S+\.\S+$/.test(d.email)) e.email = 'Enter an email address in the format name@example.com.'
    else if (s.emailExists(d.email))
      e.email = (
        <>
          You already have an account.{' '}
          <button type="button" className="font-semibold underline" onClick={onLogin}>
            Log in
          </button>
        </>
      )
    if (!d.password) e.password = 'Enter a password. Any password works in this demo – it isn’t stored.'
    if (!d.dob) e.dob = 'Enter your date of birth so we can check you’re 16 or over.'
    if (!d.postcode.trim()) e.postcode = 'Enter your postcode, for example BN1 1AA.'
    else if (!normalisePostcode(d.postcode)) e.postcode = 'Please enter a valid UK postcode, for example BN1 1AA.'
    setErrors(e)
    const first = (['firstName', 'email', 'password', 'dob', 'postcode'] as const).find((k) => e[k])
    if (first) {
      refs[first].current?.focus()
      return
    }
    if (ageOn(d.dob) < 16) return setTooYoung(true)
    setStep(2)
  }

  const create = () => {
    s.createUser({
      firstName: d.firstName.trim(),
      email: d.email.trim(),
      dob: d.dob,
      postcode: normalisePostcode(d.postcode)!,
      ...prefs,
      prefsSet: prefs.indoorOutdoor !== 'either' || prefs.manualPref !== 'either' || prefs.soloGroup !== 'either' || prefs.skills.length > 0,
      termsAcceptedAt: new Date().toISOString(),
      idVerified: false,
    })
    setStep(4)
  }

  if (tooYoung)
    return (
      <div className="flex h-full flex-col bg-cream px-5" style={{ paddingTop: 'var(--safe-top)', paddingBottom: 'calc(var(--safe-bottom) + 16px)' }}>
        <div className="flex flex-1 flex-col items-center justify-center text-center" role="alert">
          <span className="flex size-20 items-center justify-center rounded-full bg-pale" aria-hidden>
            <Info className="size-9 text-ink" />
          </span>
          <h1 className="mt-5 text-[26px] font-semibold text-ink">You need to be 16 or over to volunteer with Good Deeds.</h1>
          <p className="mt-3 max-w-[32ch] text-[16px] leading-relaxed text-grey">
            We haven’t saved any of your details. If you entered your date of birth by mistake, you can go back and change it.
          </p>
        </div>
        <div className="space-y-2">
          <Button size="lg" full onClick={() => (setTooYoung(false), setTimeout(() => refs.dob.current?.focus(), 50))}>
            Check my date of birth
          </Button>
          <Button size="lg" variant="ghost" full onClick={onExit}>
            Back to start
          </Button>
        </div>
      </div>
    )

  return (
    <div className="flex h-full flex-col bg-cream" style={{ paddingTop: 'var(--safe-top)' }}>
      <NavBar
        onBack={step === 4 ? undefined : step === 1 ? onExit : () => setStep(step - 1)}
        backLabel={step === 1 ? 'Cancel' : 'Back'}
        right={
          step === 2 ? (
            <button type="button" onClick={() => setStep(3)} className="min-h-11 rounded-full px-3 text-[17px] font-medium text-ink active:bg-ink/5">
              Skip
            </button>
          ) : undefined
        }
      />
      <Progress step={step} />
      <div ref={scroller} className="flex-1 overflow-y-auto px-5 pb-6">
        {step === 1 && (
          <form id="step1" noValidate onSubmit={(e) => (e.preventDefault(), validate1())}>
            <h1 className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-ink">Let’s get you set up</h1>
            <p className="mt-1 text-[16px] text-grey">It takes under a minute. Your postcode helps us show good deeds nearby.</p>
            <button type="button" onClick={() => (setD(DEMO_MAYA), setErrors({}))} className="mt-3 min-h-11 rounded-full bg-pale px-4 text-[14px] font-semibold text-ink active:bg-soft">
              Fill with Maya’s demo details
            </button>
            <div className="mt-5 space-y-4">
              <Field ref={refs.firstName} id="su-name" label="First name" autoComplete="given-name" value={d.firstName} onChange={upd('firstName')} error={errors.firstName} />
              <Field ref={refs.email} id="su-email" label="Email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" value={d.email} onChange={upd('email')} error={errors.email} />
              <Field ref={refs.password} id="su-pw" label="Password" type="password" autoComplete="new-password" value={d.password} onChange={upd('password')} error={errors.password} hint="Demo only – we never store passwords." />
              <Field ref={refs.dob} id="su-dob" label="Date of birth" type="date" max={TODAY} value={d.dob} onChange={upd('dob')} error={errors.dob} hint="You need to be 16 or over. We only use this to check your age." />
              <Field ref={refs.postcode} id="su-pc" label="Postcode" autoComplete="postal-code" autoCapitalize="characters" value={d.postcode} onChange={upd('postcode')} error={errors.postcode} hint="Any UK postcode. Good deeds are currently in Brighton & Hove." />
            </div>
            <p className="mt-5 flex gap-2 text-[13px] leading-snug text-util">
              <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
              Organisers only see your first name when you join. Your email, date of birth and postcode stay with Good Deeds.
            </p>
          </form>
        )}
        {step === 2 && (
          <>
            <h1 className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-ink">What suits you, {d.firstName || 'there'}?</h1>
            <p className="mt-1 text-[16px] text-grey">We use these to pick “Recommended for you”. Skip anything – you can change it later in Profile.</p>
            <PrefsEditor value={prefs} onChange={setPrefs} />
          </>
        )}
        {step === 3 && (
          <>
            <h1 className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-ink">A few ground rules</h1>
            <p className="mt-1 text-[16px] text-grey">The short version of our Terms & Conditions.</p>
            <ul className="mt-5 space-y-3">
              {[
                ['Turn up, or cancel', 'If plans change, cancel in the app so your space goes to someone else.'],
                ['Be honest about hours', 'Only tap “I’ve done it” for deeds you took part in. Organisers confirm hours.'],
                ['Stay safe', 'Follow the organiser’s safety briefing. Don’t do tasks you’re not comfortable with.'],
                ['Be kind', 'Treat volunteers, organisers and the people you help with respect.'],
                ['Your data', 'We keep your details for the demo only. Organisers see your first name, nothing else.'],
              ].map(([t, b]) => (
                <li key={t} className="flex gap-3 rounded-[20px] bg-paper p-4 shadow-soft">
                  <Shield className="mt-0.5 size-5 shrink-0 text-ink" aria-hidden />
                  <div>
                    <p className="text-[16px] font-semibold text-ink">{t}</p>
                    <p className="mt-0.5 text-[14px] leading-snug text-grey">{b}</p>
                  </div>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => nav.present({ name: 'terms' })} className="mt-4 min-h-11 text-[15px] font-semibold text-ink underline">
              Read the full Terms & Conditions
            </button>
            <div className="mt-3 rounded-[20px] bg-pale p-4">
              <Checkbox id="terms" checked={accepted} onChange={setAccepted}>
                I accept the Terms & Conditions
              </Checkbox>
            </div>
          </>
        )}
        {step === 4 && <VerifyId onDone={onDone} inSignup />}
      </div>
      {step < 4 && (
        <div className="border-t border-mist bg-cream px-5 pt-3" style={{ paddingBottom: 'calc(var(--safe-bottom) + 12px)' }}>
          {step === 1 && (
            <Button type="submit" form="step1" size="lg" full>
              Continue
            </Button>
          )}
          {step === 2 && (
            <Button size="lg" full onClick={() => setStep(3)}>
              Continue
            </Button>
          )}
          {step === 3 && (
            <>
              <Button size="lg" full disabled={!accepted} onClick={create} aria-describedby={!accepted ? 'terms-help' : undefined}>
                Create account
              </Button>
              {!accepted && (
                <p id="terms-help" className="mt-2 text-center text-[13px] text-util">
                  Tick the box above to create your account.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* ================= Mock ID verification ================= */
export function VerifyId({ onDone, inSignup }: { onDone: () => void; inSignup?: boolean }) {
  const s = useStore()
  const nav = useNav()
  const [state, setState] = useState<'idle' | 'denied' | 'checking' | 'done'>('idle')
  const fileRef = useRef<HTMLInputElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)

  const check = () => {
    setState('checking')
    setTimeout(() => {
      s.updateMe({ idVerified: true })
      setState('done')
      setTimeout(() => statusRef.current?.focus(), 30)
    }, 2000)
  }
  const askPhotos = () =>
    nav.alert({
      title: '“Good Deeds” would like to access your photos',
      message: 'So you can choose a photo of your ID. The photo stays on your phone and is never uploaded.',
      actions: [
        { label: 'Don’t Allow', onPress: () => setState('denied') },
        { label: 'Allow', style: 'bold', onPress: () => fileRef.current?.click() },
      ],
    })

  if (state === 'checking' || state === 'done')
    return (
      <div className="flex min-h-[460px] flex-col items-center justify-center text-center">
        <div ref={statusRef} tabIndex={-1} role="status" aria-live="polite" className="flex flex-col items-center outline-none">
          {state === 'checking' ? (
            <>
              <span className="relative flex size-24 items-center justify-center rounded-full bg-pale" aria-hidden>
                <span className="absolute inset-0 animate-ping rounded-full bg-soft opacity-60 motion-reduce:hidden" />
                <Shield className="relative size-10 text-ink" />
              </span>
              <h2 className="mt-6 text-[24px] font-semibold text-ink">Checking your ID…</h2>
              <p className="mt-1 text-[15px] text-grey">This takes a couple of seconds.</p>
            </>
          ) : (
            <>
              <span className="anim-pop flex size-24 items-center justify-center rounded-full bg-signal" aria-hidden>
                <BadgeCheck className="size-12 text-ink" />
              </span>
              <h2 className="mt-6 text-[28px] font-semibold text-ink">You’re verified ✓</h2>
              <p className="mt-2 max-w-[30ch] text-[16px] text-grey">A Verified badge now shows on your profile, so organisers know you’ve checked your ID.</p>
            </>
          )}
        </div>
        {state === 'done' && (
          <Button size="lg" full className="mt-10" onClick={onDone}>
            {inSignup ? 'Find good deeds' : 'Back to profile'}
          </Button>
        )}
      </div>
    )

  return (
    <div>
      <h1 className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-ink">Verify your ID</h1>
      <p className="mt-1 text-[16px] text-grey">A Verified badge helps organisers trust who’s coming. It’s optional.</p>
      <div className="mt-4">
        <Banner icon={CircleAlert}>
          <strong>This is a demo.</strong> No real ID is checked, and your photo never leaves your phone or gets stored.
        </Banner>
      </div>
      <div className="mt-5 flex aspect-[1.6] items-center justify-center rounded-[28px] border-2 border-dashed border-quiet bg-paper">
        <div className="flex flex-col items-center text-center text-util">
          <ImageIcon className="size-10" aria-hidden />
          <p className="mt-2 text-[15px]">Driving licence, passport or student ID</p>
        </div>
      </div>
      {state === 'denied' && (
        <div className="mt-4">
          <Banner tone="warn" icon={Info}>
            No problem – you haven’t given photo access. You can use the demo ID instead, or verify later from your profile.
          </Banner>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => e.target.files?.length && check()} />
      <div className="mt-5 space-y-2">
        <Button size="lg" full onClick={check} icon={BadgeCheck}>
          Use demo ID
        </Button>
        <Button size="lg" variant="secondary" full onClick={askPhotos} icon={Camera}>
          Choose a photo
        </Button>
        <Button variant="ghost" full onClick={onDone}>
          Skip for now
        </Button>
      </div>
    </div>
  )
}
