import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Header({ minimal = false }) {
  const { isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout(){
    await logout()
    navigate('/')
  }

  return (
    <header>
      <NavLink to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
        <span className="logo-mark">SF</span>SIGNFRAME
      </NavLink>

      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
        <NavLink to="/practice" className={({ isActive }) => isActive ? 'active' : ''}>Practice</NavLink>
        <NavLink to="/translate" className={({ isActive }) => isActive ? 'active' : ''}>Translate</NavLink>
        <NavLink to="/live" className={({ isActive }) => isActive ? 'active' : ''}>Live interpreter</NavLink>
      </div>

      {!minimal && (
        <div className="nav-right">
          <div className="lang-toggle">
            <button className="active">ASL</button>
          </div>
          {isLoggedIn ? (
            <button className="btn btn-primary btn-sm" onClick={handleLogout}>Log out</button>
          ) : (
            <NavLink to="/login" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
              Sign up / Login
            </NavLink>
          )}
        </div>
      )}
    </header>
  )
}