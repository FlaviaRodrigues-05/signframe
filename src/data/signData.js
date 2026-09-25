const HF_BASE = "https://huggingface.co/datasets/chris0202/wlasl100-signframe/resolve/main";

const hfVideo = (word, filename) =>
  `${HF_BASE}/${encodeURIComponent(word)}/${filename}`;

export const DATA = {
  ASL: {
    letters: [
      { label: "A", mediaType: "image", mediaUrl: "/signs/letters/A.jpg", desc: "Fist with thumb resting on the side" },
      { label: "B", mediaType: "image", mediaUrl: "/signs/letters/B.jpg", desc: "Flat hand, fingers together pointing up, thumb folded across palm" },
      { label: "C", mediaType: "image", mediaUrl: "/signs/letters/C.jpg", desc: "Curved hand forming a C shape" },
      { label: "D", mediaType: "image", mediaUrl: "/signs/letters/D.jpg", desc: "Index finger up, other fingers touch thumb forming a circle" },
      { label: "E", mediaType: "image", mediaUrl: "/signs/letters/E.jpg", desc: "Fingers curled down, thumb tucked under fingertips" },
      { label: "F", mediaType: "image", mediaUrl: "/signs/letters/F.jpg", desc: "Thumb and index finger touch forming a circle, other three fingers up" },
      { label: "G", mediaType: "image", mediaUrl: "/signs/letters/G.jpg", desc: "Index finger and thumb point sideways" },
      { label: "H", mediaType: "image", mediaUrl: "/signs/letters/H.jpg", desc: "Index and middle finger extended together" },
      { label: "I", mediaType: "image", mediaUrl: "/signs/letters/I.jpg", desc: "Pinky finger up, other fingers folded" },
      { label: "J", mediaType: "image", mediaUrl: "/signs/letters/J.jpg", desc: "Pinky up and traces a J shape" },
      { label: "K", mediaType: "image", mediaUrl: "/signs/letters/K.jpg", desc: "Index and middle finger up in a V" },
      { label: "L", mediaType: "image", mediaUrl: "/signs/letters/L.jpg", desc: "Index finger up and thumb out" },
      { label: "M", mediaType: "image", mediaUrl: "/signs/letters/M.jpg", desc: "Thumb tucked under three fingers" },
      { label: "N", mediaType: "image", mediaUrl: "/signs/letters/N.jpg", desc: "Thumb tucked under two fingers" },
      { label: "O", mediaType: "image", mediaUrl: "/signs/letters/O.jpg", desc: "Fingers curve to meet the thumb" },
      { label: "P", mediaType: "image", mediaUrl: "/signs/letters/P.jpg", desc: "Like K, but pointed downward" },
      { label: "Q", mediaType: "image", mediaUrl: "/signs/letters/Q.jpg", desc: "Thumb and index point downward" },
      { label: "R", mediaType: "image", mediaUrl: "/signs/letters/R.jpg", desc: "Index and middle finger crossed" },
      { label: "S", mediaType: "image", mediaUrl: "/signs/letters/S.jpg", desc: "Fist with thumb across the front" },
      { label: "T", mediaType: "image", mediaUrl: "/signs/letters/T.jpg", desc: "Thumb between index and middle finger" },
      { label: "U", mediaType: "image", mediaUrl: "/signs/letters/U.jpg", desc: "Index and middle fingers together" },
      { label: "V", mediaType: "image", mediaUrl: "/signs/letters/V.jpg", desc: "Index and middle fingers form a V" },
      { label: "W", mediaType: "image", mediaUrl: "/signs/letters/W.jpg", desc: "Three fingers extended and spread" },
      { label: "X", mediaType: "image", mediaUrl: "/signs/letters/X.jpg", desc: "Index finger bent into a hook" },
      { label: "Y", mediaType: "image", mediaUrl: "/signs/letters/Y.jpg", desc: "Thumb and pinky extended" },
      { label: "Z", mediaType: "image", mediaUrl: "/signs/letters/Z.jpg", desc: "Index finger traces a Z" }
    ],

  
    words: [

  {
    word: "you",
    emoji: "👉",
    hint: "Point toward the person you are referring to.",
    video: "/sign-videos/69547.mp4",
    source: "local"
  },
  {
    word: "me",
    emoji: "🙋",
    hint: "Point toward yourself.",
    video: "/sign-videos/35544.mp4",
    source: "local"
  },
  {
    word: "please",
    emoji: "🙏",
    hint: "Make a flat hand and circle it on your chest.",
    video: "/sign-videos/69434.mp4",
    source: "local"
  },
  {
    word: "thank you",
    emoji: "🤲",
    hint: "Move your hand forward from your chin.",
    video: "/sign-videos/69502.mp4",
    source:"local"
  },
  {
    word: "eat",
    emoji: "🍽️",
    hint: "Bring your fingertips toward your mouth.",
    video: "/sign-videos/69307.mp4",
    source: "local"
  },
  {
    word: "more",
    emoji: "➕",
    hint: "Bring your hands together repeatedly.",
    video: "/sign-videos/69401.mp4",
    source: "local"
  },
  {
    word: "less",
    emoji: "➖",
    hint: "Show a smaller amount with your hands.",
    video: "/sign-videos/69386.mp4",
    source: "local"
  },
  {
    word: "want",
    emoji: "🙌",
    hint: "Pull your hands toward yourself.",
    video: "/sign-videos/69524.mp4",
    source: "local"
  },
  {
    word: "need",
    emoji: "❗",
    hint: "Show that something is necessary.",
    video: "/sign-videos/37886.mp4",
    source: "local"
  },
  {
    word: "good",
    emoji: "👍",
    hint: "Move your hand forward from your mouth.",
    video: "/sign-videos/69347.mp4",
    source: "local"
  },
  {
    word: "bad",
    emoji: "👎",
    hint: "Move your hand downward from your mouth.",
    video: "/sign-videos/69219.mp4",
    source: "local"
  },
  {
    word: "love",
    emoji: "❤️",
    hint: "Cross both hands over your chest.",
    video: "/sign-videos/34123.mp4",
    source: "local"
  },
  {
    word: "like",
    emoji: "❤️",
    hint: "Show that you like something.",
    video: "/sign-videos/69389.mp4",
    source: "local"
  },
  {
    word: "have",
    emoji: "🤲",
    hint: "Hold your hands as if you have something.",
    video: "/sign-videos/69360.mp4",
    source: "local"
  },
  {
    word: "sorry",
    emoji: "✊",
    hint: "Make a fist and circle it on your chest.",
    video: "/sign-videos/53371.mp4",
    source: "local"
  },
  {
    word: "hello",
    emoji: "👋",
    hint: "Wave your hand to greet someone.",
    video: "/sign-videos/27184.mp4",
    source: "local"
  },
  {
    word: "goodbye",
    emoji: "👋",
    hint: "Wave your hand goodbye.",
    video: "/sign-videos/25044.mp4",
    source: "local"
  },
  {
    word: "what",
    emoji: "❓",
    hint: "Use the sign for asking what.",
    video: "/sign-videos/69531.mp4",
    source: "local"
  },
  {
    word: "where",
    emoji: "📍",
    hint: "Use the sign for asking where.",
    video: "/sign-videos/63087.mp4",
    source: "local"
  },
  
  {
        word: "book",
        emoji: "📖",
        videoUrl: "/sign-videos/book.mp4",
      source: "local",
        hint: "Practice the sign shown in the reference video."
      },
      {
        word: "drink",
        emoji: "🥤",
        videoUrl: "/sign-videos/drink.mp4",
      source: "local",
        hint: "Practice the sign shown in the reference video."
      },
      {
        word: "computer",
        emoji: "💻",
        videoUrl: "/sign-videos/computer.mp4",
      source: "local",
        hint: "Practice the sign shown in the reference video."
      },
      {
        word: "before",
        emoji: "⏮️",
        videoUrl: "/sign-videos/before.mp4",
      source: "local",
        hint: "Practice the sign shown in the reference video."
      },
      {
        word: "chair",
        emoji: "🪑",
        videoUrl: "/sign-videos/chair.mp4",
      source: "local",
        hint: "Practice the sign shown in the reference video."
      },
      {
        word: "go",
        emoji: "➡️",
        videoUrl: "/sign-videos/go.mp4",
      source: "local",
        hint: "Practice the sign shown in the reference video."
      },
      {
        word: "clothes",
        emoji: "👕",
        videoUrl: "/sign-videos/clothes.mp4",
      source: "local",
        hint: "Practice the sign shown in the reference video."
      },
      {
        word: "who",
        emoji: "❓",
        videoUrl: "/sign-videos/who.mp4",
      source: "local",
        hint: "Practice the sign shown in the reference video."
      },
      {
        word: "candy",
        emoji: "🍬",
        videoUrl: "/sign-videos/candy.mp4",
      source: "local",
        hint: "Practice the sign shown in the reference video."
      },
      {
        word: "cousin",
        emoji: "👥",
        videoUrl: "/sign-videos/cousin.mp4",
      source: "local",
        hint: "Practice the sign shown in the reference video."
      },
      {
        word: "deaf",
        emoji: "🤟",
        videoUrl: "/sign-videos/deaf.mp4",
      source: "local",
        hint: "Practice the sign shown in the reference video."
      },
      {
        word: "fine",
        emoji: "👌",
        videoUrl: "/sign-videos/fine.mp4",
      source: "local",
        hint: "Practice the sign shown in the reference video."
      },
      {
        word: "help",
        emoji: "🆘",
        videoUrl: "/sign-videos/help.mp4",
      source: "local",
        hint: "Practice the sign shown in the reference video."
      },
      {
        word: "no",
        emoji: "✋",
        videoUrl: "/sign-videos/no.mp4",
      source: "local",
        hint: "Practice the sign shown in the reference video."
      },
      {
        word: "thin",
        emoji: "🫱",
        videoUrl: "/sign-videos/thin.mp4",
      source: "local",
        hint: "Practice the sign shown in the reference video."
      },
      {
        word: "walk",
        emoji: "🚶",
        videoUrl: "/sign-videos/walk.mp4",
      source: "local",
        hint: "Practice the sign shown in the reference video."
      },
      {
        word: "year",
        emoji: "📅",
        videoUrl: "/sign-videos/year.mp4",
      source: "local",
        hint: "Practice the sign shown in the reference video."
      },
      {
        word: "yes",
        emoji: "👍",
        videoUrl: "/sign-videos/yes.mp4",
      source: "local",
        hint: "Practice the sign shown in the reference video."
      },
      {
        word: "all",
        emoji: "🌎",
        videoUrl: "/sign-videos/all.mp4",
      source: "local",
        hint: "Practice the sign shown in the reference video."
      },
      {
        word: "black",
        emoji: "⚫",
        videoUrl: "/sign-videos/black.mp4",
      source: "local",
        hint: "Practice the sign shown in the reference video."
      }
    ],
 

  sentences: [
  {
    text: "I need help",
    words: ["I", "need", "help"]
  },
  {
    text: "I want to eat",
    words: ["I", "want", "to", "eat"]
  },
  {
    text: "Please help me",
    words: ["please", "help", "me"]
  },
  {
    text: "Where are you?",
    words: ["where", "are", "you"]
  },
  {
    text: "What do you want?",
    words: ["what", "do", "you", "want"]
  },
  {
    text: "I want to go",
    words: ["I", "want", "to", "go"]
  },
  {
    text: "I like this book",
    words: ["I", "like", "this", "book"]
  },
  {
    text: "Thank you",
    words: ["thank", "you"]
  },
  {
    text: "Hello, how are you?",
    words: ["hello", "how", "are", "you"]
  },
  {
    text: "I need a computer",
    words: ["I", "need", "a", "computer"]
  },
  {
    text: "I drink",
    words: ["I", "drink"]
  },
  {
    text: "Go before me",
    words: ["go", "before", "me"]
  },
  {
    text: "Black clothes",
    words: ["black", "clothes"]
  },
  {
    text: "Play basketball",
    words: ["play", "basketball"]
  },
  {
    text: "Eat candy",
    words: ["eat", "candy"]
  }
]
},

  ISL: {
    letters: [],
    words: []
  }
};