import { useEffect, useRef, useState } from 'react'

export default function CameraView() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const [cameraState, setCameraState] = useState('requesting')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let mounted = true

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API is not supported by this browser.')
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user'
          },
          audio: false
        })

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop())
          return
        }

        streamRef.current = stream

        setCameraState('active')

      } catch (error) {
        console.error('Camera access error:', error)
        console.error('Error name:', error.name)
        console.error('Error message:', error.message)

        if (!mounted) return

        setErrorMessage(error.message || error.name)

        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setCameraState('denied')
        } else {
          setCameraState('error')
        }
      }
    }

    startCamera()

    return () => {
      mounted = false

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }, [])
  useEffect(() => {
    if (
      cameraState === 'active' &&
      videoRef.current &&
      streamRef.current
    ) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [cameraState])

  if (cameraState === 'requesting') {
    return (
      <div className="camera-message">
        <div className="camera-icon">◎</div>

        <h3>Camera access required</h3>

        <p>
          Please allow camera access so SignFrame can see your signs.
        </p>
      </div>
    )
  }

  if (cameraState === 'denied') {
    return (
      <div className="camera-message">
        <div className="camera-icon">!</div>

        <h3>Camera access denied</h3>

        <p>
          Please allow camera access in your browser settings and reload the page.
        </p>
      </div>
    )
  }

  if (cameraState === 'error') {
    return (
      <div className="camera-message">
        <div className="camera-icon">!</div>

        <h3>Camera unavailable</h3>

        <p>
          We couldn't access your camera.
        </p>

        <small style={{ marginTop: '12px', opacity: 0.7 }}>
          {errorMessage}
        </small>
      </div>
    )
  }

  return (
    <div className="camera-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="camera-video"
      />
    </div>
  )
}