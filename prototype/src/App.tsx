import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { BadgeCheck, CalendarCheck, CheckCircle2, CircleAlert, Compass, FlaskConical, Gift, PlusCircle, RotateCcw, UserRound, WifiOff, Info, Sparkle } from 'lucide-react'
import { StoreProvider, useStore } from './store'
import { NavCtx, useNav as useNavInternal, type Modal, type Nav, type Phase, type Route, type Tab } from './nav'
import { AlertView, Button, NavBar, Sheet, Toggle, cx, type AlertConfig, EmptyState } from './components/ui'
import { Login, SignUp, Welcome } from './screens/Auth'
import { FiltersSheet, FindScreen } from './screens/Find'
import { CompleteSheet, DetailScreen, JoinedSheet, ManageScreen } from './screens/Detail'
import { MyDeedsScreen } from './screens/MyDeeds'
import { RewardsScreen, VoucherScreen } from './screens/Rewards'
import { GuestProfile, PrefsScreen, ProfileScreen, TermsContent, UpdatesScreen, VerifyRoute } from './screens/Profile'
import { PostDoneScreen, PostScreen } from './screens/Post'

const TABS: { id: Tab; label: string; icon: typeof Compass }[] = [
  { id: 'find', label: 'Find', icon: Compass },
  { id: 'deeds', label: 'My deeds', icon: CalendarCheck },
  { id: 'post', label: 'Post', icon: PlusCircle },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'profile', label: 'Profile', icon: UserRound },
]
const EMPTY_STACKS: Record<Tab, Route[]> = { find: [], deeds: [], post: [], rewards: [], profile: [] }
const ROUTE_TITLE: Partial<Record<Route['name'], string>> = {
  voucher: 'Your voucher',
  prefs: 'Preferences',
  terms: 'Terms & Conditions',
  updates: 'Updates',
  manage: 'Manage',
  postDone: 'Posted',
  verify: 'Verify ID',
}
const HIDE_TABBAR: Route['name'][] = ['detail', 'prefs', 'verify']

function useFrameMode() {
  const get = () => ({ framed: window.innerWidth >= 720, scale: Math.min(1, (window.innerHeight - 40) / 876) })
  const [m, setM] = useState(get)
  useEffect(() => {
    const on = () => setM(get())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return m
}

function StatusBar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[80] flex h-[54px] items-center justify-between px-8 pt-1 text-[16px] font-semibold text-ink" aria-hidden>
      <span className="w-[54px] text-center">9:41</span>
      <span className="absolute left-1/2 top-[11px] h-[34px] w-[124px] -translate-x-1/2 rounded-full bg-black" />
      <span className="flex items-center gap-1.5">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.5c2.3 0 4.4.9 6 2.4l1.1-1.2A10 10 0 0 0 8 .9 10 10 0 0 0 .9 3.7L2 4.9a8.5 8.5 0 0 1 6-2.4Zm0 3.3c1.4 0 2.7.5 3.7 1.4l1.1-1.2A7 7 0 0 0 8 4.2 7 7 0 0 0 3.2 6l1.1 1.2c1-.9 2.3-1.4 3.7-1.4Zm0 3.2c.6 0 1.1.2 1.5.5L8 11.1 6.5 9.5c.4-.3.9-.5 1.5-.5Z" /></svg>
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="20" height="9" rx="2" fill="currentColor" /><rect x="25" y="4" width="1.5" height="5" rx=".75" fill="currentColor" opacity=".5" /></svg>
      </span>
    </div>
  )
}

function DemoTools({ compact }: { compact?: boolean }) {
  const s = useStore()
  const nav = useNavInternal()
  return (
    <div className="space-y-4">
      {!compact && (
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-util">Good Deeds · iOS prototype</p>
          <h2 className="mt-1 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-ink">Maya’s happy path</h2>
        </div>
      )}
      <ol className="space-y-2 text-[14px] leading-snug text-grey">
        {[
          'Get started → “Fill with Maya’s demo details” → Continue',
          'Pick Outdoors + Group → accept T&Cs → Use demo ID',
          'Open Seafront Beach Clean from Recommended → Join',
          'Add to calendar → View in My deeds → I’ve done it',
          'Below: “Organiser confirms my hours” (or log in as Dave)',
          'Rewards → redeem a Free flat white → share your deed',
        ].map((t, i) => (
          <li key={t} className="flex gap-2.5">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-signal text-[12px] font-bold text-ink">{i + 1}</span>
            {t}
          </li>
        ))}
      </ol>
      <div className="space-y-2 rounded-[20px] bg-paper p-4 shadow-soft">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-util">Prototype controls</p>
        <Button
          full
          size="sm"
          icon={BadgeCheck}
          onClick={() => {
            const o = s.demoOrganiserConfirm()
            nav.toast(o ? `${s.posterName(o.posterId)} marked ${o.title} complete` : 'Join a good deed first (and tap “I’ve done it”)', o ? 'ok' : 'error')
          }}
        >
          Organiser confirms my hours
        </Button>
        <Toggle checked={s.offline} onChange={s.setOffline} label="Simulate no connection" sub="Map fails; joining shows an error" />
        <Button
          full
          size="sm"
          variant="secondary"
          icon={RotateCcw}
          onClick={() =>
            nav.alert({
              title: 'Reset the demo?',
              message: 'All accounts, joins, posts and points go back to the original seed data.',
              actions: [
                { label: 'Cancel', style: 'cancel' },
                { label: 'Reset', style: 'destructive', onPress: s.reset },
              ],
            })
          }
        >
          Reset demo data
        </Button>
      </div>
      <p className="text-[12px] leading-snug text-util">All people, organisers, businesses and vouchers are fictional. “Today” is Thursday 12 November 2026.</p>
    </div>
  )
}


