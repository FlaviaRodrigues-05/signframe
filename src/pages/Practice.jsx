import { useState, useRef, useEffect, useMemo } from 'react'
import { DATA } from '../data/signData.js'
import { useLang } from '../context/LangContext.jsx'
import HandTrackingCamera from '../components/HandTrackingCamera.jsx'

export default function Practice() {

  const { lang } = useLang()

 
  const languageData = DATA[lang] || DATA.ASL

  const letters = languageData?.letters || []
  const rawWords = languageData?.words || []
  const sentences = languageData?.sentences || []

 
  const [wlaslWords, setWlaslWords] = useState([])

  

  const [selected, setSelected] = useState(0)
  const [started, setStarted] = useState(false)
  const [mode, setMode] = useState('alphabet')
  const [activeLesson, setActiveLesson] = useState('select')

  const [letterIndex, setLetterIndex] = useState(0)
  const [wordIndex, setWordIndex] = useState(0)
  const [currentWord, setCurrentWord] = useState(null)

  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [sentenceWordIndex, setSentenceWordIndex] = useState(0)
  const [sentencePlaying, setSentencePlaying] = useState(false)
  const [score, setScore] = useState(null)
  const [checking, setChecking] = useState(false)
  const [toast, setToast] = useState(null)

  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  const searchRef = useRef(null)
  const toggleRef = useRef(null)

  const BACKEND_URL = 'https://signframe.onrender.com'


  const words = useMemo(() => {

    const localMap = new Map()

   
    rawWords.forEach(item => {

      const key = item.word?.toLowerCase().trim()

      if (key && !localMap.has(key)) {

        localMap.set(key, {
          ...item,
          source: 'local'
        })

      }

    })

  
   
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

  // Some sentence words use a different label from the sign
  // that already exists in SignFrame's local data.
  // Example: "I" uses the existing "me" sign/video.
  const SENTENCE_WORD_ALIASES = {
    i: 'me'
  }

  // These words stay visible in the sentence, but they do not
  // get their own reference-video step.
  const SENTENCE_VIDEO_SKIP_WORDS = new Set([
    'to',
    'do',
    'are'
  ])

  const normalizeSentenceWord = value => {
    return String(value ?? '')
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:"'()[\]{}]/g, '')
  }

  const getSentenceVideoSource = word => {
    if (!word) {
      return null
    }

    // Local SignFrame video
    if (word.videoUrl) {
      return word.videoUrl
    }

    if (word.video) {
      return word.video
    }

    if (word.videoPath) {
      return word.videoPath
    }

    // WLASL video through Flask
    if (
      word.source === 'wlasl' &&
      word.folder &&
      word.file
    ) {
      return (
        `${BACKEND_URL}/wlasl/` +
        `${encodeURIComponent(word.folder)}/` +
        `${encodeURIComponent(word.file)}`
      )
    }

    return null
  }

  const playableSentences = useMemo(() => {
    if (!sentences.length) {
      return []
    }

    const wordMap = new Map()

    words.forEach(word => {
      const key = normalizeSentenceWord(word.word)

      if (key && !wordMap.has(key)) {
        wordMap.set(key, word)
      }
    })

    return sentences.map(sentence => {
      const sentenceWords = Array.isArray(sentence.words)
        ? sentence.words
        : String(sentence.text || '')
            .split(/\s+/)
            .filter(Boolean)

      // IMPORTANT:
      // resolvedWords contains EVERY word from the original sentence.
      // We never remove "to", "do", "are", punctuation, or any other
      // word from the sentence display.
      const resolvedWords = sentenceWords.map(word => {
        const displayWord = String(word)
        const key = normalizeSentenceWord(displayWord)

        const lookupKey =
          SENTENCE_WORD_ALIASES[key] || key

        const matchedWord = wordMap.get(lookupKey)

        const skipVideo =
          SENTENCE_VIDEO_SKIP_WORDS.has(key)

        const videoSrc = skipVideo
          ? null
          : getSentenceVideoSource(matchedWord)

        return {
          ...(matchedWord || {}),
          word: displayWord,
          resolvedFrom: matchedWord ? lookupKey : null,
          skipVideo,
          sentenceVideo: videoSrc,
          hasVideo: Boolean(videoSrc)
        }
      })

      // This is ONLY the playback sequence.
      // The original sentence words above are untouched.
      const videoWords = resolvedWords
        .filter(word => !word.skipVideo && word.hasVideo)
        .map((word, videoIndex) => ({
          ...word,
          videoIndex
        }))

      return {
        ...sentence,
        words: sentenceWords,
        resolvedWords,
        videoWords
      }
    })
  }, [sentences, words])

  const activeLetter = letters[letterIndex]
  const activeWord = currentWord || words[wordIndex]
  const activeSentence = playableSentences[sentenceIndex]

  // sentenceWordIndex refers to the PLAYABLE VIDEO sequence,
  // not the original sentence-word array.
  const activeSentenceWord =
    activeSentence?.videoWords?.[sentenceWordIndex] || null

  const sentenceVideoSrc =
    activeSentenceWord?.sentenceVideo || null



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


 const videoSrc = (() => {
  if (!activeWord) return null

  if (activeWord.source === 'local') {
    return (
      activeWord.videoUrl ||
      activeWord.video ||
      activeWord.videoPath ||
      null
    )
  }

 if (
    activeWord.source === 'wlasl' &&
    activeWord.folder &&
    activeWord.file
  ) {
    return (
      'https://huggingface.co/datasets/' +
      'chris0202/wlasl100-signframe/resolve/main/' +
      `${encodeURIComponent(activeWord.folder)}/` +
      `${encodeURIComponent(activeWord.file)}`
    )
  }

  
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
    setSentenceIndex(0)
    setSentenceWordIndex(0)
    setSentencePlaying(false)

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
    setSentenceIndex(0)
    setSentenceWordIndex(0)
    setSentencePlaying(false)

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

  function startSentence(sentenceIndexToStart = 0) {
  if (!playableSentences.length) {
    setToast({
      type: 'bad',
      text: 'No sentences are available yet.'
    })
    return
  }

  setSentenceIndex(sentenceIndexToStart)
  setSentenceWordIndex(0)
  setSentencePlaying(false)

  setStarted(true)
  setMode('sentence')
  setActiveLesson('sentences')

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
  
  async function checkSign() {
    if (checking) return

    setChecking(true)
    setScore(null)
    setToast(null)

    try {
      // CNN classifier is only used for ASL alphabet.
      if (mode !== 'alphabet') {
        setToast({
          type: 'bad',
          text: 'This sign-checking model supports alphabet signs only.'
        })
        return
      }

      // Normalize labels such as "Letter V" to "V".
      const expectedLabel = activeLetter?.label
        ?.replace(/^letter\s+/i, '')
        .trim()
        .toUpperCase()

      if (!expectedLabel) {
        throw new Error('Could not determine the expected letter.')
      }

      // Capture the current webcam frame.
      const frame = cameraRef.current?.captureFrame()


      if (frame) {
        console.log("Frame prefix:", frame.slice(0, 50))
        console.log("Frame length:", frame.length)
      
        const preview = new Image()
      
        preview.onload = () => {
          console.log("Frame dimensions:", {
            width: preview.naturalWidth,
            height: preview.naturalHeight
          })
        

        }
      
        preview.onerror = () => {
          console.error("Captured frame is not a valid image")
        }
      
        preview.src = frame
      }

      if (!frame) {
        setChecking(false)
            
        setToast({
          type: 'bad',
          text: 'No hand detected. Show your hand clearly and try again.'
        })
      
        return
      }

      const response = await fetch(
        `${BACKEND_URL}/predict-sign`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image: frame,
            expectedLabel
          })
        }
      )

      if (!response.ok) {
        throw new Error(
          `Prediction request failed: ${response.status}`
        )
      }

      const result = await response.json()

      if (
        typeof result.isCorrect !== 'boolean' ||
        typeof result.predicted !== 'string' ||
        typeof result.score !== 'number'
      ) {
        throw new Error('Invalid prediction response from backend.')
      }

      setScore(result.score)

      setToast({
        type: result.isCorrect ? 'good' : 'bad',
        text: result.isCorrect
          ? `Nice! That looked like "${result.predicted}".`
          : `That looked more like "${result.predicted}" — try again.`
      })

    } catch (error) {
      console.error('Sign check failed:', error)

      setToast({
        type: 'bad',
        text: 'Could not check your sign. Please try again.'
      })

    } finally {
      setChecking(false)
    }
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
    SENTENCE SELECTION
========================================== */}

{!started &&
  activeLesson === 'sentences' && (

    <section className="sentences-selection-page">

      <div className="lesson-heading">

        <div className="lesson-heading-copy">

          <button
            type="button"
            className="back-link sentence-back"
            onClick={backToLessons}
          >
            ← Back to lessons
          </button>

          <div className="eyebrow">
            <span className="diamond">◆</span>
            LESSON 3 · SENTENCES
          </div>

          <h1>Practice sentences</h1>

          <p>
            Choose a sentence and practise each sign
            step by step.
          </p>

        </div>

        <div className="sentence-count-badge">
          <strong>{playableSentences.length}</strong>
          <span>
            {playableSentences.length === 1
              ? 'sentence'
              : 'sentences'}
          </span>
        </div>

      </div>

      {playableSentences.length === 0 ? (

        <div className="intro-card bracket sentence-empty">
          <div className="eyebrow centered">SENTENCES</div>
          <h2>No sentences found</h2>
          <p>
            No sentence data is available for this language.
          </p>
        </div>

      ) : (

        <div className="sentence-grid">

          {playableSentences.map((sentence, index) => (

            <button
              key={`${sentence.text}-${index}`}
              type="button"
              className="sentence-card bracket"
              onClick={() => startSentence(index)}
            >

              <div className="sentence-card-top">

                <span className="sentence-number">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span className="sentence-label">
                  SENTENCE
                </span>

                <span className="sentence-card-arrow">
                  →
                </span>

              </div>

              <div className="sentence-card-content">

                <div className="sentence-card-icon">
                  💬
                </div>

                <div className="sentence-card-info">

                  <h2>{sentence.text}</h2>

                  <div className="sentence-mini-words">

                    {(sentence.resolvedWords || [])
                      .map((word, wordIndex) => (

                        <span
                          key={`${word.word}-${wordIndex}`}
                          className={
                            word.skipVideo
                              ? 'sentence-mini-word skipped-video-word'
                              : 'sentence-mini-word'
                          }
                        >
                          {word.word}
                        </span>

                      ))}

                  </div>

                  <p>
                    {(sentence.resolvedWords || []).length}
                    {' '}
                    {(sentence.resolvedWords || []).length === 1
                      ? 'word'
                      : 'words'}
                  </p>

                </div>

              </div>

            </button>

          ))}

        </div>

      )}

    </section>

)}
{started &&
  mode === 'sentence' &&
  activeSentence && (

    <section className="sentence-practice-page">

      {/* HEADER */}

      <div className="sentence-practice-header">

        <button
          className="back-button"
          onClick={() => {
            setStarted(false)
            setMode('sentence')
            setActiveLesson('sentences')
            setSentencePlaying(false)
          }}
        >
          ← Back to sentences
        </button>

        <div className="eyebrow">
          SENTENCE PRACTICE
        </div>

        <h1>
          {activeSentence.text}
        </h1>

        <p>
          Practice each sign in the sentence.
        </p>

      </div>


      {/* ALL SENTENCE WORDS */}

      <div className="sentence-word-list">

        {(activeSentence.resolvedWords || []).map(
          (word, originalIndex) => {

            const videoIndex =
              typeof word.videoIndex === 'number'
                ? word.videoIndex
                : -1

            const isPlayable =
              !word.skipVideo &&
              word.hasVideo &&
              videoIndex >= 0

            const isActive =
              isPlayable &&
              videoIndex === sentenceWordIndex

            return (
              <button
                key={`${word.word}-${originalIndex}`}
                type="button"
                className={`sentence-word ${
                  isActive ? 'active' : ''
                } ${
                  word.skipVideo
                    ? 'skipped-video-word'
                    : ''
                }`}
                disabled={!isPlayable}
                onClick={() => {
                  if (!isPlayable) {
                    return
                  }

                  setSentenceWordIndex(videoIndex)
                  setSentencePlaying(false)
                }}
              >
                {word.word}
              </button>
            )
          }
        )}

      </div>


      {/* REFERENCE VIDEO */}

      <div className="sentence-reference-card">

        <div className="reference-label">
          REFERENCE SIGN
        </div>

        <div className="sentence-video-container">

          {sentenceVideoSrc ? (

            <video
              key={sentenceVideoSrc}
              className="sentence-reference-video"
              src={sentenceVideoSrc}
              controls
              autoPlay
              muted
              playsInline
              preload="auto"
              onEnded={() => {

                const nextIndex =
                  sentenceWordIndex + 1

                if (
                  nextIndex <
                  (activeSentence.videoWords || []).length
                ) {
                  setSentenceWordIndex(nextIndex)
                } else {
                  setSentencePlaying(false)
                }

              }}
              onError={() => {

                console.error(
                  'Sentence reference video failed:',
                  sentenceVideoSrc
                )

                // Never show an "unavailable" video panel.
                // Move to the next actual playable sign.
                const nextIndex =
                  sentenceWordIndex + 1

                if (
                  nextIndex <
                  (activeSentence.videoWords || []).length
                ) {
                  setSentenceWordIndex(nextIndex)
                } else {
                  setSentencePlaying(false)
                }

              }}
            />

          ) : (

            <div className="sentence-video-empty">
              No playable sign video for this sentence.
            </div>

          )}

        </div>


        {/* CURRENT PLAYABLE WORD */}

        <div className="current-sentence-word">

          <span className="current-label">
            SIGN
          </span>

          <h2>
            {activeSentenceWord?.word || ''}
          </h2>

        </div>

      </div>


      {/* CONTROLS */}

      <div className="sentence-navigation">

        <button
          className="sentence-nav-button"
          disabled={sentenceWordIndex === 0}
          onClick={() => {
            setSentenceWordIndex(
              Math.max(
                0,
                sentenceWordIndex - 1
              )
            )
          }}
        >
          ← Previous
        </button>


        <span className="sentence-progress">

          {(activeSentence.videoWords || []).length
            ? sentenceWordIndex + 1
            : 0}

          {' / '}

          {(activeSentence.videoWords || []).length}

        </span>


        <button
          className="sentence-nav-button"
          disabled={
            sentenceWordIndex >=
            (activeSentence.videoWords || []).length - 1
          }
          onClick={() => {
            setSentenceWordIndex(
              Math.min(
                (activeSentence.videoWords || []).length - 1,
                sentenceWordIndex + 1
              )
            )
          }}
        >
          Next →

        </button>

      </div>

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