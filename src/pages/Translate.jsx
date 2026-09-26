import { useState, useEffect, useMemo } from 'react'
import CameraView from '../components/CameraView.jsx'
import { useLang } from '../context/LangContext.jsx'

const API_BASE='http://127.0.0.1:5000'

const HAND_EMOJI = ['🤟', '👋', '✋', '🖐️', '👌', '🤙', '✊', '☝️']

function handFor(word, i){
  return HAND_EMOJI[(word.length + i) % HAND_EMOJI.length]
}

export default function Translate(){
  const { lang } = useLang()
  const [text, setText] = useState('thank you for helping me')
  const [words, setWords] = useState([])
  const [signIndex, setSignIndex] = useState(0)
  const [wlaslVideos, setWlaslVideos] = useState([])
  const [videoError, setVideoError] = useState('')

  // Re-run translation whenever the language changes, keeping the same sentence
  useEffect(() => {
    translate(text)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  //load all the words in the sentence from the dataset (get_wlasl_words() in app.py)
  useEffect(() => {
  async function loadWlaslWords() {
    try {
      const response = await fetch(
        `${API_BASE}/wlasl/words`
      )

      if (!response.ok) {
        throw new Error('Could not load sign videos')
      }

        const data = await response.json()
        setWlaslVideos(data)

      } catch (error) {
        console.error(error)
        setVideoError('Could not load sign videos.')
      }
    }
  
    loadWlaslWords()
  }, [])


  //find the video for the current word
  const currentWord = words[signIndex]

  //remove punctuations or some signs and keep only the word
  const normalizeWord = currentWord =>
  currentWord
    ?.toLowerCase()
    .replace(/[^\p{L}\p{N}']/gu, '')

  const currentVideo = wlaslVideos.find(
    item =>
      normalizeWord(item.word) ===
      normalizeWord(currentWord)
  )


  //construct the video url using the folder and file returned from /wlasl/words
  const videoUrl = currentVideo
  ? `${API_BASE}/wlasl/${encodeURIComponent(
      currentVideo.folder
    )}/${encodeURIComponent(currentVideo.file)}`
  : ''



  function translate(value){
    const t = (value ?? text).trim()
    const split = t ? t.split(/\s+/).filter(Boolean) : []
    setWords(split)
    setSignIndex(0)
  }

  function onKeyDown(e){
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault()
      translate()
    }
  }

  function markDone(){
    setSignIndex(i => Math.min(words.length, i + 1))
  }

  function restart(){
    setSignIndex(0)
  }

  const status = useMemo(() => {
    if(words.length === 0) return 'Type a sentence and translate it first.'
    if(signIndex >= words.length) return "Sentence complete — nice work! Restart to try again."
    return `Word ${signIndex + 1} of ${words.length} : "${words[signIndex]}"`
  }, [words, signIndex])

  return (
    <>
      <div className="section-head">
        <div className="eyebrow"><span className="diamond">◆</span>Translate · {lang}</div>
        <h2>Type it. Watch it sign. Sign it back.</h2>
        <p>Enter a sentence to see it broken into a {lang} sign sequence, then use the panel on the right to sign it back and check yourself against each word.</p>
      </div>

      <div className="translate-grid">
        <div className="translator">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a sentence..."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button className="btn btn-primary btn-sm" onClick={() => translate()}>Translate →</button>
          </div>
          <div className="sign-output">
            {words.map((w, i) => (
              <div className={'sign-card' + (i < signIndex ? ' done' : '') + (i === signIndex ? ' current' : '')} key={w + i}>
                <div className="hand">{handFor(w, i)}</div>
                <span className="word">{w.toLowerCase()}</span>
                {i < signIndex && <span className="tick">✓</span>}
              </div>
            ))}
          </div>
          <div className="reference-video">               //displays the video from the dataset
          <div className="reference-video-header">
            <span>REFERENCE SIGN</span>
            <span>{currentWord || 'No word selected'}</span>
          </div>

          {videoError ? (
            <p>{videoError}</p>
          ) : !currentWord ? (
            <p>Translate a sentence to begin.</p>
          ) : !currentVideo ? (
            <p>No sign video available for this word.</p>
          ) : (
            <video
              key={videoUrl}
              src={videoUrl}
              controls
              autoPlay
              playsInline
            />
          )}
          </div>
          <div className="vf-caption" style={{ marginTop: '18px' }}>
            <span>Showing output in {lang}</span>
            <span>{words.length} word{words.length === 1 ? '' : 's'}</span>
          </div>
        </div>

        <div className="signback-panel">
          <div className="vf-top">
            <div className="vf-rec"><span className="rec-dot"></span>SIGN IT BACK</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-soft)' }}>CAM 01 · {lang}</div>
          </div>
          <div className="vf-frame">
            <div className="grid-lines"></div>
            <CameraView />
          </div>
          <div className="signback-status">{status}</div>
          <p className="signback-hint">Sign the highlighted word on camera, then confirm to move to the next one.</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <button className="btn btn-primary btn-sm" onClick={markDone} disabled={words.length === 0 || signIndex >= words.length}>
              Mark this sign done ✓
            </button>
            <button className="btn btn-ghost btn-sm" onClick={restart}>Restart</button>
          </div>
        </div>
      </div>
    </>
  )
}
