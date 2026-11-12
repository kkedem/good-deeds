import { forwardRef, useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import {
  ArrowLeftRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Dog,
  Hourglass,
  Laptop,
  Loader2,
  ShoppingBasket,
  SprayCan,
  Sprout,
  Trash2,
  Waves,
  X,
  XCircle,
  Bookmark,
  type LucideIcon,
} from 'lucide-react'
import type { CategoryId } from '../data'

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

export const CATEGORY_ICON: Record<CategoryId, LucideIcon> = {
  litter: Trash2,
  graffiti: SprayCan,
  beach: Waves,
  greening: Sprout,
  foodbank: ShoppingBasket,
  animal: Dog,
  schooltech: Laptop,
  skillswap: ArrowLeftRight,
}

/* ---------- Buttons ---------- */
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark'
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  size?: 'md' | 'lg' | 'sm'
  loading?: boolean
  icon?: LucideIcon
  full?: boolean
}
export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button(
  { variant = 'primary', size = 'md', loading, icon: Icon, full, className, children, disabled, ...rest },
  ref,
) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[transform,background-color,box-shadow] duration-150 active:scale-[0.97] select-none disabled:active:scale-100'
  const sizes = { sm: 'min-h-11 px-4 text-[15px]', md: 'min-h-12 px-5 text-base', lg: 'min-h-14 px-6 text-[17px]' }
  const variants: Record<BtnVariant, string> = {
    primary: 'bg-signal text-ink active:bg-signal-deep shadow-[0_6px_16px_rgba(233,181,32,0.35)] disabled:bg-mist disabled:text-util disabled:shadow-none',
    secondary: 'bg-paper text-ink border-2 border-ink/80 active:bg-pale disabled:border-mist disabled:text-util',
    ghost: 'text-ink active:bg-ink/5 disabled:text-util',
    danger: 'bg-bad-bg text-bad active:bg-[#f3cdc7]',
    dark: 'bg-ink text-paper active:bg-black disabled:bg-mist disabled:text-util',
  }
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(base, sizes[size], variants[variant], full && 'w-full', className)}
      {...rest}
    >
      {loading ? <Loader2 className="size-5 animate-spin" aria-hidden /> : Icon ? <Icon className="size-5" aria-hidden /> : null}
      {children}
    </button>
  )
})

export function IconButton({
  label,
  icon: Icon,
  onClick,
  tone = 'plain',
  pressed,
  badge,
  className,
}: {
  label: string
  icon: LucideIcon
  onClick?: () => void
  tone?: 'plain' | 'glass' | 'soft'
  pressed?: boolean
  badge?: number
  className?: string
}) {
  const tones = {
    plain: 'text-ink active:bg-ink/8',
    glass: 'bg-paper/90 text-ink shadow-lift backdrop-blur active:bg-paper',
    soft: 'bg-paper text-ink border border-mist active:bg-pale',
  }
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={cx('relative inline-flex size-11 shrink-0 items-center justify-center rounded-full transition', tones[tone], className)}
    >
      <Icon className={cx('size-[22px]', pressed && 'fill-current')} aria-hidden />
      {!!badge && (
        <span className="absolute right-1 top-1 flex min-w-[18px] items-center justify-center rounded-full bg-ink px-1 text-[11px] font-bold text-paper">
          {badge}
        </span>
      )}
    </button>
  )
}

/* ---------- Chips & tags ---------- */
export function Chip({
  selected,
  onClick,
  children,
  icon: Icon,
  className,
}: {
  selected?: boolean
  onClick?: () => void
  children: ReactNode
  icon?: LucideIcon
  className?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cx(
        'inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border-2 px-4 text-[15px] font-medium transition active:scale-[0.97]',
        selected ? 'border-ink bg-ink text-paper' : 'border-mist bg-paper text-ink active:bg-pale',
        className,
      )}
    >
      {selected ? <Check className="size-4" aria-hidden /> : Icon ? <Icon className="size-4" aria-hidden /> : null}
      {children}
    </button>
  )
}

export function RemovableChip({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-full bg-ink py-1 pl-3 pr-2 text-sm font-medium text-paper active:opacity-80"
    >
      {children}
      <span className="sr-only">– remove filter</span>
      <X className="size-4" aria-hidden />
    </button>
  )
}

