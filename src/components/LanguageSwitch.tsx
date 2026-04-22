import { useTranslation } from 'react-i18next'

export function LanguageSwitch() {
  const { i18n } = useTranslation()
  const current = i18n.resolvedLanguage?.startsWith('es') ? 'es' : 'en'

  return (
    <div
      className="flex rounded-md border border-gold-400/30 bg-black/60 p-0.5 font-condensed text-xs font-bold uppercase tracking-wider"
      role="group"
      aria-label={i18n.t('nav.lang')}
    >
      <button
        type="button"
        className={`rounded px-2 py-1 transition ${current === 'en' ? 'bg-gold-400/25 text-gold-200' : 'text-white/60 hover:text-white'}`}
        onClick={() => void i18n.changeLanguage('en')}
      >
        EN
      </button>
      <button
        type="button"
        className={`rounded px-2 py-1 transition ${current === 'es' ? 'bg-gold-400/25 text-gold-200' : 'text-white/60 hover:text-white'}`}
        onClick={() => void i18n.changeLanguage('es')}
      >
        ES
      </button>
    </div>
  )
}
