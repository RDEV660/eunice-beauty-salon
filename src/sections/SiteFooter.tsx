import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export function SiteFooter() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()
  return (
    <footer className="relative z-[1] border-t border-white/10 bg-[#050505] px-4 py-12 text-center">
      <p className="font-condensed text-xs uppercase tracking-[0.25em] text-white/45">
        {t('footer.category')}
      </p>
      <p className="mt-4 font-serif text-xs text-white/35">{t('footer.rights', { year })}</p>
      <p className="mt-6">
        <Link
          to="/admin/availability"
          className="inline-block rounded border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium tracking-wide text-white/55 transition hover:border-gold-500/40 hover:bg-white/10 hover:text-gold-200/95"
        >
          {t('footer.staffLogin')}
        </Link>
      </p>
    </footer>
  )
}
