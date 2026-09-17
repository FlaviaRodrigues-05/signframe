import {
  FilesetResolver,
  HandLandmarker,
} from '@mediapipe/tasks-vision'

let handLandmarker = null

export async function createHandLandmarker() {
  if (handLandmarker) {
    return handLandmarker
  }

  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
  )

  handLandmarker =
    await HandLandmarker.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath:
            '/models/hand_landmarker.task',

          delegate: 'GPU',
        },

        runningMode: 'VIDEO',

        numHands: 2,

        minHandDetectionConfidence: 0.5,

        minHandPresenceConfidence: 0.5,

        minTrackingConfidence: 0.5,
      }
    )

  return handLandmarker
}

export function getHandLandmarker() {
  return handLandmarker
}