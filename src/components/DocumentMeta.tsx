import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

export function DocumentMeta() {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()

  useEffect(() => {
    let title = t('meta.title')
    let description = t('meta.description')
    if (pathname.startsWith('/book/success')) {
      title = t('confirmed.metaTitle')
      description = t('confirmed.metaDescription')
    } else if (pathname.startsWith('/gallery')) {
      title = t('gallery.metaTitle')
      description = t('gallery.metaDescription')
    } else if (pathname.startsWith('/book')) {
      title = t('booking.metaTitle')
      description = t('booking.metaDescription')
    } else if (pathname.startsWith('/admin')) {
      title = t('admin.metaTitle')
      description = t('admin.metaDescription')
    }
    document.title = title
    const el = document.querySelector('meta[name="description"]')
    if (el) el.setAttribute('content', description)
    document.documentElement.lang = i18n.language.startsWith('es') ? 'es' : 'en'
  }, [t, i18n.language, pathname])
  return null
}
