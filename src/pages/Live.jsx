import { useState } from 'react'
import HandTrackingCamera from '../components/HandTrackingCamera.jsx'

export default function Live() {
  const [recognizedWord, setRecognizedWord] = useState('—')
  const [sentence, setSentence] = useState(
    'Start signing to see your recognized words here.'
  )

  function speakSentence() {
    if (!sentence || sentence.startsWith('Start signing')) return

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(sentence)
      utterance.lang = 'en-US'
      utterance.rate = 0.95

      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <main className="live-page">

      <div className="live-heading">
        <div>
          <div className="eyebrow">
            <span className="diamond">◆</span>
            Live interpreter
          </div>

          <h1>Sign to speech, in real time.</h1>

          <p>
            SignFrame watches your hand movements and will turn recognized
            signs into natural speech.
          </p>
        </div>

        <div className="live-ai-badge">
          AI INTERPRETER
        </div>
      </div>

      <section className="live-grid">

        {/* CAMERA */}

        <div className="live-camera-card">

          <div className="live-card-header">
            <div>
              <span className="live-card-label">
                CAMERA
              </span>

              <h2>Show your sign</h2>
            </div>

            <span className="live-status-dot">
              LIVE
            </span>
          </div>

          <div className="live-camera-frame">
            <HandTrackingCamera />
          </div>

          <p className="live-camera-help">
            Allow camera access, then position your hand clearly
            inside the frame.
          </p>

        </div>


        {/* INTERPRETATION */}

        <div className="live-result-card">

          <span className="live-card-label">
            INTERPRETATION
          </span>

          <div className="live-result-block">

            <span>
              Recognized sign
            </span>

            <strong>
              {recognizedWord}
            </strong>

          </div>

          <div className="live-divider" />

          <div className="live-result-block sentence-block">

            <span>
              Sentence
            </span>

            <p>
              {sentence}
            </p>

          </div>

          <button
            className="btn btn-primary live-speak-button"
            onClick={speakSentence}
          >
            🔊 Speak sentence
          </button>

          {/* TEMPORARY TEST BUTTON */}

          <button
            className="btn btn-ghost live-demo-button"
            onClick={() => {
              setRecognizedWord('HELLO')
              setSentence('Hello!')
            }}
          >
            Test interpreter
          </button>

          <p className="live-demo-note">
            The test button is temporary. We will replace it with
            your teammate's GRU prediction once the trained model
            is connected.
          </p>

        </div>

      </section>

    </main>
  )
}