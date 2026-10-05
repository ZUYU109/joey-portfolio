import { useEffect, useRef } from 'react'

export default function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!fine) return undefined

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const root = document.documentElement
    const dotEl = dot.current
    const ringEl = ring.current
    root.classList.add('custom-cursor')

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let rx = x
    let ry = y
    let frame = 0

    const show = (on) => {
      const opacity = on ? '1' : '0'
      dotEl.style.opacity = opacity
      ringEl.style.opacity = opacity
    }

    const onMove = (event) => {
      x = event.clientX
      y = event.clientY
      show(true)
      ringEl.classList.toggle('hot', Boolean(event.target.closest?.('a, button')))
    }

    const onOut = (event) => {
      if (!event.relatedTarget) show(false)
    }

    const tick = () => {
      if (reduce) {
        rx = x
        ry = y
      } else {
        rx += (x - rx) * 0.2
        ry += (y - ry) * 0.2
      }
      dotEl.style.transform = `translate3d(${x}px, ${y}px, 0)`
      ringEl.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      frame = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove)
    document.addEventListener('pointerout', onOut)
    frame = requestAnimationFrame(tick)

    return () => {
      root.classList.remove('custom-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerout', onOut)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <>
      <div className="cursor-ring" ref={ring} aria-hidden="true" />
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
    </>
  )
}
