import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

export default function Layout() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  return (
    <>
      <Header minimal={isLoginPage} />
      <Outlet />
      <Footer />
    </>
  )
}