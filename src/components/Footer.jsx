import { NavLink } from 'react-router-dom'

export default function Footer(){
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand-col">
          <NavLink to="/" className="logo" style={{ textDecoration: 'none', marginBottom: 12 }}>
            <span className="logo-mark">SF</span>SIGNFRAME
          </NavLink>
          <p className="footer-tagline">
            Camera-based sign language learning — practice, translate, and interpret in real time.
          </p>
        </div>

        <div className="footer-links-col">
          <p className="footer-heading">Product</p>
          <NavLink to="/practice">Practice</NavLink>
          <NavLink to="/translate">Translate</NavLink>
          <NavLink to="/live">Live interpreter</NavLink>
        </div>

        <div className="footer-links-col">
          <p className="footer-heading">Account</p>
          <NavLink to="/login">Sign up / Login</NavLink>
        </div>

        <div className="footer-links-col">
          <p className="footer-heading">About</p>
          <span style={{ color: 'var(--ink-soft)', fontSize: 13.5 }}>Built as a college final project.</span>
        </div>
      </div>

      <div className="footer-bottom">
                <div>© {new Date().getFullYear()} SIGNFRAME · Final Year Project</div>
        <div>A final-year project focused on accessible sign language learning through interactive technology.</div>
      </div>
    </footer>
  )
}


