/**
 * All bookable / displayable service lines. Labels + prices come from i18n `booking.svcItem.*`.
 * Used by the deposit form <select> and the Services section menu.
 */
export const SERVICE_ITEM_IDS = [
  // CORTES
  'corte_mujer',
  'corte_hombre',
  'corte_nino',
  // COLOR
  'color_corto',
  'color_med',
  'color_largo',
  'color_premium_corto',
  'color_premium_med',
  'color_premium_largo',
  'color_retoque_corto',
  'color_retoque_med',
  'color_retoque_largo',
  // BALAYAGE
  'balayage_corto',
  'balayage_med',
  'balayage_largo',
  'balayage_prem_corto',
  'balayage_prem_med',
  'balayage_prem_largo',
  // MECHAS
  'mechas_corto',
  'mechas_med',
  'mechas_largo',
  // TRATAMIENTOS
  'trat_wellness',
  'nano_corto',
  'nano_med',
  'nano_largo',
  // BELLEZA
  'maq_sencillo',
  'maq_pro',
  'maq_quince',
  'pei_sencillo',
  'pei_semi',
  'pei_recogido',
  'wax_bigote',
  'wax_cara',
  'paquetes',
  'otro',
] as const

export type ServiceItemId = (typeof SERVICE_ITEM_IDS)[number]

export const DEFAULT_SERVICE_ID: ServiceItemId = 'corte_mujer'

export const SERVICE_GROUP_ORDER = [
  'grp_cortes',
  'grp_color',
  'grp_balayage',
  'grp_mechas',
  'grp_trat',
  'grp_maq',
  'grp_pei',
  'grp_wax',
  'grp_extra',
] as const

export const SERVICE_ID_TO_GROUP: Record<ServiceItemId, (typeof SERVICE_GROUP_ORDER)[number]> = {
  corte_mujer: 'grp_cortes',
  corte_hombre: 'grp_cortes',
  corte_nino: 'grp_cortes',
  color_corto: 'grp_color',
  color_med: 'grp_color',
  color_largo: 'grp_color',
  color_premium_corto: 'grp_color',
  color_premium_med: 'grp_color',
  color_premium_largo: 'grp_color',
  color_retoque_corto: 'grp_color',
  color_retoque_med: 'grp_color',
  color_retoque_largo: 'grp_color',
  balayage_corto: 'grp_balayage',
  balayage_med: 'grp_balayage',
  balayage_largo: 'grp_balayage',
  balayage_prem_corto: 'grp_balayage',
  balayage_prem_med: 'grp_balayage',
  balayage_prem_largo: 'grp_balayage',
  mechas_corto: 'grp_mechas',
  mechas_med: 'grp_mechas',
  mechas_largo: 'grp_mechas',
  trat_wellness: 'grp_trat',
  nano_corto: 'grp_trat',
  nano_med: 'grp_trat',
  nano_largo: 'grp_trat',
  maq_sencillo: 'grp_maq',
  maq_pro: 'grp_maq',
  maq_quince: 'grp_maq',
  pei_sencillo: 'grp_pei',
  pei_semi: 'grp_pei',
  pei_recogido: 'grp_pei',
  wax_bigote: 'grp_wax',
  wax_cara: 'grp_wax',
  paquetes: 'grp_extra',
  otro: 'grp_extra',
}

/** Which catalog entries appear under the “hair / cabello” column on the services page. */
export const SERVICES_PAGE_HAIR_IDS: ServiceItemId[] = [
  'corte_mujer',
  'corte_hombre',
  'corte_nino',
  'color_corto',
  'color_med',
  'color_largo',
  'color_premium_corto',
  'color_premium_med',
  'color_premium_largo',
  'color_retoque_corto',
  'color_retoque_med',
  'color_retoque_largo',
  'balayage_corto',
  'balayage_med',
  'balayage_largo',
  'balayage_prem_corto',
  'balayage_prem_med',
  'balayage_prem_largo',
  'mechas_corto',
  'mechas_med',
  'mechas_largo',
  'trat_wellness',
  'nano_corto',
  'nano_med',
  'nano_largo',
]

export const SERVICES_PAGE_BEAUTY_IDS: ServiceItemId[] = [
  'maq_sencillo',
  'maq_pro',
  'maq_quince',
  'pei_sencillo',
  'pei_semi',
  'pei_recogido',
  'wax_bigote',
  'wax_cara',
  'paquetes',
  'otro',
]

/** Optgroup order for the booking <select> (all bookable lines). */
export function getServiceSelectGroups(): {
  group: (typeof SERVICE_GROUP_ORDER)[number]
  ids: ServiceItemId[]
}[] {
  const byGroup = new Map<string, ServiceItemId[]>()
  for (const id of SERVICE_ITEM_IDS) {
    const g = SERVICE_ID_TO_GROUP[id]
    if (!byGroup.has(g)) byGroup.set(g, [])
    byGroup.get(g)!.push(id)
  }
  const out: { group: (typeof SERVICE_GROUP_ORDER)[number]; ids: ServiceItemId[] }[] = []
  for (const g of SERVICE_GROUP_ORDER) {
    const ids = byGroup.get(g)
    if (ids?.length) out.push({ group: g, ids })
  }
  return out
}
