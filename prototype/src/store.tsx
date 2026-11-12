import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  FICTIONAL_ATTENDEES,
  OFFERS,
  POSTER_NAMES,
  SEED_NOTES,
  SEED_OPPS,
  SEED_REDEMPTIONS,
  SEED_SIGNUPS,
  SEED_USERS,
  TODAY,
  BUSINESSES,
  type Note,
  type Opportunity,
  type Redemption,
  type Signup,
  type User,
  type CategoryId,
} from './data'
import { daysFromToday, fmtHours, isWeekend, miles, originFor, uid, voucherCode } from './utils'

interface DB {
  users: User[]
  opps: Opportunity[]
  signups: Signup[]
  redemptions: Redemption[]
  notes: Note[]
  saved: { userId: string; oppId: string }[]
  currentUserId: string | null
}

export interface Filters {
  q: string
  cats: CategoryId[]
  io: 'any' | 'indoor' | 'outdoor'
  manual: 'any' | 'manual' | 'nonmanual'
  sg: 'any' | 'individual' | 'group'
  mode: 'any' | 'inperson' | 'online'
  skills: string[]
  when: 'any' | 'weekend' | 'week'
  time: 'any' | '1' | '2'
}
export const EMPTY_FILTERS: Filters = { q: '', cats: [], io: 'any', manual: 'any', sg: 'any', mode: 'any', skills: [], when: 'any', time: 'any' }
export const activeFilterCount = (f: Filters) =>
  f.cats.length + f.skills.length + ['io', 'manual', 'sg', 'mode', 'when', 'time'].filter((k) => f[k as keyof Filters] !== 'any').length

const KEY = 'gooddeeds-demo-v1'
const seed = (): DB => ({
  users: structuredClone(SEED_USERS),
  opps: structuredClone(SEED_OPPS),
  signups: structuredClone(SEED_SIGNUPS),
  redemptions: structuredClone(SEED_REDEMPTIONS),
  notes: structuredClone(SEED_NOTES),
  saved: [],
  currentUserId: null,
})
const load = (): DB => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return seed()
}

export type JoinResult = 'ok' | 'offline' | 'full' | 'already'

