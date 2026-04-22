import { useTranslation } from 'react-i18next'

export function SiteFooter() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()
  return (
    <footer className="relative z-[1] border-t border-white/10 bg-[#050505] px-4 py-12 text-center">
      <p className="font-condensed text-xs uppercase tracking-[0.25em] text-white/45">
        {t('footer.category')}
      </p>
      <p className="mt-4 font-serif text-xs text-white/35">{t('footer.rights', { year })}</p>
    </footer>
  )
}
