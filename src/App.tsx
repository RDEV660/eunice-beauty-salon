import { Navigate, Route, Routes } from 'react-router-dom'
import { DocumentMeta } from './components/DocumentMeta'
import { Header } from './components/Header'
import { AdminAvailabilityPage } from './pages/AdminAvailabilityPage'
import { BookPage } from './pages/BookPage'
import { BookSuccessPage } from './pages/BookSuccessPage'
import { GalleryPage } from './pages/GalleryPage'
import { HomePage } from './pages/HomePage'

function App() {
  return (
    <div className="relative min-h-svh overflow-x-hidden bg-[#050505] text-white">
      <DocumentMeta />

      <div className="relative z-10">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/book" element={<BookPage />} />
          <Route path="/book/success" element={<BookSuccessPage />} />
          <Route path="/admin/availability" element={<AdminAvailabilityPage />} />
          {/*
            /api is for fetch() to a backend, not a client route. A mistaken visit
            to /api still loads the SPA; send users home instead of "no routes matched".
          */}
          <Route path="/api" element={<Navigate to="/" replace />} />
          <Route path="/api/*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
