import { useState, useRef, useEffect, useMemo } from 'react'
import { DATA } from '../data/signData.js'
import { useLang } from '../context/LangContext.jsx'
import HandTrackingCamera from '../components/HandTrackingCamera.jsx'

export default function Practice() {

  const { lang } = useLang()

  // Language data
  const languageData = DATA[lang] || DATA.ASL

  const letters = languageData?.letters || []
  const rawWords = languageData?.words || []
  const sentences = languageData?.sentences || []

  // WLASL words loaded from Flask
  const [wlaslWords, setWlaslWords] = useState([])

  /*
   * LOCAL WORDS COME FIRST.
   *
   * If a word exists locally, we use the local video.
   * WLASL is only used for words that do not already
   * exist in the local SignFrame data.
   */
  const words = useMemo(() => {

    const localMap = new Map()

    // Add ALL local words first
    rawWords.forEach(item => {

      const key = item.word?.toLowerCase().trim()

      if (key && !localMap.has(key)) {

        localMap.set(key, {
          ...item,
          source: 'local'
        })

      }

    })

    // Add WLASL only when local version doesn't exist
    wlaslWords.forEach(item => {

      const key = item.word?.toLowerCase().trim()

      if (key && !localMap.has(key)) {

        localMap.set(key, {
          ...item,
          source: 'wlasl'
        })

      }

    })

    return Array.from(localMap.values())

  }, [rawWords, wlaslWords])

  const playableSentences = useMemo(() => {

  if (!sentences.length || !words.length) {
    return []
  }

  const wordMap = new Map()

  words.forEach(word => {

    const key = word.word?.toLowerCase().trim()

    if (key && !wordMap.has(key)) {
      wordMap.set(key, word)
    }

  })

  return sentences
    .map(sentence => {

      const resolvedWords = (sentence.words || [])
        .map(word => {
          return wordMap.get(
            word.toLowerCase().trim()
          )
        })
        .filter(Boolean)

      return {
        ...sentence,
        resolvedWords
      }

    })
    .filter(sentence => {

      return (
        sentence.resolvedWords.length ===
        sentence.words.length
      )

    })

}, [sentences, words])


  const [selected, setSelected] = useState(0)
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
 
  /*
   * Flask backend.
   *
   * Local videos DO NOT use this.
   *
   * WLASL videos DO use this.
   */
  const BACKEND_URL = 'http://localhost:5001'


  /*
   * LOAD WLASL WORDS
   *
   * Flask gets the word list from Hugging Face.
   * The actual videos are NOT stored locally.
   */
  useEffect(() => {

    const loadWLASLWords = async () => {

      try {

        const response = await fetch(
          `${BACKEND_URL}/wlasl/words`
        )

        if (!response.ok) {
          throw new Error('Failed to load WLASL words')
        }

        const data = await response.json()

        const loadedWords = data.filter(
          item =>
            item.folder &&
            item.file &&
            item.folder.toLowerCase() !== 'all'
        )

        setWlaslWords(loadedWords)

        console.log(
          'WLASL words loaded:',
          loadedWords
        )

      } catch (error) {

        console.error(
          'WLASL loading error:',
          error
        )

      }

    }

    loadWLASLWords()

  }, [])


  /*
   * VIDEO URL
   *
   * LOCAL:
   * /sign-videos/example.mp4
   *
   * WLASL:
   * http://localhost:5001/wlasl/folder/file.mp4
   */
 const videoSrc = (() => {
  if (!activeWord) return null

  // ==========================================
  // LOCAL SIGNFRAME VIDEO
  // ==========================================
  if (activeWord.source === 'local') {
    return (
      activeWord.videoUrl ||
      activeWord.video ||
      activeWord.videoPath ||
      null
    )
  }

  // ==========================================
  // WLASL / HUGGING FACE VIDEO
  // ==========================================
  if (
    activeWord.source === 'wlasl' &&
    activeWord.folder &&
    activeWord.file
  ) {
    return (
      `https://huggingface.co/datasets/` +
      `chris0202/wlasl100-signframe/resolve/main/` +
      `${encodeURIComponent(activeWord.folder)}/` +
      `${encodeURIComponent(activeWord.file)}`
    )
  }

  // ==========================================
  // FALLBACK
  // ==========================================
  return (
    activeWord.videoUrl ||
    activeWord.video ||
    activeWord.videoPath ||
    null
  )
})()
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


  /*
   * CLOSE SEARCH WHEN CLICKING OUTSIDE
   */
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

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    )

    return () => {

      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      )

    }

  }, [searchOpen])


  /*
   * RESET PRACTICE STATE
   */
  function resetPracticeState() {

    setScore(null)
    setChecking(false)
    setToast(null)

  }


  /*
   * START ALPHABET
   */
  function startAlphabet() {

    setStarted(true)
    setMode('alphabet')
    setActiveLesson('alphabet')

    setLetterIndex(0)

    resetPracticeState()

  }


  /*
   * START WORDS
   */
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


  /*
   * BACK TO LESSONS
   */
  function backToLessons() {

    setStarted(false)
    setMode('alphabet')
    setActiveLesson('select')

    setCurrentWord(null)

    setLetterIndex(0)
    setWordIndex(0)

    resetPracticeState()

  }


  /*
   * PREVIOUS LETTER
   */
  function previousLetter() {

    if (letterIndex === 0) {
      return
    }

    setLetterIndex(
      index => Math.max(0, index - 1)
    )

    resetPracticeState()

  }


  /*
   * NEXT LETTER
   */
  function nextLetter() {

    if (!letters.length) {
      return
    }

    if (letterIndex >= letters.length - 1) {

      setToast({
        type: 'good',
        text: "You've completed the alphabet!"
      })

      return
    }

    setLetterIndex(
      index => index + 1
    )

    resetPracticeState()

  }


  /*
   * SELECT LETTER
   */
  function selectLetter(index) {

    setLetterIndex(index)

    resetPracticeState()

  }


  /*
   * PREVIOUS WORD
   */
  function previousWord() {

    if (wordIndex === 0) {
      return
    }

    const newIndex = wordIndex - 1

    setWordIndex(newIndex)
    setCurrentWord(words[newIndex])

    resetPracticeState()

  }


  /*
   * NEXT WORD
   */
  function nextWord() {

    if (!words.length) {
      return
    }

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


  /*
   * CHECK SIGN
   *
   * This is still the existing temporary scoring
   * logic from your Practice page.
   */
  function checkSign() {

    if (checking) {
      return
    }

    setChecking(true)
    setScore(null)
    setToast(null)

    setTimeout(() => {

      const scoreValue =
        Math.floor(
          70 + Math.random() * 30
        )

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


  /*
   * SEARCH WORD
   */
  function openSearchWord(word) {

    const index = words.findIndex(
      item =>
        item.word?.toLowerCase() ===
        word.word?.toLowerCase()
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


  /*
   * SEARCH FILTER
   */
  const filteredWords = words.filter(word =>
    word.word
      ?.toLowerCase()
      .includes(
        query.trim().toLowerCase()
      )
  )


  return (

    <div className="practice-page">

      {/* =========================================
          TOOLBAR
      ========================================== */}

      <div className="toolbar">

        <div className="practice-heading">

          <div className="eyebrow">

            <span className="diamond">
              ◆
            </span>

            Practice · {lang}

          </div>

          <h1>
            Learn a sign at a time
          </h1>

          <p>
            Watch the reference, practise it yourself,
            and improve your signing.
          </p>

        </div>


        <div className="search-wrap">

          <button
            ref={toggleRef}
            className="icon-btn"
            title="Search a word"
            onClick={() =>
              setSearchOpen(
                value => !value
              )
            }
          >
            ⌕
          </button>


          {searchOpen && (

            <div
              className="search-panel"
              ref={searchRef}
            >

              <input
                autoFocus
                type="text"
                placeholder={`Search a ${lang} word`}
                value={query}
                onChange={event =>
                  setQuery(event.target.value)
                }
              />


              <div className="search-results">

                {filteredWords.length === 0 ? (

                  <div className="search-empty">

                    No signs found for "{query}"

                  </div>

                ) : (

                  filteredWords.map(
                    (word, index) => (

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
                            {word.hint ||
                              'Practice this sign.'}
                          </div>

                        </div>


                        <button
                          onClick={() =>
                            openSearchWord(word)
                          }
                        >
                          Practice
                        </button>

                      </div>

                    )
                  )

                )}

              </div>

            </div>

          )}

        </div>

      </div>


      {/* =========================================
          LESSON SELECTION
      ========================================== */}

      {!started &&
        activeLesson === 'select' && (

          <div className="modes">

            {/* ALPHABET */}

            <div className="intro-card bracket">

              <div className="eyebrow centered">

                <span className="diamond">
                  ◆
                </span>

                Lesson 1 · Alphabet

              </div>


              <h2>
                Ready to learn the {lang} alphabet?
              </h2>


              <p>
                Learn the {lang} alphabet one sign
                at a time with guided camera practice.
              </p>


              <button
                className="btn btn-primary"
                onClick={startAlphabet}
              >
                Start learning
              </button>

            </div>


            {/* WORDS */}

            <div className="intro-card bracket">

              <div className="eyebrow centered">

                <span className="diamond">
                  ◆
                </span>

                Lesson 2 · Words

              </div>


              <h2>
                Build your sign vocabulary
              </h2>


              <p>
                Learn everyday signs using real WLASL
                signing videos and guided camera practice.
              </p>


              <button
                className="btn btn-primary"
                onClick={startWords}
              >
                Start learning
              </button>

            </div>


            {/* SENTENCES */}

            <div className="intro-card bracket">

              <div className="eyebrow centered">

                <span className="diamond">
                  ◆
                </span>

                Lesson 3 · Sentences

              </div>


              <h2>
                Put signs together
              </h2>


              <p>
                Practice complete sentences and build
                conversational signing skills.
              </p>


              <button
                className="btn btn-primary"
                onClick={() =>
                  setActiveLesson('sentences')
                }
              >
                Start learning
              </button>

            </div>

          </div>

        )}


      {/* =========================================
          SENTENCES
      ========================================== */}

     {!started && activeLesson === 'sentences' && (
  <section className="sentence-selection-page">

    <div className="lesson-heading">

      <div>
        <div className="eyebrow">
          <span className="diamond">◆</span>
          Lesson 3 · Sentences
        </div>

        <h1>Build complete sentences</h1>

        <p>
          Practice individual signs together and learn
          how they form a complete sentence.
        </p>
      </div>

    </div>


    <div className="sentence-selection-header">

      <div>
        <h2>Choose a sentence</h2>

        <p>
          Select a sentence to start practicing.
        </p>
      </div>

      <div className="sentence-count">
        {playableSentences.length} sentences
      </div>

    </div>


    <div className="sentence-grid">

      {playableSentences.map((sentence, index) => (

        <button
          key={`${sentence.text}-${index}`}
          className="sentence-card bracket"
          onClick={() => {

            setSentenceIndex(index)
            setSentenceWordIndex(0)
            setSentencePlaying(false)

            setStarted(true)
            setMode('sentence')
            setActiveLesson('sentences')

            resetPracticeState()
          }}
        >

          <div className="sentence-card-icon">
            💬
          </div>


          <div className="sentence-card-content">

            <h3>
              {sentence.text}
            </h3>

            <div className="sentence-card-meta">

              <span>
                {sentence.resolvedWords.length} signs
              </span>

              <span className="sentence-arrow">
                →
              </span>

            </div>

          </div>

        </button>

      ))}

    </div>


    {playableSentences.length === 0 && (

      <div className="empty-sentences bracket">

        <div className="empty-icon">
          💬
        </div>

        <h3>No sentences available yet</h3>

        <p>
          Add sentences using words that have
          reference videos in your SignFrame data.
        </p>

      </div>

    )}

  </section>
)}
      {/* =========================================
          ALPHABET PRACTICE
      ========================================== */}

      {started &&
        mode === 'alphabet' &&
        activeLetter && (

          <section className="alphabet-practice-section">

            <div className="lesson-heading">

              <div>

                <div className="eyebrow">

                  <span className="diamond">
                    ◆
                  </span>

                  Lesson 1 · Alphabet

                </div>


                <h1>
                  Learn the {lang} alphabet
                </h1>


                <p>
                  Follow the reference, then mirror
                  the sign with your hands.
                </p>

              </div>


              <div className="lesson-progress">

                Letter {letterIndex + 1}
                {' '}
                of
                {' '}
                {letters.length}

              </div>

            </div>


            <div className="split-view">

              {/* CAMERA */}

              <div className="viewfinder bracket">

                <div className="vf-top">

                  <div className="vf-rec">

                    <span className="rec-dot"></span>

                    {checking
                      ? 'ANALYZING...'
                      : 'TRACKING'}

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

                  <span>
                    Mirror the reference
                  </span>


                  <button
                    className="btn btn-primary btn-sm"
                    onClick={checkSign}
                    disabled={checking}
                  >

                    {checking
                      ? 'Checking...'
                      : 'Check my sign'}

                  </button>

                </div>


                {score !== null && (

                  <div className="metric-mini">

                    <div className="meter">

                      <div
                        className="meter-fill"
                        style={{
                          width: `${score}%`
                        }}
                      />

                    </div>


                    <span className="meter-val">
                      {score}%
                    </span>

                  </div>

                )}


                {toast && (

                  <div
                    className={`toast ${toast.type}`}
                  >
                    {toast.text}
                  </div>

                )}

              </div>


              {/* LETTER INFORMATION */}

              <div className="manual-panel bracket">

                <button
                  className="back-link"
                  onClick={backToLessons}
                >
                  ← Back to lessons
                </button>


                <div className="manual-mode-label">

                  ALPHABET · LETTER
                  {' '}
                  {letterIndex + 1}
                  {' '}
                  OF
                  {' '}
                  {letters.length}

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

                  {letters.map(
                    (letter, index) => (

                      <button
                        key={letter.label}
                        type="button"
                        className={
                          index === letterIndex
                            ? 'alphabet-letter active'
                            : 'alphabet-letter'
                        }
                        onClick={() =>
                          selectLetter(index)
                        }
                        aria-label={`Letter ${letter.label}`}
                      >

                        {letter.label}

                      </button>

                    )
                  )}

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

                    {letterIndex ===
                    letters.length - 1
                      ? 'Finish →'
                      : 'Next →'}

                  </button>

                </div>

              </div>

            </div>

          </section>

        )}


      {/* =========================================
          WORD PRACTICE
      ========================================== */}

      {started &&
        mode === 'word' &&
        activeWord && (

          <section className="word-practice-page">

            <div className="lesson-heading">

              <div>

                <div className="eyebrow">

                  <span className="diamond">
                    ◆
                  </span>

                  Lesson 2 · Words

                </div>


                <h1>
                  Build your sign vocabulary
                </h1>


                <p>
                  Watch the reference, then practise
                  the sign yourself.
                </p>

              </div>


              <div className="word-progress">

                Word {wordIndex + 1}
                {' '}
                of
                {' '}
                {words.length}

              </div>

            </div>


            <div className="word-learning-grid">

              {/* =====================================
                  CAMERA CARD
              ====================================== */}

              <div className="practice-camera-card bracket">

                <div className="camera-card-header">

                  <div>

                    <div className="eyebrow">

                      <span className="rec-dot"></span>

                      YOUR PRACTICE

                    </div>


                    <h2>
                      Try it yourself
                    </h2>

                  </div>


                  <div className="tracking-status">

                    {checking
                      ? 'ANALYZING'
                      : 'HAND TRACKING'}

                  </div>

                </div>


                <div className="practice-camera-frame">

                  <HandTrackingCamera />

                </div>


                <div className="camera-bottom-row">

                  <div className="camera-instruction">

                    <strong>
                      {activeWord.word}
                    </strong>

                    <span>
                      Try to match the reference movement.
                    </span>

                  </div>


                  <button
                    className="btn btn-primary check-button"
                    onClick={checkSign}
                    disabled={checking}
                  >

                    {checking
                      ? 'Checking...'
                      : 'Check my sign'}

                  </button>

                </div>


                {score !== null && (

                  <div className="score-area">

                    <div className="score-header">

                      <span>
                        Match score
                      </span>

                      <strong>
                        {score}%
                      </strong>

                    </div>


                    <div className="meter">

                      <div
                        className="meter-fill"
                        style={{
                          width: `${score}%`
                        }}
                      />

                    </div>

                  </div>

                )}


                {toast && (

                  <div
                    className={`toast ${toast.type}`}
                  >
                    {toast.text}
                  </div>

                )}

              </div>


              {/* =====================================
                  REFERENCE CARD
              ====================================== */}

              <div className="reference-card bracket">

                <div className="card-top">

                  <div className="eyebrow">

                    <span className="rec-dot"></span>

                    {activeWord.source === 'wlasl'
                      ? 'WLASL REFERENCE'
                      : 'SIGNFRAME REFERENCE'}

                  </div>


                  <span className="video-label">

                    {activeWord.source === 'wlasl'
                      ? 'HUGGING FACE'
                      : 'LOCAL'}

                  </span>

                </div>


                {/* =================================
                    VIDEO
                ================================== */}

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
                      onError={event => {

                        console.error(
                          'Reference video failed:',
                          videoSrc
                        )

                        console.error(
                          'Video error:',
                          event.currentTarget.error
                        )

                      }}
                      onLoadedMetadata={() => {

                        console.log(
                          'Reference video loaded:',
                          videoSrc
                        )

                      }}
                    />

                  ) : (

                    <div className="video-unavailable">

                      Reference video unavailable.

                    </div>

                  )}

                </div>


                {/* =================================
                    WORD INFORMATION
                ================================== */}

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

                      {activeWord.emoji ||
                        '🤟'}

                    </div>


                    <div>

                      <h2>
                        {activeWord.word}
                      </h2>


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

                    <span>
                      TIP
                    </span>

                    Mirror the reference movement
                    with your hands.

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
                      disabled={
                        wordIndex ===
                        words.length - 1
                      }
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