function useDbStore() {
  const [db, setDb] = useState<DB>(load)
  const [offline, setOffline] = useState(false)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [view, setView] = useState<'list' | 'map'>('list')
  const [resetCount, setResetCount] = useState(0)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(db))
  }, [db])

  const me = db.users.find((u) => u.id === db.currentUserId) ?? null
  const origin = originFor(me?.postcode ?? 'BN1 1AA')

  const posterName = useCallback(
    (id: string) => POSTER_NAMES[id] ?? db.users.find((u) => u.id === id)?.firstName ?? 'A neighbour',
    [db.users],
  )
  const personName = (id: string) =>
    FICTIONAL_ATTENDEES[id] ?? db.users.find((u) => u.id === id)?.firstName ?? 'Volunteer'

  const active = (s: Signup) => s.status === 'joined' || s.status === 'pending'
  const spacesLeft = (o: Opportunity) =>
    Math.max(0, o.capacity - o.otherAttendees - db.signups.filter((s) => s.oppId === o.id && active(s)).length)
  const mySignup = (oppId: string) =>
    me ? db.signups.find((s) => s.oppId === oppId && s.userId === me.id && s.status !== 'cancelled') ??
      db.signups.filter((s) => s.oppId === oppId && s.userId === me.id).at(-1) ?? null : null
  const opp = (id: string) => db.opps.find((o) => o.id === id)
  const distance = (o: Opportunity) => miles(origin, o)
  const isSaved = (oppId: string) => !!me && db.saved.some((s) => s.userId === me.id && s.oppId === oppId)

  const findable = useMemo(
    () =>
      db.opps
        .filter((o) => o.status === 'open' && daysFromToday(o.date) >= 0)
        .filter((o) => {
          const mine = mySignup(o.id)
          return spacesLeft(o) > 0 || (mine && active(mine))
        })
        .sort((a, b) => distance(a) - distance(b)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [db, origin.lat, origin.lng],
  )

  const matchReasons = (o: Opportunity, u: User | null = me) => {
    if (!u || !u.prefsSet) return []
    const r: string[] = []
    if (u.indoorOutdoor !== 'either' && u.indoorOutdoor === o.indoorOutdoor) r.push(o.indoorOutdoor === 'outdoor' ? 'Outdoor' : 'Indoor')
    if (u.soloGroup === 'group' && o.type === 'group') r.push('Group')
    if (u.soloGroup === 'solo' && o.type === 'individual') r.push('Solo')
    if (u.manualPref === 'manual' && o.manual) r.push('Hands-on')
    if (u.manualPref === 'nonmanual' && !o.manual) r.push('Non-manual')
    o.skills.filter((s) => u.skills.includes(s)).forEach((s) => r.push(`Uses your ${s} skill`))
    return r
  }
  const recommended = useMemo(() => {
    if (!me?.prefsSet) return []
    return findable
      .filter((o) => !mySignup(o.id) || mySignup(o.id)?.status === 'cancelled')
      .map((o) => ({ o, score: matchReasons(o).length }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || distance(a.o) - distance(b.o))
      .slice(0, 3)
      .map((x) => x.o)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [findable, me])

  const applyFilters = (list: Opportunity[], f: Filters) =>
    list.filter((o) => {
      const q = f.q.trim().toLowerCase()
      if (q && !`${o.title} ${o.place} ${o.category} ${o.description} ${o.skills.join(' ')}`.toLowerCase().includes(q)) return false
      if (f.cats.length && !f.cats.includes(o.category)) return false
      if (f.io !== 'any' && o.indoorOutdoor !== f.io) return false
      if (f.manual === 'manual' && !o.manual) return false
      if (f.manual === 'nonmanual' && o.manual) return false
      if (f.sg !== 'any' && o.type !== f.sg) return false
      if (f.mode === 'online' && !o.online) return false
      if (f.mode === 'inperson' && o.online) return false
      if (f.skills.length && !f.skills.some((s) => o.skills.includes(s))) return false
      if (f.when === 'weekend' && !isWeekend(o.date)) return false
      if (f.when === 'week' && daysFromToday(o.date) > 7) return false
      if (f.time !== 'any' && o.hours > Number(f.time)) return false
      return true
    })

  const stats = (userId = me?.id) => {
    const mine = db.signups.filter((s) => s.userId === userId)
    const hoursOf = (s: Signup) => opp(s.oppId)?.hours ?? 0
    const confirmed = mine.filter((s) => s.status === 'confirmed')
    const pending = mine.filter((s) => s.status === 'pending')
    const earned = confirmed.reduce((a, s) => a + s.points, 0)
    const spent = db.redemptions.filter((r) => r.userId === userId).reduce((a, r) => a + r.points, 0)
    return {
      confirmedHours: confirmed.reduce((a, s) => a + hoursOf(s), 0),
      pendingHours: pending.reduce((a, s) => a + hoursOf(s), 0),
      pendingPoints: pending.reduce((a, s) => a + hoursOf(s) * 10, 0),
      points: earned - spent,
      deeds: confirmed.length,
      confirmed,
    }
  }

  // ----- actions
  const login = (email: string): 'ok' | 'notfound' => {
    const u = db.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase())
    if (!u) return 'notfound'
    setDb((d) => ({ ...d, currentUserId: u.id }))
    return 'ok'
  }
  const emailExists = (email: string) => db.users.some((x) => x.email.toLowerCase() === email.trim().toLowerCase())
  const createUser = (u: Omit<User, 'id'>) => {
    const user: User = { ...u, id: uid('u') }
    setDb((d) => ({ ...d, users: [...d.users, user], currentUserId: user.id }))
    return user
  }
  const logout = () => setDb((d) => ({ ...d, currentUserId: null }))
  const updateMe = (patch: Partial<User>) =>
    setDb((d) => ({ ...d, users: d.users.map((u) => (u.id === d.currentUserId ? { ...u, ...patch } : u)) }))

  const join = (oppId: string): JoinResult => {
    const o = opp(oppId)
    if (!me || !o) return 'full'
    if (offline) return 'offline'
    const existing = mySignup(oppId)
    if (existing && existing.status !== 'cancelled') return 'already'
    if (spacesLeft(o) <= 0) return 'full'
    setDb((d) => ({
      ...d,
      signups: [...d.signups, { id: uid('s'), oppId, userId: me.id, status: 'joined', joinedAt: new Date().toISOString(), points: 0 }],
    }))
    return 'ok'
  }
  const setMyStatus = (oppId: string, fn: (s: Signup, o: Opportunity) => Signup) =>
    setDb((d) => ({
      ...d,
      signups: d.signups.map((s) =>
        s.oppId === oppId && s.userId === d.currentUserId && s.status !== 'cancelled' && s.status !== 'confirmed'
          ? fn(s, d.opps.find((o) => o.id === oppId)!)
          : s,
      ),
    }))
  const cancel = (oppId: string) => setMyStatus(oppId, (s) => ({ ...s, status: 'cancelled' }))
  const markDone = (oppId: string) =>
    setMyStatus(oppId, (s, o) =>
      o.status === 'completed'
        ? { ...s, status: 'confirmed', doneAt: new Date().toISOString(), confirmedAt: new Date().toISOString(), points: o.hours * 10 }
        : { ...s, status: 'pending', doneAt: new Date().toISOString() },
    )
  const toggleSave = (oppId: string) => {
    if (!me) return false
    const now = !isSaved(oppId)
    setDb((d) => ({
      ...d,
      saved: now ? [...d.saved, { userId: me.id, oppId }] : d.saved.filter((s) => !(s.userId === me.id && s.oppId === oppId)),
    }))
    return now
  }
  const post = (o: Omit<Opportunity, 'id' | 'posterId' | 'status' | 'createdAt' | 'otherAttendees'>) => {
    const created: Opportunity = { ...o, id: uid('o'), posterId: me!.id, status: 'open', createdAt: new Date().toISOString(), otherAttendees: 0 }
    setDb((d) => ({ ...d, opps: [created, ...d.opps] }))
    return created
  }
  const markComplete = (oppId: string, ticked: string[]) => {
    const o = opp(oppId)!
    const att = db.signups.filter((s) => s.oppId === oppId && active(s))
    const confirmedIds = att.filter((s) => ticked.includes(s.userId)).map((s) => s.userId)
    const now = new Date().toISOString()
    setDb((d) => ({
      ...d,
      opps: d.opps.map((x) => (x.id === oppId ? { ...x, status: 'completed' } : x)),
      signups: d.signups.map((s) =>
        s.oppId === oppId && active(s)
          ? ticked.includes(s.userId)
            ? { ...s, status: 'confirmed', confirmedAt: now, points: o.hours * 10 }
            : { ...s, status: 'cancelled' }
          : s,
      ),
      notes: [
        ...d.notes,
        ...confirmedIds.map((userId) => ({
          id: uid('n'),
          userId,
          oppId,
          at: now,
          seen: false,
          text: `+${o.hours * 10} points – your ${fmtHours(o.hours)} at ${o.title} were confirmed`,
        })),
      ],
    }))
    return { count: confirmedIds.length, hours: confirmedIds.length * o.hours }
  }
  const attendees = (oppId: string) => db.signups.filter((s) => s.oppId === oppId && s.status !== 'cancelled')
  const redeem = (offerId: string) => {
    const offer = OFFERS.find((x) => x.id === offerId)!
    if (!me || stats().points < offer.cost) return null
    const r: Redemption = { id: uid('r'), userId: me.id, offerId, points: offer.cost, code: voucherCode(), at: new Date().toISOString() }
    setDb((d) => ({ ...d, redemptions: [...d.redemptions, r] }))
    return r
  }
  const myNotes = me ? db.notes.filter((n) => n.userId === me.id).sort((a, b) => b.at.localeCompare(a.at)) : []
  const markNotesSeen = () =>
    setDb((d) => ({ ...d, notes: d.notes.map((n) => (n.userId === d.currentUserId ? { ...n, seen: true } : n)) }))

  /** Prototype control: stands in for the organiser logging in and tapping Mark complete. */
  const demoOrganiserConfirm = () => {
    if (!me) return null
    const mine = db.signups.filter((s) => s.userId === me.id && active(s))
    const target = mine.find((s) => s.status === 'pending') ?? mine[0]
    if (!target) return null
    const o = opp(target.oppId)!
    if (o.posterId === me.id) return null
    const ticked = db.signups.filter((s) => s.oppId === o.id && active(s)).map((s) => s.userId)
    markComplete(o.id, ticked)
    return o
  }
  const reset = () => {
    localStorage.removeItem(KEY)
    setDb(seed())
    setFilters(EMPTY_FILTERS)
    setView('list')
    setOffline(false)
    setResetCount((n) => n + 1)
  }

  return {
    db,
    me,
    origin,
    offline,
    setOffline,
    filters,
    setFilters,
    view,
    setView,
    resetCount,
    posterName,
    personName,
    spacesLeft,
    mySignup,
    opp,
    distance,
    isSaved,
    findable,
    recommended,
    matchReasons,
    applyFilters,
    stats,
    login,
    emailExists,
    createUser,
    logout,
    updateMe,
    join,
    cancel,
    markDone,
    toggleSave,
    post,
    markComplete,
    attendees,
    redeem,
    myNotes,
    markNotesSeen,
    demoOrganiserConfirm,
    reset,
    offers: OFFERS,
    businesses: BUSINESSES,
    today: TODAY,
  }
}

export type Store = ReturnType<typeof useDbStore>
const Ctx = createContext<Store | null>(null)
export function StoreProvider({ children }: { children: ReactNode }) {
  const s = useDbStore()
  return <Ctx.Provider value={s}>{children}</Ctx.Provider>
}
export const useStore = () => useContext(Ctx)!