export function Tag({ children, tone = 'soft', icon: Icon }: { children: ReactNode; tone?: 'soft' | 'pale' | 'line' | 'signal' | 'white'; icon?: LucideIcon }) {
  const tones = {
    soft: 'bg-soft text-ink',
    pale: 'bg-pale text-ink',
    line: 'border border-mist text-grey bg-paper',
    signal: 'bg-signal text-ink',
    white: 'bg-paper/95 text-ink',
  }
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-medium leading-none', tones[tone])}>
      {Icon && <Icon className="size-3.5" aria-hidden />}
      {children}
    </span>
  )
}

export type StatusKind = 'joined' | 'pending' | 'confirmed' | 'cancelled' | 'full' | 'saved' | 'completed' | 'open' | 'verified' | 'unverified'
const STATUS: Record<StatusKind, { label: string; cls: string; icon: LucideIcon }> = {
  joined: { label: 'You’re going', cls: 'bg-soft text-ink', icon: Check },
  pending: { label: 'Pending confirmation', cls: 'bg-wait-bg text-wait', icon: Hourglass },
  confirmed: { label: 'Confirmed', cls: 'bg-ok-bg text-ok', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', cls: 'bg-mist text-grey', icon: XCircle },
  full: { label: 'Full', cls: 'bg-mist text-grey', icon: XCircle },
  saved: { label: 'Saved', cls: 'bg-pale text-ink', icon: Bookmark },
  completed: { label: 'Completed', cls: 'bg-ok-bg text-ok', icon: CheckCircle2 },
  open: { label: 'Open', cls: 'bg-pale text-ink', icon: Clock3 },
  verified: { label: 'Verified', cls: 'bg-ok-bg text-ok', icon: CheckCircle2 },
  unverified: { label: 'Not verified', cls: 'bg-mist text-grey', icon: XCircle },
}
export function StatusBadge({ kind, label }: { kind: StatusKind; label?: string }) {
  const s = STATUS[kind]
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-semibold leading-none', s.cls)}>
      <s.icon className="size-3.5" aria-hidden />
      {label ?? s.label}
    </span>
  )
}

export function CategoryBadge({ id, size = 'md' }: { id: CategoryId; size?: 'sm' | 'md' | 'lg' }) {
  const Icon = CATEGORY_ICON[id]
  const s = { sm: 'size-8', md: 'size-10', lg: 'size-12' }[size]
  return (
    <span className={cx('inline-flex shrink-0 items-center justify-center rounded-full bg-signal text-ink', s)} aria-hidden>
      <Icon className={size === 'sm' ? 'size-4' : 'size-5'} />
    </span>
  )
}

/* ---------- Segmented ---------- */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string; icon?: LucideIcon }[]
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-full bg-mist/70 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            'flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-[15px] font-semibold transition',
            value === o.value ? 'bg-paper text-ink shadow-[0_2px_8px_rgba(128,110,57,0.18)]' : 'text-grey',
          )}
        >
          {o.icon && <o.icon className="size-4" aria-hidden />}
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ---------- Navigation bar ---------- */
export function NavBar({
  title,
  onBack,
  backLabel = 'Back',
  right,
  onClose,
  transparent,
}: {
  title?: string
  onBack?: () => void
  backLabel?: string
  right?: ReactNode
  onClose?: () => void
  transparent?: boolean
}) {
  return (
    <div
      className={cx('sticky top-0 z-20 flex min-h-[52px] items-center gap-1 px-2', !transparent && 'bg-cream/90 backdrop-blur-md')}
      style={{ paddingTop: transparent ? 0 : undefined }}
    >
      <div className="flex min-w-[88px] items-center">
        {onBack && (
          <button type="button" onClick={onBack} className="flex min-h-11 items-center gap-0.5 rounded-full pl-1 pr-3 text-[17px] font-medium text-ink active:bg-ink/5">
            <ChevronLeft className="size-6" aria-hidden />
            {backLabel}
          </button>
        )}
      </div>
      <h1 className="flex-1 truncate text-center text-[17px] font-semibold text-ink">{title}</h1>
      <div className="flex min-w-[88px] items-center justify-end">
        {right}
        {onClose && <IconButton label="Close" icon={X} onClick={onClose} />}
      </div>
    </div>
  )
}

export function LargeTitle({ children, sub, right }: { children: ReactNode; sub?: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 px-5 pb-3 pt-2">
      <div className="min-w-0">
        <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.02em] text-ink">{children}</h1>
        {sub && <div className="mt-1 text-[15px] text-util">{sub}</div>}
      </div>
      {right}
    </div>
  )
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx('text-[12px] font-semibold uppercase tracking-[0.14em] text-util', className)}>{children}</p>
}

