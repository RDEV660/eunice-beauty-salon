import { type TFunction } from 'i18next'
import { Fragment, useMemo } from 'react'
import {
  SERVICE_GROUP_ORDER,
  SERVICE_ID_TO_GROUP,
  type ServiceItemId,
} from '../lib/serviceItems'

type Props = {
  t: TFunction
  serviceIds: ServiceItemId[]
}

export function FullServiceMenu({ t, serviceIds }: Props) {
  const rows = useMemo(() => {
    const byGroup = new Map<string, ServiceItemId[]>()
    for (const id of serviceIds) {
      const g = SERVICE_ID_TO_GROUP[id]
      if (!byGroup.has(g)) byGroup.set(g, [])
      byGroup.get(g)!.push(id)
    }
    const out: { group: (typeof SERVICE_GROUP_ORDER)[number]; ids: ServiceItemId[] }[] = []
    for (const g of SERVICE_GROUP_ORDER) {
      const ids = byGroup.get(g)
      if (ids && ids.length) out.push({ group: g, ids })
    }
    return out
  }, [serviceIds])

  return (
    <div className="space-y-4">
      {rows.map(({ group, ids }) => (
        <Fragment key={group}>
          <h4 className="border-b border-gold-500/25 pb-1 font-condensed text-xs font-bold uppercase tracking-[0.15em] text-gold-300/95">
            {t(`booking.svcGroup.${group}` as 'booking.svcGroup.grp_cortes')}
          </h4>
          <ul className="space-y-1.5">
            {ids.map((id) => (
              <li
                key={id}
                className="flex justify-between gap-3 text-sm leading-snug text-white/90 sm:text-[0.95rem]"
              >
                <span className="min-w-0 break-words">{t(`booking.svcItem.${id}` as 'booking.svcItem.corte_mujer')}</span>
              </li>
            ))}
          </ul>
        </Fragment>
      ))}
    </div>
  )
}
