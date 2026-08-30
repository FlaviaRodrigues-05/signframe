import { useState, useRef, useEffect } from 'react'
import CameraView from '../components/CameraView.jsx'
import { DATA } from '../data/signData.js'
import { useLang } from '../context/LangContext.jsx'

export default function Practice(){
  const { lang } = useLang()
  const [started, setStarted] = useState(false)
  const [mode, setMode] = useState('alphabet') // 'alphabet' | 'word'
  const [letterIndex, setLetterIndex] = useState(0)
  const [currentWord, setCurrentWord] = useState(null)
  const [score, setScore] = useState(null)
  const [checking, setChecking] = useState(false)
  const [toast, setToast] = useState(null) // {type, text}
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeLesson, setActiveLesson] = useState('select') // 'select' | 'words' | 'sentences'
  const searchRef = useRef(null)
  const toggleRef = useRef(null)

  const letters = DATA[lang].letters
  const words = DATA[lang].words

  // Reset practice state whenever the shared language changes
  useEffect(() => {
    setLetterIndex(0)
    setMode('alphabet')
    setCurrentWord(null)
    setScore(null)
    setToast(null)
    setQuery('')
    setActiveLesson('select')
  }, [lang])

  // Close the search panel on outside click
  useEffect(() => {
    function onClick(e){
      if(searchOpen && searchRef.current && !searchRef.current.contains(e.target) && e.target !== toggleRef.current){
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [searchOpen])

  function startLearning(){
    setStarted(true)
    setMode('alphabet')
    setLetterIndex(0)
    setScore(null)
    setToast(null)
  }

  function backToAlphabet(){
    setMode('alphabet')
    setCurrentWord(null)
    setScore(null)
    setToast(null)
  }

  function goPrev(){
    if(mode !== 'alphabet') return backToAlphabet()
    setLetterIndex(i => Math.max(0, i - 1))
    setScore(null); setToast(null)
  }

  function goNext(){
    if(mode !== 'alphabet') return backToAlphabet()
    setLetterIndex(i => Math.min(letters.length - 1, i + 1))
    setScore(null); setToast(null)
  }

  function practiceWord(w){
    setStarted(true)
    setMode('word')
    setCurrentWord(w)
    setScore(null)
    setToast(null)
    setSearchOpen(false)
  }

  function checkSign(){
    if(checking) return
    const s = Math.floor(58 + Math.random() * 42)
    setChecking(true)
    setScore(null)
    setTimeout(() => {
      setScore(s)
      setChecking(false)
      if(s >= 75){
        setToast({ type: 'good', text: "Nice! That's a solid match — moving on." })
        setTimeout(() => {
          if(mode === 'alphabet' && letterIndex < letters.length - 1){
            setLetterIndex(i => i + 1)
            setScore(null)
            setToast(null)
          } else if(mode === 'alphabet'){
            setToast({ type: 'good', text: "Lesson complete — you've been through the whole alphabet." })
          } else {
            setToast(null)
          }
        }, 1000)
      } else {
        setToast({ type: 'bad', text: 'Not quite — check the hand shape and try again.' })
      }
    }, 550)
  }

  const filtered = words.filter(w => w.word.toLowerCase().includes(query.trim().toLowerCase()))

  const activeLetter = letters[letterIndex]
  const displayGlyph = mode === 'word' ? currentWord.emoji : activeLetter.label
  const displayName = mode === 'word' ? currentWord.word : 'Letter ' + activeLetter.label
  const displayDesc = mode === 'word' ? currentWord.hint : activeLetter.desc

  return (
    <>
      <div className="toolbar">
        <div>
          <div className="eyebrow"><span className="diamond">◆</span>Practice · {lang}</div>
          <h1>Learn a sign at a time</h1>
          <p>We'll split the screen — your camera on the left, a manual for each letter or word on the right, in {lang === 'ASL' ? 'American Sign Language' : 'Indian Sign Language'}.</p>
        </div>
        <div className="search-wrap">
          <button className="icon-btn" ref={toggleRef} title="Search a word" onClick={() => setSearchOpen(o => !o)}>⌕</button>
          {searchOpen && (
            <div className="search-panel" ref={searchRef}>
              <input
                autoFocus
                type="text"
                placeholder={'Search a ' + lang + ' word, e.g. friend'}
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <div className="search-results">
                {filtered.length === 0 ? (
                  <div className="search-empty">No {lang} signs found for "{query}" yet.</div>
                ) : filtered.map(w => (
                  <div className="search-result" key={w.word}>
                    <div className="hand">{w.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div className="sr-word">{w.word}</div>
                      <div className="sr-hint">{w.hint}</div>
                    </div>
                    <button onClick={() => practiceWord(w)}>Practice</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {!started ? (
        activeLesson === 'select' ? (
          <div className="modes">
            {/* LESSON 1 · ALPHABET — untouched, original code, do not modify */}
            <div className="intro-card bracket">
              <span className="tl"></span><span className="tr"></span><span className="bl"></span><span className="br"></span>
                            <div className="eyebrow" style={{ justifyContent: 'center' }}><span className="diamond">◆</span>Lesson 1 · Alphabet</div>
              <h2>Ready to learn the {lang} alphabet?</h2>
              <p>Learn the {lang} alphabet one sign at a time with guided camera practice.</p>
              <button className="btn btn-primary" onClick={startLearning}>Start learning</button>
            </div>

            {/* LESSON 2 · WORDS */}
            <div className="intro-card bracket">
              <span className="tl"></span><span className="tr"></span><span className="bl"></span><span className="br"></span>
              <div className="eyebrow" style={{ justifyContent: 'center' }}><span className="diamond">◆</span>Lesson 2 · Words</div>
              <h2>Build your sign vocabulary</h2>
              <p>Practice common everyday words and build your {lang} vocabulary one sign at a time.</p>
              <button className="btn btn-primary" onClick={() => setActiveLesson('words')}>Start learning</button>
            </div>

            {/* LESSON 3 · SENTENCES */}
            <div className="intro-card bracket">
              <span className="tl"></span><span className="tr"></span><span className="bl"></span><span className="br"></span>
              <div className="eyebrow" style={{ justifyContent: 'center' }}><span className="diamond">◆</span>Lesson 3 · Sentences</div>
              <h2>Put signs together</h2>
              <p>Practice simple sentences and learn how individual signs come together in conversation.</p>
              <button className="btn btn-primary" onClick={() => setActiveLesson('sentences')}>Start learning</button>
            </div>
          </div>
        ) : activeLesson === 'words' ? (
          <div className="placeholder-page">
            <div className="eyebrow" style={{ justifyContent: 'center' }}><span className="diamond">◆</span>Lesson 2 · Words</div>
            <h1>Words lesson coming soon.</h1>
            <p>We're preparing the next set of {lang} vocabulary for you.</p>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: '20px' }} onClick={() => setActiveLesson('select')}>← Back to lessons</button>
          </div>
        ) : (
          <div className="placeholder-page">
            <div className="eyebrow" style={{ justifyContent: 'center' }}><span className="diamond">◆</span>Lesson 3 · Sentences</div>
            <h1>Sentence lessons coming soon.</h1>
            <p>We're preparing interactive sentence practice for you.</p>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: '20px' }} onClick={() => setActiveLesson('select')}>← Back to lessons</button>
          </div>
        )
      ) : (
        <div className="split-view">
          <div className="viewfinder bracket">
            
            <div className="vf-top">
              <div className="vf-rec"><span className="rec-dot"></span>{checking ? 'ANALYZING...' : 'TRACKING'}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-soft)' }}>CAM 01 · {lang}</div>
            </div>
            <div className="vf-frame">
              <div className="grid-lines"></div>
              <CameraView />
            </div>
            <div className="vf-caption">
              <span>Mirror the reference on the right</span>
              <button className="btn btn-primary btn-sm" onClick={checkSign} disabled={checking}>
                {checking ? 'Checking...' : 'Check my sign'}
              </button>
            </div>
            <div className="metric-mini">
              <div className="meter"><div className="meter-fill" style={{ width: (score ?? 0) + '%' }}></div></div>
              <span className="meter-val">{score !== null ? score + '%' : '—'}</span>
            </div>
            {toast && <div className={'toast ' + toast.type}>{toast.text}</div>}
          </div>

          <div className="manual-panel">
            {mode === 'word' && (
              <button className="back-link" onClick={backToAlphabet}>← Back to alphabet lesson</button>
            )}
            <span className="manual-mode-label">
              {mode === 'alphabet'
                ? 'Alphabet · Letter ' + (letterIndex + 1) + ' of ' + letters.length
                : 'Word practice'}
            </span>
            <div className="letter-display">
              <div className={'letter-glyph' + (mode === 'word' ? ' word-glyph' : '')}>
                {mode === 'alphabet' ? (
                  <img src={activeLetter.mediaUrl} alt={activeLetter.label} className="sign-media" />
                ) : (
                  displayGlyph
                )}
              </div>
              <div>
                <div className="letter-name">{displayName}</div>
                <div className="letter-lang-tag">{lang} · {mode === 'alphabet' ? 'fingerspelling' : 'vocabulary'}</div>
              </div>
            </div>
            <p className="letter-desc">{displayDesc}</p>
            {mode === 'alphabet' && (
              <div className="dots-row">
                {letters.map((l, i) => (
                  <div key={l.label} className={'dot-item' + (i < letterIndex ? ' done' : '') + (i === letterIndex ? ' current' : '')}>
                    {l.label}
                  </div>
                ))}
              </div>
            )}
            <div className="manual-actions">
              <button className="btn btn-ghost btn-sm" onClick={goPrev}>← Previous</button>
              <button className="btn btn-ghost btn-sm" onClick={goNext}>{mode === 'alphabet' ? 'Skip →' : 'Back to A–Z →'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}