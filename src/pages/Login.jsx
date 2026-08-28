import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

export default function Login(){
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  function validate(){
    const next = {}
    if (!email.trim()) next.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email'

    if (!password) next.password = 'Password is required'
    else if (password.length < 6) next.password = 'Must be at least 6 characters'

    if (mode === 'signup' && confirmPassword !== password) {
      next.confirmPassword = 'Passwords do not match'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleLogin(e){
    e.preventDefault()
    setFormError('')
    if (!validate()) return

    setLoading(true)
    try {
      // TODO: backend integration — replace with your actual auth call, e.g.
      // const res = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // })
      // if (!res.ok) throw new Error('Invalid email or password')
      // const data = await res.json()

      await new Promise((resolve) => setTimeout(resolve, 800)) // placeholder delay
      navigate('/')
    } catch (err) {
      setFormError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin(){
    setFormError('')
    setGoogleLoading(true)
    try {
      // TODO: backend integration — hook up Google OAuth here, e.g.
      // window.location.href = '/api/auth/google'
      await new Promise((resolve) => setTimeout(resolve, 800)) // placeholder delay
    } catch (err) {
      setFormError('Google sign-in failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  function switchMode(next){
    setMode(next)
    setErrors({})
    setFormError('')
    setConfirmPassword('')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="eyebrow"><span className="diamond">◆</span>Account</div>
        <h1>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="auth-sub">
          {mode === 'signin'
            ? 'Sign in to continue your sign language journey.'
            : 'Sign up to start learning, translating, and interpreting.'}
        </p>

        {formError && <div className="auth-banner error">{formError}</div>}

        <form onSubmit={handleLogin} noValidate>
          <div className="field-group">
            <label className="field-label" htmlFor="email">Email</label>
            <div className="field-input-wrap">
              <input
                id="email"
                type="email"
                className={`field-input${errors.email ? ' has-error' : ''}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="password">Password</label>
            <div className="field-input-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`field-input${errors.password ? ' has-error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                style={{ paddingRight: 60 }}
              />
              <button
                type="button"
                className="field-toggle"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          {mode === 'signup' && (
            <div className="field-group">
              <label className="field-label" htmlFor="confirmPassword">Confirm password</label>
              <div className="field-input-wrap">
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  className={`field-input${errors.confirmPassword ? ' has-error' : ''}`}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
            </div>
          )}

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" /> {mode === 'signin' ? 'Signing in…' : 'Creating account…'}
              </>
            ) : (
              mode === 'signin' ? 'Sign in' : 'Sign up'
            )}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <button
          type="button"
          className="btn btn-ghost auth-google"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
        >
          {googleLoading ? (
  <>
    <span className="spinner" style={{ borderTopColor: 'var(--ink)' }} /> Connecting…
  </>
) : (
  'Continue with Google'
)}
        </button>

        <p className="auth-footer-note">
          {mode === 'signin' ? (
            <>Don't have an account? <button type="button" onClick={() => switchMode('signup')}>Sign up</button></>
          ) : (
            <>Already have an account? <button type="button" onClick={() => switchMode('signin')}>Sign in</button></>
          )}
        </p>
      </div>
    </div>
  )
}