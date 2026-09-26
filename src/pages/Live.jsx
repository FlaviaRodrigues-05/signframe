import { useState, useRef } from 'react'

import HandTrackingCamera from '../components/HandTrackingCamera.jsx'

const BACKEND_URL = 'http://localhost:5001'

export default function Live() {

  const [recognizedWord, setRecognizedWord] = useState('—')

  const [sentence, setSentence] = useState(
    'Start signing to see your recognized words here.'
  )

  const [isRecognizing, setIsRecognizing] = useState(false)

  const [confidence, setConfidence] = useState(null)

  const [error, setError] = useState('')

  const videoRef = useRef(null)


  // ============================================================
  // CAPTURE 16 FRAMES FROM THE LIVE CAMERA
  // ============================================================

  async function captureFrames() {

    /*
      HandTrackingCamera should render the webcam video.

      We look for the video element inside the camera frame.
    */

    const video =
      document.querySelector(
        '.live-camera-frame video'
      )

    if (!video) {
      throw new Error(
        'Camera video could not be found.'
      )
    }

    if (
      !video.videoWidth ||
      !video.videoHeight
    ) {
      throw new Error(
        'Camera is not ready yet.'
      )
    }


    const canvas =
      document.createElement('canvas')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context =
      canvas.getContext('2d')


    const frames = []


    /*
      The GRU was trained using 16-frame sequences.

      Capture 16 frames over a short period rather than
      sending the exact same frame repeatedly.
    */

    for (let i = 0; i < 16; i++) {

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      )


      const blob =
        await new Promise((resolve) => {

          canvas.toBlob(
            resolve,
            'image/jpeg',
            0.85
          )

        })


      if (!blob) {
        throw new Error(
          'Could not capture camera frame.'
        )
      }


      frames.push(blob)


      /*
        Small delay between frames.
      */

      if (i < 15) {

        await new Promise(
          resolve =>
            setTimeout(resolve, 70)
        )

      }

    }


    return frames
  }


  // ============================================================
  // SEND FRAMES TO GRU BACKEND
  // ============================================================

  async function recognizeSign() {

    try {

      setIsRecognizing(true)

      setError('')

      setRecognizedWord('...')

      setConfidence(null)


      // ------------------------------------------
      // Capture 16 frames
      // ------------------------------------------

      const frames =
        await captureFrames()


      // ------------------------------------------
      // Create multipart request
      // ------------------------------------------

      const formData =
        new FormData()


      frames.forEach(
        (frame, index) => {

          formData.append(
            'frames',
            frame,
            `frame_${index}.jpg`
          )

        }
      )


      // ------------------------------------------
      // Send to Flask
      // ------------------------------------------

      const response =
        await fetch(
          `${BACKEND_URL}/predict`,
          {
            method: 'POST',
            body: formData
          }
        )


      const data =
        await response.json()


      // ------------------------------------------
      // Handle backend errors
      // ------------------------------------------

      if (!response.ok) {

        throw new Error(
          data.error ||
          'Prediction failed.'
        )

      }


      console.log(
        'GRU prediction:',
        data
      )


      // ------------------------------------------
      // Display recognized word
      // ------------------------------------------

      const word =
        data.word || '—'


      setRecognizedWord(
        word.toUpperCase()
      )


      if (
        typeof data.confidence ===
        'number'
      ) {

        setConfidence(
          data.confidence
        )

      }


      /*
        For now we display the recognized word
        as the sentence.

        Later Gemini will turn a sequence of
        recognized words into a natural sentence.
      */

      setSentence(
        `Recognized sign: ${word}`
      )


    } catch (err) {

      console.error(
        'Recognition error:',
        err
      )


      setRecognizedWord('—')

      setConfidence(null)

      setError(
        err.message ||
        'Unable to recognize the sign.'
      )


    } finally {

      setIsRecognizing(false)

    }

  }


  // ============================================================
  // TEXT TO SPEECH
  // ============================================================

  function speakSentence() {

    if (
      !sentence ||
      sentence.startsWith(
        'Start signing'
      )
    ) {
      return
    }


    if (
      'speechSynthesis' in window
    ) {

      window.speechSynthesis.cancel()


      const utterance =
        new SpeechSynthesisUtterance(
          sentence
        )


      utterance.lang =
        'en-US'


      utterance.rate =
        0.95


      window.speechSynthesis.speak(
        utterance
      )

    }

  }


  // ============================================================
  // UI
  // ============================================================

  return (

    <main className="live-page">

      <div className="live-heading">

        <div>

          <div className="eyebrow">

            <span className="diamond">
              ◆
            </span>

            Live interpreter

          </div>


          <h1>
            Sign to speech, in real time.
          </h1>


          <p>
            SignFrame watches your hand movements
            and will turn recognized signs into
            natural speech.
          </p>

        </div>


        <div className="live-ai-badge">
          AI INTERPRETER
        </div>

      </div>


      <section className="live-grid">


        {/* =====================================================
            CAMERA
        ====================================================== */}

        <div className="live-camera-card">

          <div className="live-card-header">

            <div>

              <span className="live-card-label">
                CAMERA
              </span>


              <h2>
                Show your sign
              </h2>

            </div>


            <span className="live-status-dot">
              LIVE
            </span>

          </div>


          <div
            className="live-camera-frame"
            ref={videoRef}
          >

            <HandTrackingCamera />

          </div>


          <p className="live-camera-help">

            Allow camera access, then position
            your hand clearly inside the frame.

          </p>


          {/* =================================================
              RECOGNIZE BUTTON
          ================================================== */}

          <button
            className="btn btn-primary"
            onClick={recognizeSign}
            disabled={isRecognizing}
            style={{
              width: '100%',
              marginTop: '14px',
              justifyContent: 'center'
            }}
          >

            {isRecognizing
              ? 'Recognizing...'
              : 'Recognize sign'}

          </button>

        </div>


        {/* =====================================================
            INTERPRETATION
        ====================================================== */}

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


            {/* -----------------------------------------------
                CONFIDENCE
            ------------------------------------------------ */}

            {confidence !== null && (

              <small
                style={{
                  display: 'block',
                  marginTop: '8px',
                  opacity: 0.7
                }}
              >

                Confidence:{' '}

                {(
                  confidence * 100
                ).toFixed(1)}

                %

              </small>

            )}

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


          {/* =================================================
              ERROR
          ================================================== */}

          {error && (

            <div
              style={{
                marginTop: '14px',
                padding: '10px 12px',
                borderRadius: '10px',
                fontSize: '13px'
              }}
            >

              {error}

            </div>

          )}


          {/* =================================================
              SPEAK
          ================================================== */}

          <button
            className="btn btn-primary live-speak-button"
            onClick={speakSentence}
          >

            🔊 Speak sentence

          </button>


        </div>

      </section>

    </main>

  )

}