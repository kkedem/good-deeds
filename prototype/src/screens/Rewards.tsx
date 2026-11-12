import { Gift, Lock, Store as StoreIcon, Ticket, Hourglass } from 'lucide-react'
import { useStore } from '../store'
import { useNav } from '../nav'
import { fmtHours } from '../utils'
import { Button, Card, LargeTitle, StatusBadge } from '../components/ui'

export function RewardsScreen() {
  const s = useStore()
  const nav = useNav()
  const st = s.stats()
  return (
    <div className="pb-6">
      <LargeTitle sub="Spend points at independent Brighton & Hove businesses.">Rewards</LargeTitle>
      <div className="px-5">
        <div className="rounded-[28px] bg-signal p-5 shadow-soft">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-ink/80">Your points balance</p>
          <p className="mt-1 text-[48px] font-semibold leading-none tracking-[-0.03em] text-ink">{st.points}</p>
          <p className="mt-2 text-[15px] text-ink">
            10 points for every confirmed hour · {fmtHours(st.confirmedHours)} confirmed
          </p>
          {st.pendingPoints > 0 && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-paper/70 px-3 py-1.5 text-[14px] font-medium text-ink">
              <Hourglass className="size-4" aria-hidden /> {st.pendingPoints} points pending confirmation
            </p>
          )}
        </div>
      </div>
      <h2 className="px-5 pb-3 pt-7 text-[20px] font-semibold text-ink">Local offers</h2>
      <ul className="space-y-3 px-5">
        {s.offers
          .slice()
          .sort((a, b) => a.cost - b.cost)
          .map((of) => {
            const b = s.businesses.find((x) => x.id === of.businessId)!
            const short = of.cost - st.points
            const can = short <= 0
            return (
              <Card as="li" key={of.id} className="flex items-center gap-3 p-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-pale" aria-hidden>
                  <StoreIcon className="size-6 text-ink" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] font-semibold leading-snug text-ink">{of.title}</p>
                  <p className="text-[14px] text-util">
                    {b.name} · {b.area}
                  </p>
                  <p className="mt-1 text-[14px] font-semibold text-ink">{of.cost} points</p>
                </div>
                {can ? (
                  <Button
                    size="sm"
                    onClick={() =>
                      nav.requireAccount('Create an account to earn and spend points.') &&
                      nav.alert({
                        title: `Spend ${of.cost} points on a ${of.title} at ${b.name}?`,
                        message: `You’ll have ${st.points - of.cost} points left.`,
                        actions: [
                          { label: 'Cancel', style: 'cancel' },
                          {
                            label: 'Redeem',
                            style: 'bold',
                            onPress: () => {
                              const r = s.redeem(of.id)
                              if (r) nav.push({ name: 'voucher', id: r.id })
                            },
                          },
                        ],
                      })
                    }
                  >
                    Redeem
                  </Button>
                ) : (
                  <span className="flex max-w-[96px] flex-col items-end text-right text-[13px] font-medium leading-tight text-util">
                    <Lock className="mb-1 size-4" aria-hidden />
                    You need {short} more points
                  </span>
                )}
              </Card>
            )
          })}
      </ul>
      <p className="px-5 pt-4 text-[13px] text-util">All businesses and offers are fictional for this demo.</p>
    </div>
  )
}

export function VoucherScreen({ id }: { id: string }) {
  const s = useStore()
  const nav = useNav()
  const r = s.db.redemptions.find((x) => x.id === id)!
  const of = s.offers.find((x) => x.id === r.offerId)!
  const b = s.businesses.find((x) => x.id === of.businessId)!
  return (
    <div className="px-5 pb-8">
      <div className="anim-pop overflow-hidden rounded-[28px] bg-paper text-center shadow-soft">
        <div className="bg-signal px-5 pb-6 pt-7">
          <Gift className="mx-auto size-10 text-ink" aria-hidden />
          <p className="mt-3 text-[26px] font-semibold leading-tight text-ink">{of.title}</p>
          <p className="mt-1 text-[15px] text-ink">
            {b.name} · {b.area}
          </p>
        </div>
        <div className="border-t-2 border-dashed border-mist px-5 py-6">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-util">Voucher code</p>
          <p className="mt-2 font-mono text-[36px] font-bold tracking-[0.12em] text-ink">{r.code}</p>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[16px] font-semibold text-ink">
            <Ticket className="size-5" aria-hidden /> Show this at the till
          </p>
          <div className="mt-4">
            <StatusBadge kind="confirmed" label={`${r.points} points spent`} />
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-[14px] text-util">You can find this code any time in Profile → My vouchers.</p>
      <Button size="lg" full className="mt-6" onClick={nav.popToRoot}>
        Back to rewards
      </Button>
    </div>
  )
}
