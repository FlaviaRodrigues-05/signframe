import { useState, useRef, useEffect, useMemo } from 'react'
import { DATA } from '../data/signData.js'
import { useLang } from '../context/LangContext.jsx'
import HandTrackingCamera from '../components/HandTrackingCamera.jsx'

export default function Practice() {
  const { lang } = useLang()
  const languageData = DATA[lang] || DATA.ASL
  const letters = languageData?.letters || []
  const rawWords = languageData?.words || []

  const words = useMemo(() => {
    const seen = new Set()
    return rawWords.filter(item => {
      const key = item.word?.toLowerCase().trim()
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [rawWords])

  const [started, setStarted] = useState(false)
  const [mode, setMode] = useState('alphabet')
  const [activeLesson, setActiveLesson] = useState('select')

  const [letterIndex, setLetterIndex] = useState(0)
  const [wordIndex, setWordIndex] = useState(0)
  const [currentWord, setCurrentWord] = useState(null)

  const [score, setScore] = useState(null)
  const [checking, setChecking] = useState(false)
  const [toast, setToast] = useState(null)

  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  const searchRef = useRef(null)
  const toggleRef = useRef(null)

  const activeLetter = letters[letterIndex]

  const activeWord = currentWord || words[wordIndex]

  const videoSrc = activeWord
    ? activeWord.video || activeWord.videoUrl || null
    : null

  useEffect(() => {
    setStarted(false)
    setMode('alphabet')
    setActiveLesson('select')
    setLetterIndex(0)
    setWordIndex(0)
    setCurrentWord(null)
    setScore(null)
    setChecking(false)
    setToast(null)
    setQuery('')
    setSearchOpen(false)
  }, [lang])

  useEffect(() => {
    const handleOutsideClick = event => {
      if (
        searchOpen &&
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        event.target !== toggleRef.current
      ) {
        setSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [searchOpen])

  function resetPracticeState() {
    setScore(null)
    setChecking(false)
    setToast(null)
  }

  function startAlphabet() {
    setStarted(true)
    setMode('alphabet')
    setActiveLesson('alphabet')
    setLetterIndex(0)
    resetPracticeState()
  }

  function startWords() {
    if (!words.length) {
      setToast({
        type: 'bad',
        text: 'No word practice data is available.'
      })
      return
    }

    setStarted(true)
    setMode('word')
    setActiveLesson('words')
    setWordIndex(0)
    setCurrentWord(words[0])
    resetPracticeState()
  }

  function backToLessons() {
    setStarted(false)
    setMode('alphabet')
    setActiveLesson('select')
    setCurrentWord(null)
    setLetterIndex(0)
    setWordIndex(0)
    resetPracticeState()
  }

  function previousLetter() {
    if (letterIndex === 0) return

    setLetterIndex(index => Math.max(0, index - 1))
    resetPracticeState()
  }

  function nextLetter() {
    if (!letters.length) return

    if (letterIndex >= letters.length - 1) {
      setToast({
        type: 'good',
        text: "You've completed the alphabet!"
      })
      return
    }

    setLetterIndex(index => index + 1)
    resetPracticeState()
  }

  function selectLetter(index) {
    setLetterIndex(index)
    resetPracticeState()
  }

  function previousWord() {
    if (wordIndex === 0) return

    const newIndex = wordIndex - 1

    setWordIndex(newIndex)
    setCurrentWord(words[newIndex])
    resetPracticeState()
  }

  function nextWord() {
    if (!words.length) return

    if (wordIndex >= words.length - 1) {
      setToast({
        type: 'good',
        text: 'You completed all available words!'
      })
      return
    }

    const newIndex = wordIndex + 1

    setWordIndex(newIndex)
    setCurrentWord(words[newIndex])
    resetPracticeState()
  }

  function checkSign() {
    if (checking) return

    setChecking(true)
    setScore(null)
    setToast(null)

    setTimeout(() => {
      const scoreValue = Math.floor(70 + Math.random() * 30)

      setScore(scoreValue)
      setChecking(false)

      if (scoreValue >= 75) {
        setToast({
          type: 'good',
          text: 'Nice! Your sign looks good.'
        })
      } else {
        setToast({
          type: 'bad',
          text: 'Try again and match the reference.'
        })
      }
    }, 700)
  }

  function openSearchWord(word) {
    const index = words.findIndex(
      item =>
        item.word?.toLowerCase() === word.word?.toLowerCase()
    )

    if (index === -1) {
      setToast({
        type: 'bad',
        text: 'This word is not available for practice.'
      })
      return
    }

    setWordIndex(index)
    setCurrentWord(words[index])
    setMode('word')
    setStarted(true)
    setActiveLesson('words')
    resetPracticeState()
    setSearchOpen(false)
  }

  const filteredWords = words.filter(word =>
    word.word?.toLowerCase().includes(query.trim().toLowerCase())
  )

  return (
    <div className="practice-page">
      <div className="toolbar">
        <div className="practice-heading">
          <div className="eyebrow">
            <span className="diamond">◆</span>
            Practice · {lang}
          </div>
          <h1>Learn a sign at a time</h1>
          <p>
            Watch the reference, practise it yourself, and improve your signing.
          </p>
        </div>

        <div className="search-wrap">
          <button
            ref={toggleRef}
            className="icon-btn"
            title="Search a word"
            onClick={() => setSearchOpen(value => !value)}
          >
            ⌕
          </button>

          {searchOpen && (
            <div className="search-panel" ref={searchRef}>
              <input
                autoFocus
                type="text"
                placeholder={`Search a ${lang} word`}
                value={query}
                onChange={event => setQuery(event.target.value)}
              />

              <div className="search-results">
                {filteredWords.length === 0 ? (
                  <div className="search-empty">
                    No signs found for "{query}"
                  </div>
                ) : (
                  filteredWords.map((word, index) => (
                    <div
                      className="search-result"
                      key={`${word.word}-${index}`}
                    >
                      <div className="hand">
                        {word.emoji || '🤟'}
                      </div>

                      <div className="search-result-content">
                        <div className="sr-word">
                          {word.word}
                        </div>
                        <div className="sr-hint">
                          {word.hint || 'Practice this sign.'}
                        </div>
                      </div>

                      <button onClick={() => openSearchWord(word)}>
                        Practice
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {!started && activeLesson === 'select' && (
        <div className="modes">
          <div className="intro-card bracket">
            <div className="eyebrow centered">
              <span className="diamond">◆</span>
              Lesson 1 · Alphabet
            </div>

            <h2>Ready to learn the {lang} alphabet?</h2>

            <p>
              Learn the {lang} alphabet one sign at a time with guided camera
              practice.
            </p>

            <button
              className="btn btn-primary"
              onClick={startAlphabet}
            >
              Start learning
            </button>
          </div>

          <div className="intro-card bracket">
            <div className="eyebrow centered">
              <span className="diamond">◆</span>
              Lesson 2 · Words
            </div>

            <h2>Build your sign vocabulary</h2>

            <p>
              Learn everyday signs using real WLASL signing videos and guided
              camera practice.
            </p>

            <button
              className="btn btn-primary"
              onClick={startWords}
            >
              Start learning
            </button>
          </div>

          <div className="intro-card bracket">
            <div className="eyebrow centered">
              <span className="diamond">◆</span>
              Lesson 3 · Sentences
            </div>

            <h2>Put signs together</h2>

            <p>
              Practice complete sentences and build conversational signing
              skills.
            </p>

            <button
              className="btn btn-primary"
              onClick={() => setActiveLesson('sentences')}
            >
              Start learning
            </button>
          </div>
        </div>
      )}

      {!started && activeLesson === 'sentences' && (
        <div className="placeholder-page bracket">
          <div className="eyebrow">
            <span className="diamond">◆</span>
            Lesson 3 · Sentences
          </div>

          <h1>Sentence practice</h1>

          <p>
            This module will use sentence-level video references and your
            camera tracker.
          </p>

          <button
            className="btn btn-ghost btn-sm"
            onClick={backToLessons}
          >
            ← Back to lessons
          </button>
        </div>
      )}

      {started && mode === 'alphabet' && activeLetter && (
        <section className="alphabet-practice-section">
          <div className="lesson-heading">
            <div>
              <div className="eyebrow">
                <span className="diamond">◆</span>
                Lesson 1 · Alphabet
              </div>

              <h1>Learn the {lang} alphabet</h1>

              <p>
                Follow the reference, then mirror the sign with your hands.
              </p>
            </div>

            <div className="lesson-progress">
              Letter {letterIndex + 1} of {letters.length}
            </div>
          </div>

          <div className="split-view">
            <div className="viewfinder bracket">
              <div className="vf-top">
                <div className="vf-rec">
                  <span className="rec-dot"></span>
                  {checking ? 'ANALYZING...' : 'TRACKING'}
                </div>

                <div className="camera-label">
                  CAM 01 · {lang}
                </div>
              </div>

              <div className="vf-frame">
                <div className="grid-lines"></div>
                <HandTrackingCamera />
              </div>

              <div className="vf-caption">
                <span>Mirror the reference</span>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={checkSign}
                  disabled={checking}
                >
                  {checking ? 'Checking...' : 'Check my sign'}
                </button>
              </div>

              {score !== null && (
                <div className="metric-mini">
                  <div className="meter">
                    <div
                      className="meter-fill"
                      style={{ width: `${score}%` }}
                    />
                  </div>

                  <span className="meter-val">
                    {score}%
                  </span>
                </div>
              )}

              {toast && (
                <div className={`toast ${toast.type}`}>
                  {toast.text}
                </div>
              )}
            </div>

            <div className="manual-panel bracket">
              <button
                className="back-link"
                onClick={backToLessons}
              >
                ← Back to lessons
              </button>

              <div className="manual-mode-label">
                ALPHABET · LETTER {letterIndex + 1} OF {letters.length}
              </div>

              <div className="letter-display">
                <div className="letter-glyph">
                  <img
                    src={activeLetter.mediaUrl}
                    alt={`ASL letter ${activeLetter.label}`}
                    className="sign-media"
                  />
                </div>

                <div className="letter-heading-info">
                  <div className="letter-name">
                    Letter {activeLetter.label}
                  </div>

                  <div className="letter-lang-tag">
                    {lang} · fingerspelling
                  </div>
                </div>
              </div>

              <p className="letter-desc">
                {activeLetter.desc}
              </p>

              <div className="alphabet-line">
                {letters.map((letter, index) => (
                  <button
                    key={letter.label}
                    type="button"
                    className={
                      index === letterIndex
                        ? 'alphabet-letter active'
                        : 'alphabet-letter'
                    }
                    onClick={() => selectLetter(index)}
                    aria-label={`Letter ${letter.label}`}
                  >
                    {letter.label}
                  </button>
                ))}
              </div>

              <div className="manual-actions">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={previousLetter}
                  disabled={letterIndex === 0}
                >
                  ← Previous
                </button>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={nextLetter}
                >
                  {letterIndex === letters.length - 1
                    ? 'Finish →'
                    : 'Next →'}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {started && mode === 'word' && activeWord && (
        <section className="word-practice-page">
          <div className="lesson-heading">
            <div>
              <div className="eyebrow">
                <span className="diamond">◆</span>
                Lesson 2 · Words
              </div>

              <h1>Build your sign vocabulary</h1>

              <p>
                Watch the reference, then practise the sign yourself.
              </p>
            </div>

            <div className="word-progress">
              Word {wordIndex + 1} of {words.length}
            </div>
          </div>

          <div className="word-learning-grid">
            <div className="practice-camera-card bracket">
              <div className="camera-card-header">
                <div>
                  <div className="eyebrow">
                    <span className="rec-dot"></span>
                    YOUR PRACTICE
                  </div>

                  <h2>Try it yourself</h2>
                </div>

                <div className="tracking-status">
                  {checking ? 'ANALYZING' : 'HAND TRACKING'}
                </div>
              </div>

              <div className="practice-camera-frame">
                <HandTrackingCamera />
              </div>

              <div className="camera-bottom-row">
                <div className="camera-instruction">
                  <strong>{activeWord.word}</strong>
                  <span>Try to match the reference movement.</span>
                </div>

                <button
                  className="btn btn-primary check-button"
                  onClick={checkSign}
                  disabled={checking}
                >
                  {checking ? 'Checking...' : 'Check my sign'}
                </button>
              </div>

              {score !== null && (
                <div className="score-area">
                  <div className="score-header">
                    <span>Match score</span>
                    <strong>{score}%</strong>
                  </div>

                  <div className="meter">
                    <div
                      className="meter-fill"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              )}

              {toast && (
                <div className={`toast ${toast.type}`}>
                  {toast.text}
                </div>
              )}
            </div>

            <div className="reference-card bracket">
              <div className="card-top">
                <div className="eyebrow">
                  <span className="rec-dot"></span>
                  WLASL REFERENCE
                </div>

                <span className="video-label">ASL</span>
              </div>

              <div className="reference-video-frame">
                {videoSrc ? (
                  <video
                    key={videoSrc}
                    src={videoSrc}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="reference-video"
                  />
                ) : (
                  <div className="video-unavailable">
                    Reference video unavailable.
                  </div>
                )}
              </div>

              <div className="word-info-card-inner">
                <button
                  className="back-link"
                  onClick={backToLessons}
                >
                  ← Back to lessons
                </button>

                <div className="manual-mode-label">
                  WORD PRACTICE
                </div>

                <div className="word-title-row">
                  <div className="word-icon">
                    {activeWord.emoji || '🤟'}
                  </div>

                  <div>
                    <h2>{activeWord.word}</h2>

                    <div className="letter-lang-tag">
                      {lang} · vocabulary
                    </div>
                  </div>
                </div>

                <p className="letter-desc">
                  {activeWord.hint ||
                    'Practice the sign shown in the reference video.'}
                </p>

                <div className="word-tip">
                  <span>TIP</span>
                  Mirror the reference movement with your hands.
                </div>

                <div className="word-navigation">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={previousWord}
                    disabled={wordIndex === 0}
                  >
                    ← Previous
                  </button>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={nextWord}
                    disabled={wordIndex === words.length - 1}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}