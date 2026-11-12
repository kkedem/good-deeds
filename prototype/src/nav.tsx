import { createContext, useContext } from 'react'
import type { AlertConfig } from './components/ui'

export type Tab = 'find' | 'deeds' | 'post' | 'rewards' | 'profile'
export type Route =
  | { name: 'detail'; id: string }
  | { name: 'voucher'; id: string }
  | { name: 'prefs' }
  | { name: 'terms' }
  | { name: 'updates' }
  | { name: 'manage'; id: string }
  | { name: 'postDone'; id: string }
  | { name: 'verify' }

export type Modal =
  | { name: 'filters' }
  | { name: 'joined'; id: string }
  | { name: 'gate'; reason: string; returnTo?: string }
  | { name: 'demo' }
  | { name: 'complete'; id: string }
  | { name: 'terms' }

export type Phase = 'welcome' | 'login' | 'signup' | 'app'

export interface Nav {
  tab: Tab
  setTab: (t: Tab) => void
  push: (r: Route) => void
  pop: () => void
  popToRoot: () => void
  present: (m: Modal) => void
  dismiss: () => void
  toast: (text: string, tone?: 'default' | 'ok' | 'error') => void
  alert: (a: AlertConfig) => void
  setPhase: (p: Phase) => void
  /** Opens the detail screen on the given tab, resetting that stack */
  openOpp: (id: string, tab?: Tab) => void
  /** Prompts guests to create an account. Returns true if the user already has one. */
  requireAccount: (reason: string, returnTo?: string) => boolean
}
export const NavCtx = createContext<Nav | null>(null)
export const useNav = () => useContext(NavCtx)!