function Shell() {
  const s = useStore()
  const [phase, setPhase] = useState<Phase>(s.me ? 'app' : 'welcome')
  const [tab, setTabState] = useState<Tab>('find')
  const [stacks, setStacks] = useState<Record<Tab, Route[]>>(EMPTY_STACKS)
  const [modal, setModal] = useState<Modal | null>(null)
  const [alert, setAlert] = useState<AlertConfig | null>(null)
  const [toast, setToast] = useState<{ text: string; tone: 'default' | 'ok' | 'error'; key: number } | null>(null)
  const [returnTo, setReturnTo] = useState<string | undefined>()
  const toastTimer = useRef<number>(0)
  const tabRef = useRef<Tab>(tab)
  tabRef.current = tab
  const { framed, scale } = useFrameMode()

  useEffect(() => {
    if (s.resetCount === 0) return
    setPhase('welcome')
    setTabState('find')
    setStacks(EMPTY_STACKS)
    setModal(null)
  }, [s.resetCount])

  const nav: Nav = useMemo(
    () => ({
      tab,
      setTab: (t) => {
        if (t === tabRef.current) setStacks((x) => ({ ...x, [t]: [] }))
        tabRef.current = t
        setTabState(t)
      },
      push: (r) => {
        const t = tabRef.current
        setStacks((x) => ({ ...x, [t]: [...x[t], r] }))
      },
      pop: () => {
        const t = tabRef.current
        setStacks((x) => ({ ...x, [t]: x[t].slice(0, -1) }))
      },
      popToRoot: () => {
        const t = tabRef.current
        setStacks((x) => ({ ...x, [t]: [] }))
      },
      present: setModal,
      dismiss: () => setModal(null),
      toast: (text, tone = 'default') => {
        window.clearTimeout(toastTimer.current)
        setToast({ text, tone, key: Date.now() })
        toastTimer.current = window.setTimeout(() => setToast(null), 2800)
      },
      alert: setAlert,
      setPhase: (p) => {
        setPhase(p)
        setModal(null)
        if (p !== 'app') {
          setStacks(EMPTY_STACKS)
          setTabState('find')
        }
      },
      openOpp: (id, t = tabRef.current) => {
        tabRef.current = t
        setTabState(t)
        setStacks((x) => ({ ...x, [t]: id ? [{ name: 'detail', id }] : [] }))
      },
      requireAccount: (reason, rt) => {
        if (s.me) return true
        setReturnTo(rt)
        setModal({ name: 'gate', reason })
        return false
      },
    }),
    [tab, s.me],
  )

  // Surface organiser confirmations when the volunteer next opens the app
  const unseen = s.myNotes.filter((n) => !n.seen)
  const shownNote = useRef<string | null>(null)
  useEffect(() => {
    if (phase !== 'app' || !unseen.length || shownNote.current === unseen[0].id) return
    shownNote.current = unseen[0].id
    nav.toast(unseen[0].text, 'ok')
  }, [phase, unseen, nav])

  const afterAuth = useCallback(() => {
    setPhase('app')
    setTabState('find')
    setStacks({ ...EMPTY_STACKS, find: returnTo ? [{ name: 'detail', id: returnTo }] : [] })
    setReturnTo(undefined)
  }, [returnTo])

  const stack = stacks[tab]
  const top = stack.at(-1)
  const showTabBar = phase === 'app' && !(top && HIDE_TABBAR.includes(top.name))

  const renderRoot = (t: Tab): ReactNode => {
    if (!s.me && t !== 'find' && t !== 'rewards')
      return t === 'profile' ? (
        <GuestProfile />
      ) : (
        <div className="pt-6">
          <EmptyState
            icon={t === 'post' ? PlusCircle : CalendarCheck}
            title={t === 'post' ? 'Post your own good deed' : 'Your good deeds will live here'}
            body={t === 'post' ? 'Create a free account to post a local activity, like a litter pick, in under a minute.' : 'Create a free account to join good deeds, save them for later and track your hours.'}
            action={<Button onClick={() => nav.setPhase('signup')}>Create an account</Button>}
          />
        </div>
      )
    switch (t) {
      case 'find':
        return <FindScreen />
      case 'deeds':
        return <MyDeedsScreen />
      case 'post':
        return <PostScreen />
      case 'rewards':
        return <RewardsScreen />
      case 'profile':
        return <ProfileScreen />
    }
  }
  const renderRoute = (r: Route): ReactNode => {
    switch (r.name) {
      case 'detail':
        return <DetailScreen id={r.id} />
      case 'voucher':
        return <VoucherScreen id={r.id} />
      case 'prefs':
        return <PrefsScreen />
      case 'terms':
        return <TermsContent />
      case 'updates':
        return <UpdatesScreen />
      case 'manage':
        return <ManageScreen id={r.id} />
      case 'postDone':
        return <PostDoneScreen id={r.id} />
      case 'verify':
        return <VerifyRoute />
    }
  }

  const tabBarPad = showTabBar ? 'calc(var(--safe-bottom) + 64px)' : '0px'

  const app = (
    <div className="relative h-full w-full overflow-hidden bg-cream">
      {phase === 'welcome' && <Welcome onStart={() => setPhase('signup')} onLogin={() => setPhase('login')} onExplore={() => setPhase('app')} />}
      {phase === 'login' && <Login onBack={() => setPhase(s.me ? 'app' : 'welcome')} onSignup={() => setPhase('signup')} onDone={afterAuth} />}
      {phase === 'signup' && <SignUp onExit={() => setPhase('welcome')} onLogin={() => setPhase('login')} onDone={afterAuth} />}

      {phase === 'app' && (
        <>
          {/* Root screen of current tab */}
          <main key={`${tab}-root`} className="absolute inset-0 overflow-y-auto" style={{ paddingTop: 'var(--safe-top)', paddingBottom: tabBarPad }} aria-hidden={!!top || undefined} inert={!!top || undefined}>
            {renderRoot(tab)}
          </main>
          {/* Pushed routes */}
          {stack.map((r, i) => {
            const isTop = i === stack.length - 1
            const isDetail = r.name === 'detail' || r.name === 'prefs' || r.name === 'verify'
            return (
              <section
                key={`${tab}-${i}-${r.name}`}
                className={cx('anim-slide absolute inset-0 flex flex-col bg-cream', !isTop && 'invisible')}
                aria-hidden={!isTop || undefined}
                inert={!isTop || undefined}
                style={{ paddingTop: r.name === 'detail' ? 0 : 'var(--safe-top)' }}
              >
                {r.name !== 'detail' && <NavBar title={ROUTE_TITLE[r.name]} onBack={nav.pop} />}
                <div className={cx('min-h-0 flex-1', r.name === 'detail' || r.name === 'prefs' ? '' : 'overflow-y-auto')} style={{ paddingBottom: isDetail ? 0 : tabBarPad }}>
                  {renderRoute(r)}
                </div>
              </section>
            )
          })}
          {showTabBar && (
            <nav aria-label="Main" className="absolute inset-x-0 bottom-0 z-30 border-t border-mist bg-paper/92 backdrop-blur-xl" style={{ paddingBottom: 'var(--safe-bottom)' }}>
              <ul className="flex">
                {TABS.map((t) => {
                  const on = t.id === tab
                  const badge = t.id === 'deeds' && s.me ? s.db.signups.filter((x) => x.userId === s.me!.id && x.status === 'joined').length : 0
                  return (
                    <li key={t.id} className="flex-1">
                      <button type="button" onClick={() => nav.setTab(t.id)} aria-current={on ? 'page' : undefined} className="flex min-h-[56px] w-full flex-col items-center justify-center gap-0.5 pt-1.5">
                        <span className={cx('relative flex h-8 w-14 items-center justify-center rounded-full transition', on ? 'bg-signal' : '')}>
                          <t.icon className={cx('size-[22px]', on ? 'text-ink' : 'text-util')} aria-hidden strokeWidth={on ? 2.4 : 2} />
                          {badge > 0 && <span className="absolute -right-0.5 -top-0.5 flex size-[18px] items-center justify-center rounded-full bg-ink text-[11px] font-bold text-paper" aria-label={`${badge} upcoming`}>{badge}</span>}
                        </span>
                        <span className={cx('text-[11px]', on ? 'font-semibold text-ink' : 'font-medium text-util')}>{t.label}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>
          )}
        </>
      )}

      {/* Modals */}
      {modal?.name === 'filters' && <FiltersSheet onClose={nav.dismiss} />}
      {modal?.name === 'joined' && <JoinedSheet id={modal.id} onClose={nav.dismiss} />}
      {modal?.name === 'complete' && <CompleteSheet id={modal.id} onClose={nav.dismiss} />}
      {modal?.name === 'terms' && (
        <Sheet title="Terms & Conditions" onClose={nav.dismiss} full>
          <TermsContent />
        </Sheet>
      )}
      {modal?.name === 'demo' && (
        <Sheet title="Prototype controls" onClose={nav.dismiss}>
          <div className="px-5 pb-8">
            <DemoTools compact />
          </div>
        </Sheet>
      )}
      {modal?.name === 'gate' && (
        <Sheet onClose={nav.dismiss} label="Create an account">
          <div className="px-5 pb-8 pt-3 text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-signal" aria-hidden>
              <Sparkle className="size-7 fill-current text-ink" />
            </span>
            <h2 className="mt-4 text-[24px] font-semibold text-ink">One quick step</h2>
            <p className="mx-auto mt-2 max-w-[32ch] text-[16px] leading-relaxed text-grey">{modal.reason}</p>
            <div className="mt-6 space-y-2" style={{ paddingBottom: 'var(--safe-bottom)' }}>
              <Button size="lg" full onClick={() => (setModal(null), setPhase('signup'))}>
                Create an account
              </Button>
              <Button size="lg" variant="secondary" full onClick={() => (setModal(null), setPhase('login'))}>
                Log in
              </Button>
              <Button variant="ghost" full onClick={() => (setReturnTo(undefined), nav.dismiss())}>
                Not now
              </Button>
            </div>
          </div>
        </Sheet>
      )}
      {alert && <AlertView config={alert} onDone={() => setAlert(null)} />}

      {/* Toast */}
      <div className="pointer-events-none absolute inset-x-0 z-[70] flex justify-center px-4" style={{ top: 'calc(var(--safe-top) + 6px)' }} aria-live="polite" role="status">
        {toast && (
          <div key={toast.key} className={cx('anim-toast pointer-events-auto flex max-w-full items-start gap-2 rounded-[20px] px-4 py-3 text-[15px] font-medium shadow-soft', toast.tone === 'error' ? 'bg-bad text-white' : 'bg-ink text-paper')}>
            {toast.tone === 'ok' ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-signal" aria-hidden /> : toast.tone === 'error' ? <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden /> : <Info className="mt-0.5 size-5 shrink-0 text-signal" aria-hidden />}
            <span>{toast.text}</span>
          </div>
        )}
      </div>
      {s.offline && phase === 'app' && (
        <span className="sr-only" role="status">
          <WifiOff /> Offline
        </span>
      )}
    </div>
  )

  return (
    <NavCtx.Provider value={nav}>
      {framed ? (
        <div className="flex min-h-full items-center justify-center gap-14 bg-[#efe9d8] p-5">
          <div style={{ width: 393 * scale + 24, height: 852 * scale + 24 }} className="shrink-0">
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 417, height: 876 }}>
              <div className="relative h-[876px] w-[417px] rounded-[68px] bg-[#1d1c1a] p-3 shadow-[0_40px_80px_rgba(80,64,20,0.28)]">
                <div className="relative h-full w-full overflow-hidden rounded-[56px]" style={{ ['--safe-top' as string]: '54px', ['--safe-bottom' as string]: '26px' }}>
                  <StatusBar />
                  {app}
                  <span className="pointer-events-none absolute bottom-2 left-1/2 z-[90] h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-ink" aria-hidden />
                </div>
              </div>
            </div>
          </div>
          <aside className="hidden w-[300px] lg:block" aria-label="Prototype guide">
            <DemoTools />
          </aside>
        </div>
      ) : (
        <div className="h-[100dvh] w-full" style={{ ['--safe-top' as string]: 'max(env(safe-area-inset-top), 12px)', ['--safe-bottom' as string]: 'max(env(safe-area-inset-bottom), 8px)' }}>
          {app}
        </div>
      )}
      {framed && (
        <button type="button" onClick={() => setModal({ name: 'demo' })} className="fixed bottom-5 right-5 flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-[14px] font-semibold text-paper lg:hidden">
          <FlaskConical className="size-4" aria-hidden /> Prototype controls
        </button>
      )}
    </NavCtx.Provider>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
