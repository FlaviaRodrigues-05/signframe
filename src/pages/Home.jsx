import { NavLink } from 'react-router-dom'
import HandSkeleton from '../components/HandSkeleton.jsx'
import { useLang } from '../context/LangContext.jsx'

export default function Home(){
  const { lang } = useLang()

  return (
    <>
      <div className="hero">
        <div className="hero-grid">
          <div>
            <div className="eyebrow"><span className="diamond">◆</span>Camera-based sign learning</div>
            <h1>Frame every<br /><em>sign</em> you make.</h1>
            <p className="sub">Learn signs letter by letter with live camera feedback, translate whole sentences into sign, or drop into a two-way live interpreter between a signer and a hearing person.</p>
            <div className="hero-actions">
              <NavLink to="/practice" className="btn btn-primary">Start learning</NavLink>
              <NavLink to="/live" className="btn btn-ghost">Try live interpreter →</NavLink>
            </div>
          </div>
          <div className="viewfinder">
            <div className="vf-top">
              <div className="vf-rec"><span className="rec-dot"></span>TRACKING</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-soft)' }}>CAM 01 · {lang}</div>
            </div>
            <div className="vf-frame">
              <div className="grid-lines"></div>
              <HandSkeleton />
            </div>
            <div className="vf-caption">
              <span>SIGN: "THANK YOU"</span>
              <span className="pill-tag">MATCH 91%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="section-head">
        <h2>Three ways to work with a sign</h2>
        <p>Each mode shares the same camera-tracking engine — only what it does with the tracked points changes.</p>
      </div>
      <div className="modes">
        <NavLink to="/practice" className="mode-card">
          <div className="mode-icon">◇</div>
          <div className="eyebrow"><span className="diamond">◆</span>Practice</div>
          <h3>Learn, split-screen</h3>
          <p>Your camera on one side, a step-by-step manual on the other. Sign correctly and it moves you to the next letter or word.</p>
        </NavLink>
        <NavLink to="/translate" className="mode-card">
          <div className="mode-icon">→</div>
          <div className="eyebrow"><span className="diamond">◆</span>Translate</div>
          <h3>Sentence to sign</h3>
          <p>Type any sentence, see it broken into a sign sequence, then sign it back on camera to check your recall.</p>
        </NavLink>
        <NavLink to="/live" className="mode-card">
          <div className="mode-icon">⇄</div>
          <div className="eyebrow"><span className="diamond">◆</span>Live interpreter</div>
          <h3>Two-way conversation</h3>
          <p>One person signs, the other types or speaks — each side sees the other's message translated in real time.</p>
        </NavLink>
      </div>
    </>
  )
}
