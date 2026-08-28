import { useRef, useEffect } from 'react'

const HAND_CONNECTIONS = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[0,9],[9,10],[10,11],[11,12],[0,13],[13,14],[14,15],[15,16],[0,17],[17,18],[18,19],[19,20],[5,9],[9,13],[13,17]]
const BASE_POINTS = [[150,190],[130,170],[115,145],[105,120],[98,100],[140,140],[135,105],[132,80],[130,58],[155,135],[155,95],[155,68],[155,42],[170,140],[172,102],[173,75],[174,50],[185,148],[190,115],[193,90],[196,68]]

export default function HandSkeleton(){
  const lineRef = useRef(null)
  const dotRef = useRef(null)

  useEffect(() => {
    let raf
    let t = Math.random() * 10
    const lines = lineRef.current.children
    const dots = dotRef.current.children

    function render(pts){
      for(let i=0;i<lines.length;i++){
        const [a,b] = HAND_CONNECTIONS[i]
        lines[i].setAttribute('x1', pts[a][0]); lines[i].setAttribute('y1', pts[a][1])
        lines[i].setAttribute('x2', pts[b][0]); lines[i].setAttribute('y2', pts[b][1])
      }
      for(let i=0;i<dots.length;i++){
        dots[i].setAttribute('cx', pts[i][0]); dots[i].setAttribute('cy', pts[i][1])
      }
    }
    function animate(){
      t += 0.02
      render(BASE_POINTS.map(([x,y],i) => [x + Math.sin(t+i*.4)*2.2, y + Math.cos(t*.8+i*.3)*2.2]))
      raf = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <svg viewBox="0 0 300 225">
      <g ref={lineRef} stroke="#6B5FA8" strokeWidth="1.4" opacity="0.5">
        {HAND_CONNECTIONS.map((_, i) => <line key={i} />)}
      </g>
      <g ref={dotRef} fill="#FF6F5C">
        {BASE_POINTS.map((_, i) => <circle key={i} r={i === 0 ? 4 : 2.6} />)}
      </g>
    </svg>
  )
}