export function SectionHeader({ title, action, id }: { title: string; action?: ReactNode; id?: string }) {
  return (
    <div className="flex items-center justify-between px-5 pb-3 pt-6">
      <h2 id={id} className="text-[20px] font-semibold tracking-[-0.01em] text-ink">
        {title}
      </h2>
      {action}
    </div>
  )
}

/* ---------- Surfaces ---------- */
export function Card({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'li' }) {
  const C = as
  return <C className={cx('rounded-[20px] bg-paper shadow-soft', className)}>{children}</C>
}

export function InfoRow({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 py-3">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-pale text-ink" aria-hidden>
        <Icon className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-util">{label}</p>
        <div className="text-[16px] leading-snug text-ink">{children}</div>
      </div>
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="mx-5 flex flex-col items-center rounded-[28px] bg-pale px-6 py-10 text-center">
      <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-signal text-ink" aria-hidden>
        <Icon className="size-7" />
      </span>
      <h3 className="text-[19px] font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-[30ch] text-[15px] leading-relaxed text-grey">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Banner({
  tone = 'info',
  icon: Icon,
  children,
  action,
}: {
  tone?: 'info' | 'warn' | 'error' | 'ok'
  icon: LucideIcon
  children: ReactNode
  action?: ReactNode
}) {
  const tones = { info: 'bg-pale text-ink', warn: 'bg-wait-bg text-wait', error: 'bg-bad-bg text-bad', ok: 'bg-ok-bg text-ok' }
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cx('flex items-start gap-3 rounded-[20px] p-4', tones[tone])}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1 text-[15px] leading-snug">{children}</div>
      {action}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('skeleton rounded-[12px]', className)} aria-hidden />
}
export function CardSkeleton() {
  return (
    <div className="flex gap-3 rounded-[20px] bg-paper p-3 shadow-soft" aria-hidden>
      <Skeleton className="size-[92px] shrink-0 rounded-[14px]" />
      <div className="flex-1 space-y-2 py-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

/* ---------- Form fields ---------- */
export const Field = forwardRef<
  HTMLInputElement,
  {
    label: string
    id: string
    error?: string | ReactNode
    hint?: string
    value: string
    onChange: (v: string) => void
    type?: string
    autoComplete?: string
    inputMode?: 'text' | 'email' | 'numeric' | 'tel'
    placeholder?: string
    max?: string
    min?: string
    maxLength?: number
    autoCapitalize?: string
    optional?: boolean
  }
>(function Field({ label, id, error, hint, value, onChange, optional, ...rest }, ref) {
  const describedBy = [error && `${id}-err`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-[15px] font-semibold text-ink">
        {label}
        {optional && <span className="text-[13px] font-medium text-util">Optional</span>}
      </label>
      <input
        ref={ref}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy}
        className={cx(
          'min-h-[52px] w-full rounded-[14px] border-2 bg-paper px-4 text-[17px] text-ink outline-none transition placeholder:text-quiet focus:border-ink',
          error ? 'border-bad' : 'border-mist',
        )}
        {...rest}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-util">
          {hint}
        </p>
      )}
      {error && (
        <div id={`${id}-err`} className="mt-1.5 flex items-start gap-1.5 text-[14px] font-medium text-bad">
          <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
})

export function Checkbox({ checked, onChange, children, id }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; id: string }) {
  return (
    <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 py-1">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className={cx(
          'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-[8px] border-2 transition peer-focus-visible:outline-3 peer-focus-visible:outline-ink',
          checked ? 'border-ink bg-ink text-paper' : 'border-quiet bg-paper',
        )}
      >
        {checked && <Check className="size-4" strokeWidth={3} />}
      </span>
      <span className="text-[16px] leading-snug text-ink">{children}</span>
    </label>
  )
}

export function Toggle({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex min-h-14 w-full items-center gap-3 py-2 text-left">
      <span className="flex-1">
        <span className="block text-[16px] font-medium text-ink">{label}</span>
        {sub && <span className="block text-[13px] text-util">{sub}</span>}
      </span>
      <span className={cx('relative h-[31px] w-[51px] shrink-0 rounded-full transition', checked ? 'bg-ink' : 'bg-mist')}>
        <span className={cx('absolute top-[2px] size-[27px] rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-[2px]')} />
      </span>
    </button>
  )
}

