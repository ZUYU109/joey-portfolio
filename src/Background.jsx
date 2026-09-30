import { useEffect, useRef } from "react"

export default function Background() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let frame = 0
    let width = 0
    let height = 0
    const dots = []

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * ratio
      canvas.height = height * ratio
      canvas.style.width = width + "px"
      canvas.style.height = height + "px"
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      const count = Math.min(90, Math.floor((width * height) / 18000))
      dots.length = 0
      for (let i = 0; i < count; i += 1) {
        dots.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      for (const dot of dots) {
        if (!reduce) {
          dot.x += dot.vx
          dot.y += dot.vy
          if (dot.x < 0 || dot.x > width) dot.vx *= -1
          if (dot.y < 0 || dot.y > height) dot.vy *= -1
        }
      }
      for (let i = 0; i < dots.length; i += 1) {
        for (let j = i + 1; j < dots.length; j += 1) {
          const a = dots[i]
          const b = dots[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist < 140) {
            ctx.strokeStyle = "rgba(150, 190, 255, " + (0.18 * (1 - dist / 140)) + ")"
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }
      for (const dot of dots) {
        ctx.fillStyle = "rgba(210, 230, 255, 0.85)"
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, 1.4, 0, Math.PI * 2)
        ctx.fill()
      }
      if (!reduce) frame = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener("resize", resize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return <canvas ref={ref} className="bg" aria-hidden="true" />
}