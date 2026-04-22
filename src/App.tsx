import { Route, Routes } from 'react-router-dom'
import { DocumentMeta } from './components/DocumentMeta'
import { Header } from './components/Header'
import { BookPage } from './pages/BookPage'
import { BookSuccessPage } from './pages/BookSuccessPage'
import { HomePage } from './pages/HomePage'

function App() {
  return (
    <div className="relative min-h-svh overflow-x-hidden bg-[#050505] text-white">
      <DocumentMeta />

      <div className="relative z-10">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/book" element={<BookPage />} />
          <Route path="/book/success" element={<BookSuccessPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
