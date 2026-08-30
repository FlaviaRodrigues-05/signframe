import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

export default function Layout() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  useEffect(() => {
    document.body.classList.toggle('login-page', isLoginPage)
    return () => document.body.classList.remove('login-page')
  }, [isLoginPage])

  return (
    <div className="app-shell">
      {!isLoginPage && <Header />}
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
    