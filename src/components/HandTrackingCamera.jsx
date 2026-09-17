import { useEffect, useRef, useState } from 'react'
import { createHandLandmarker } from '../services/handLandmarker'

export default function HandTrackingCamera() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const streamRef = useRef(null)
  const handLandmarkerRef = useRef(null)
  const animationFrameRef = useRef(null)
  const lastVideoTimeRef = useRef(-1)

  const [status, setStatus] = useState('starting')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let mounted = true

    async function setupCameraAndTracking() {
      try {
        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices.getUserMedia
        ) {
          throw new Error(
            'Camera access is not supported by this browser.'
          )
        }
        setStatus('camera')

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
          },
          audio: false,
        })

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream

        const video = videoRef.current

        if (!video) {
          throw new Error(
            'Video element could not be found.'
          )
        }

        video.srcObject = stream
        await new Promise((resolve, reject) => {
          if (video.readyState >= 2) {
            resolve()
            return
          }

          video.onloadedmetadata = () => {
            resolve()
          }

          video.onerror = () => {
            reject(
              new Error('The camera video could not be loaded.')
            )
          }
        })

        if (!mounted) return

        await video.play()
        setStatus('model')
        const handLandmarker = await createHandLandmarker()

        if (!mounted) return

        handLandmarkerRef.current = handLandmarker
        setStatus('tracking')
        detectHands()

      } catch (error) {
        console.error('========== HAND TRACKING ERROR ==========')
        console.error('Error name:', error.name)
        console.error('Error message:', error.message)
        console.error('Full error:', error)
        console.error('==========================================')

        if (!mounted) return

        setErrorMessage(
          `${error.name || 'Error'}: ${
            error.message || 'Unknown error'
          }`
        )

        setStatus('error')
      }
    }
    function detectHands() {
      if (!mounted) return

      const video = videoRef.current
      const canvas = canvasRef.current
      const handLandmarker = handLandmarkerRef.current

      if (!video || !canvas || !handLandmarker) {
        animationFrameRef.current =
          requestAnimationFrame(detectHands)

        return
      }
      if (
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        animationFrameRef.current =
          requestAnimationFrame(detectHands)

        return
      }
      if (
        canvas.width !== video.videoWidth ||
        canvas.height !== video.videoHeight
      ) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }

      const ctx = canvas.getContext('2d')

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      )
      if (
        video.currentTime !== lastVideoTimeRef.current
      ) {
        lastVideoTimeRef.current =
          video.currentTime

        const results =
          handLandmarker.detectForVideo(
            video,
            performance.now()
          )

        if (
          results.landmarks &&
          results.landmarks.length > 0
        ) {
          for (const landmarks of results.landmarks) {
            drawHand(ctx, landmarks)
          }
        }
      }

      animationFrameRef.current =
        requestAnimationFrame(detectHands)
    }

    function drawHand(ctx, landmarks) {
      const canvas = canvasRef.current

      if (!canvas) return

      const width = canvas.width
      const height = canvas.height
      const connections = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],

        [0, 5],
        [5, 6],
        [6, 7],
        [7, 8],

        [5, 9],
        [9, 10],
        [10, 11],
        [11, 12],

        [9, 13],
        [13, 14],
        [14, 15],
        [15, 16],

        [13, 17],
        [17, 18],
        [18, 19],
        [19, 20],

        [0, 17],
      ]
      ctx.beginPath()

      for (const [start, end] of connections) {
        const startPoint = landmarks[start]
        const endPoint = landmarks[end]

        ctx.moveTo(
          startPoint.x * width,
          startPoint.y * height
        )

        ctx.lineTo(
          endPoint.x * width,
          endPoint.y * height
        )
      }

      ctx.lineWidth = 3
      ctx.strokeStyle = '#ff6f61'
      ctx.stroke()
      for (const landmark of landmarks) {
        const x = landmark.x * width
        const y = landmark.y * height

        ctx.beginPath()

        ctx.arc(
          x,
          y,
          5,
          0,
          Math.PI * 2
        )

        ctx.fillStyle = '#ffffff'
        ctx.fill()

        ctx.lineWidth = 2
        ctx.strokeStyle = '#ff6f61'
        ctx.stroke()
      }
    }

    setupCameraAndTracking()
    return () => {
      mounted = false

      if (animationFrameRef.current) {
        cancelAnimationFrame(
          animationFrameRef.current
        )
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop())

        streamRef.current = null
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [])

  return (
    <div className="tracking-camera-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="tracking-camera-video"
      />
      <canvas
        ref={canvasRef}
        className="tracking-camera-canvas"
      />
      {status !== 'tracking' && (
        <div className="tracking-camera-overlay">

          {status === 'starting' && (
            <>
              <div className="camera-icon">◎</div>

              <h3>Starting camera...</h3>

              <p>
                Please allow camera access so
                SignFrame can see your signs.
              </p>
            </>
          )}

          {status === 'camera' && (
            <>
              <div className="camera-icon">◎</div>

              <h3>Starting camera...</h3>

              <p>
                Connecting to your camera.
              </p>
            </>
          )}

          {status === 'model' && (
            <>
              <div className="camera-icon">◎</div>

              <h3>Starting hand tracking...</h3>

              <p>
                Loading SignFrame's hand tracking model.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="camera-icon">!</div>

              <h3>Hand tracking unavailable</h3>

              <p>
                We couldn't start the camera or
                hand tracking.
              </p>

              <div className="camera-error-details">
                {errorMessage}
              </div>
            </>
          )}

        </div>
      )}
      {status === 'tracking' && (
        <div className="tracking-status">
          HAND TRACKING
        </div>
      )}

    </div>
  )
}