/* ---------- Modal sheet ---------- */
export function Sheet({
  title,
  onClose,
  children,
  footer,
  full,
  label,
}: {
  title?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  full?: boolean
  label?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <button type="button" aria-label="Dismiss" tabIndex={-1} className="anim-fade absolute inset-0 bg-ink/40" onClick={onClose} />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={label ?? title}
        className={cx('anim-sheet relative flex flex-col rounded-t-[28px] bg-cream outline-none', full ? 'h-[calc(100%-var(--safe-top)-8px)]' : 'max-h-[88%]')}
      >
        <div className="flex justify-center pt-2" aria-hidden>
          <span className="h-[5px] w-9 rounded-full bg-quiet/60" />
        </div>
        {title !== undefined && (
          <div className="flex items-center justify-between px-5 pb-2 pt-2">
            <h2 className="text-[20px] font-semibold text-ink">{title}</h2>
            <IconButton label="Close" icon={X} tone="soft" onClick={onClose} />
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <div className="border-t border-mist bg-cream px-5 pt-3" style={{ paddingBottom: 'calc(var(--safe-bottom) + 12px)' }}>{footer}</div>}
      </div>
    </div>
  )
}

/* ---------- iOS alert ---------- */
export interface AlertConfig {
  title: string
  message?: string
  actions: { label: string; style?: 'default' | 'cancel' | 'destructive' | 'bold'; onPress?: () => void }[]
  sheet?: boolean // action-sheet presentation
}
export function AlertView({ config, onDone }: { config: AlertConfig; onDone: () => void }) {
  const first = useRef<HTMLButtonElement>(null)
  useEffect(() => first.current?.focus(), [])
  const btnCls = (s?: string) =>
    cx('min-h-[50px] w-full px-4 text-[17px]', s === 'destructive' ? 'text-bad font-semibold' : s === 'cancel' || s === 'bold' ? 'font-semibold text-ink' : 'text-ink')
  if (config.sheet) {
    const cancel = config.actions.find((a) => a.style === 'cancel')
    const rest = config.actions.filter((a) => a.style !== 'cancel')
    return (
      <div className="absolute inset-0 z-[60] flex flex-col justify-end px-2" style={{ paddingBottom: 'calc(var(--safe-bottom) + 8px)' }} role="alertdialog" aria-modal="true" aria-label={config.title}>
        <div className="anim-fade absolute inset-0 bg-ink/40" onClick={onDone} aria-hidden />
        <div className="anim-sheet relative space-y-2">
          <div className="overflow-hidden rounded-[14px] bg-paper/95 backdrop-blur">
            <div className="px-5 py-4 text-center">
              <p className="text-[14px] font-semibold text-ink">{config.title}</p>
              {config.message && <p className="mt-1 text-[14px] leading-snug text-grey">{config.message}</p>}
            </div>
            {rest.map((a, i) => (
              <button key={a.label} ref={i === 0 ? first : undefined} type="button" className={cx(btnCls(a.style), 'border-t border-mist active:bg-mist/60')} onClick={() => (onDone(), a.onPress?.())}>
                {a.label}
              </button>
            ))}
          </div>
          {cancel && (
            <button type="button" className={cx(btnCls('cancel'), 'rounded-[14px] bg-paper active:bg-mist')} onClick={() => (onDone(), cancel.onPress?.())}>
              {cancel.label}
            </button>
          )}
        </div>
      </div>
    )
  }
  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center px-10" role="alertdialog" aria-modal="true" aria-label={config.title}>
      <div className="anim-fade absolute inset-0 bg-ink/40" aria-hidden />
      <div className="anim-pop relative w-full max-w-[290px] overflow-hidden rounded-[18px] bg-paper/97 text-center backdrop-blur">
        <div className="px-5 pb-4 pt-5">
          <p className="text-[17px] font-semibold text-ink">{config.title}</p>
          {config.message && <p className="mt-1.5 text-[14px] leading-snug text-grey">{config.message}</p>}
        </div>
        <div className={cx('border-t border-mist', config.actions.length === 2 ? 'grid grid-cols-2 divide-x divide-mist' : 'divide-y divide-mist')}>
          {config.actions.map((a, i) => (
            <button key={a.label} ref={i === 0 ? first : undefined} type="button" className={cx(btnCls(a.style), 'active:bg-mist/60')} onClick={() => (onDone(), a.onPress?.())}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
