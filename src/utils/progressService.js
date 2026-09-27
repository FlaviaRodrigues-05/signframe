import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const emptyProgress = () => ({
  alphabet: {
    completedItems: [],
    scores: {}
  },

  words: {
    completedItems: []
  },

  sentences: {
    completedItems: []
  }
})


// Get the current user's progress
export async function getUserProgress(userId) {
  if (!userId) {
    throw new Error('User ID is required')
  }

  const progressRef = doc(
    db,
    'users',
    userId,
    'progress',
    'overall'
  )

  const snapshot = await getDoc(progressRef)

  if (!snapshot.exists()) {
    return emptyProgress()
  }

  return snapshot.data()
}


// Save a completed item
export async function saveItemProgress({
  userId,
  module,
  itemId,
  score
}) {
  if (!userId) {
    throw new Error('User ID is required')
  }

  if (!module) {
    throw new Error('Module is required')
  }

  if (!itemId) {
    throw new Error('Item ID is required')
  }

  const progressRef = doc(
    db,
    'users',
    userId,
    'progress',
    'overall'
  )

  const snapshot = await getDoc(progressRef)

  const current = snapshot.exists()
    ? snapshot.data()
    : emptyProgress()

  const moduleProgress = current[module] || {
    completedItems: [],
    scores: {}
  }

  const completedItems = [
    ...(moduleProgress.completedItems || [])
  ]

  // Prevent duplicate completion
  if (!completedItems.includes(itemId)) {
    completedItems.push(itemId)
  }

  const updatedModule = {
    ...moduleProgress,
    completedItems
  }

  // Keep the user's best score
  if (typeof score === 'number') {
    const previousScore =
      moduleProgress.scores?.[itemId] || 0

    updatedModule.scores = {
      ...(moduleProgress.scores || {}),
      [itemId]: Math.max(
        previousScore,
        score
      )
    }
  }

  await setDoc(
    progressRef,
    {
      ...current,
      [module]: updatedModule
    },
    {
      merge: true
    }
  )

  return {
    ...current,
    [module]: updatedModule
  }
}