import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Earth from './Earth'

const shots = [
  ['flutter-boss.webp', 'Boss home'],
  ['flutter-orders.webp', 'Orders'],
  ['flutter-schedule.webp', 'Add schedule'],
  ['flutter-more.webp', 'More menu'],
  ['flutter-driver.webp', 'Driver home'],
]

const projects = [
  {
    name: 'Field Job',
    text: 'A Flutter app for field work: job lists, maps, and data sync.',
    tech: 'Flutter',
  },
  {
    name: 'API Layer',
    text: 'Backend-for-frontend services in C# and .NET, with external APIs in both directions.',
    tech: 'C# · .NET',
  },
  {
    name: 'Shop Site',
    text: 'A mobile-friendly e-commerce website built during an internship.',
    tech: 'WordPress',
  },
]

const jobs = [
  ['2024 — now', 'Software Engineer (Level I)', 'Nettium Sdn. Bhd., Kuala Lumpur'],
  ['2023 — 2024', 'Junior Software Developer', 'Fujitsu, Kuala Lumpur'],
  ['2020', 'Website Developer Intern', 'JustSimple, Petaling Jaya'],
]

const sections = [
  ['about', 'About'],
  ['projects', 'Projects'],
  ['experience', 'Experience'],
  ['skills', 'Skills'],
]

const skills = [
  'C#',
  '.NET',
  'REST',
  'SQL',
  'Flutter',
  'Git',
  'Azure DevOps',
  'JavaScript',
  'Java',
  'PHP',
  'Laravel',
]

function Shots() {
  const ref = useRef(null)
  const drag = useRef({ active: false, x: 0, left: 0, moved: false })
  const [edge, setEdge] = useState({ left: false, right: false })
  const [zoom, setZoom] = useState(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = ref.current
    const update = () => {
      setEdge({
        left: el.scrollLeft > 8,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 8,
      })
    }
    const onWheel = (event) => {
      if (el.scrollWidth <= el.clientWidth + 2) return
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      if (!delta) return
      const max = el.scrollWidth - el.clientWidth
      const next = Math.min(max, Math.max(0, el.scrollLeft + delta))
      if (next === el.scrollLeft) return
      event.preventDefault()
      el.scrollLeft = next
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    el.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('resize', update)
    const images = [...el.querySelectorAll('img')]
    images.forEach((img) => img.addEventListener('load', update))
    return () => {
      el.removeEventListener('scroll', update)
      el.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', update)
      images.forEach((img) => img.removeEventListener('load', update))
    }
  }, [])

  useEffect(() => {
    if (zoom == null) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setZoom(null)
      if (event.key === 'ArrowRight') {
        setScale(1)
        setZoom((index) => (index + 1) % shots.length)
      }
      if (event.key === 'ArrowLeft') {
        setScale(1)
        setZoom((index) => (index - 1 + shots.length) % shots.length)
      }
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [zoom])

  const move = (dir) => {
    const el = ref.current
    const cards = [...el.querySelectorAll('.shot')]
    let index = 0
    cards.forEach((card, i) => {
      if (card.offsetLeft <= el.scrollLeft + 8) index = i
    })
    const next = cards[Math.max(0, Math.min(cards.length - 1, index + dir))]
    el.scrollTo({ left: next.offsetLeft, behavior: 'smooth' })
  }

  const onPointerDown = (event) => {
    if (event.button !== 0) return
    const el = ref.current
    drag.current = { active: true, x: event.clientX, left: el.scrollLeft, moved: false, captured: false }
  }

  const onPointerMove = (event) => {
    if (!drag.current.active) return
    const dx = event.clientX - drag.current.x
    if (Math.abs(dx) <= 5) return
    drag.current.moved = true
    if (!drag.current.captured) {
      ref.current.setPointerCapture(event.pointerId)
      drag.current.captured = true
    }
    ref.current.scrollLeft = drag.current.left - dx
  }

  const onPointerUp = () => {
    drag.current.active = false
  }

  const show = (index) => {
    setScale(1)
    setZoom((index + shots.length) % shots.length)
  }

  return (
    <>
      <div className="shot-row">
        <div
          className="shots"
          ref={ref}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {shots.map(([file, label], index) => (
            <button
              key={file}
              className="shot"
              type="button"
              aria-label={`Zoom ${label}`}
              onClick={() => {
                if (drag.current.moved) {
                  drag.current.moved = false
                  return
                }
                show(index)
              }}
            >
              <img src={`${import.meta.env.BASE_URL}${file}`} alt={label} draggable="false" />
            </button>
          ))}
        </div>
        {edge.left && (
          <button className="shot-btn prev" type="button" onClick={() => move(-1)} aria-label="Previous screen">
            ‹
          </button>
        )}
        {edge.right && (
          <button className="shot-btn next" type="button" onClick={() => move(1)} aria-label="Next screen">
            ›
          </button>
        )}
      </div>
      {zoom != null && createPortal(
        <div className="zoom" role="dialog" aria-modal="true" aria-label={shots[zoom][1]} onClick={() => setZoom(null)}>
          <button className="zoom-close" type="button" aria-label="Close" onClick={() => setZoom(null)}>
            ×
          </button>
          <button
            className="shot-btn prev zoom-nav"
            type="button"
            aria-label="Previous screen"
            onClick={(event) => {
              event.stopPropagation()
              show(zoom - 1)
            }}
          >
            ‹
          </button>
          <figure onClick={(event) => event.stopPropagation()}>
            <img
              src={`${import.meta.env.BASE_URL}${shots[zoom][0]}`}
              alt={shots[zoom][1]}
              className={scale > 1 ? 'in' : ''}
              onClick={() => setScale((value) => (value > 1 ? 1 : 2))}
            />
            <figcaption>{shots[zoom][1]} · click the image to zoom</figcaption>
          </figure>
          <button
            className="shot-btn next zoom-nav"
            type="button"
            aria-label="Next screen"
            onClick={(event) => {
              event.stopPropagation()
              show(zoom + 1)
            }}
          >
            ›
          </button>
        </div>,
        document.body,
      )}
    </>
  )
}

function Stars() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.3 + 0.2,
      a: Math.random() * 0.7 + 0.25,
    }))

    const draw = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w * ratio
      canvas.height = h * ratio
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      ctx.clearRect(0, 0, w, h)
      for (const star of stars) {
        ctx.fillStyle = `rgba(255,255,255,${star.a})`
        ctx.beginPath()
        ctx.arc(star.x * w, star.y * h, star.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [])

  return <canvas ref={ref} className="stars" aria-hidden="true" />
}

function Launch() {
  const [phase, setPhase] = useState('load')
  const [pct, setPct] = useState(6)
  const base = import.meta.env.BASE_URL

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.body.style.overflow = 'hidden'
    const started = performance.now()
    let done = 0
    let cancelled = false
    const sources = [`${base}earth-map.jpg`, `${base}rocket.webp`]

    const timers = []
    const ready = () => {
      if (cancelled) return
      const wait = Math.max(0, 1200 - (performance.now() - started))
      setPct(100)
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return
          if (reduce) {
            document.body.style.overflow = ''
            setPhase('gone')
            return
          }
          setPhase('go')
          timers.push(window.setTimeout(() => setPhase('fade'), 2200))
          timers.push(
            window.setTimeout(() => {
              document.body.style.overflow = ''
              setPhase('gone')
            }, 2900),
          )
        }, wait),
      )
    }

    sources.forEach((src) => {
      const img = new Image()
      const step = () => {
        done += 1
        setPct(Math.min(92, Math.round((done / sources.length) * 92)))
        if (done === sources.length) ready()
      }
      img.onload = step
      img.onerror = step
      img.src = src
    })

    const trickle = window.setInterval(() => {
      setPct((n) => (n < 84 ? n + 1 : n))
    }, 45)

    return () => {
      cancelled = true
      window.clearInterval(trickle)
      timers.forEach((id) => window.clearTimeout(id))
      document.body.style.overflow = ''
    }
  }, [base])

  if (phase === 'gone') return null

  return (
    <div className={`launch ${phase}`} role="status" aria-live="polite">
      {phase === 'load' ? (
        <div className="boot">
          <p className="boot-mark">JT</p>
          <p className="boot-label">Loading {pct}%</p>
          <div className="bar" aria-hidden="true">
            <span style={{ width: `${pct}%` }} />
          </div>
        </div>
      ) : (
        <div className="rocket">
          <img src={`${base}rocket.webp`} alt="" />
          <span className="flare" aria-hidden="true" />
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setProgress(Math.min(y / 900, 1))
      const line = 140
      let current = ''
      for (const [id] of sections) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const earthScale = 1 - progress * 0.46
  const sceneOpacity = 1 - Math.max(0, (progress - 0.58) / 0.42)

  return (
    <>
      <Launch />
      <Stars />
      <header className="nav">
        <a href="#top">Joey</a>
        <nav>
          {sections.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className={active === id ? 'on' : ''}
              onClick={() => setActive(id)}
            >
              {label}
            </a>
          ))}
        </nav>
      </header>

      <div className="voyage" id="top">
        <div className="stage">
          <div className="scene" style={{ opacity: sceneOpacity }}>
            <div
              className="earth"
              style={{ transform: `scale(${earthScale})` }}
            >
              <Earth />
            </div>
          </div>
          <div className="hero" style={{ opacity: Math.max(0, 1 - progress * 1.35) }}>
            <p className="pill">Personal portfolio</p>
            <h1>Joey Tan</h1>
            <p className="scroll">Scroll</p>
          </div>
        </div>
      </div>

      <main>
        <section id="about" className={active === 'about' ? 'on' : ''}>
          <h2>About</h2>
          <dl>
            <div>
              <dt>Name</dt>
              <dd>Joey Tan Chun Yee</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>Klang, Selangor, Malaysia</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>Software engineer, C# and .NET</dd>
            </div>
            <div>
              <dt>Education</dt>
              <dd>TARUMT, BIT (Hons) Software Systems Development</dd>
            </div>
          </dl>
          <p>
            I build backend APIs that sit between a frontend and other systems,
            including incoming and outgoing external calls. I am also learning
            Flutter. I am interested in AI development, learning AI tools, and
            using them to automate day-to-day tasks.
          </p>
        </section>

        <section id="projects" className={active === 'projects' ? 'on' : ''}>
          <h2>Projects</h2>
          <Shots />
          <div className="cards">
            {projects.map((item) => (
              <article key={item.name}>
                <h3>{item.name}</h3>
                <p>{item.text}</p>
                <span>{item.tech}</span>
              </article>
            ))}
          </div>
        </section>

        <section id="experience" className={active === 'experience' ? 'on' : ''}>
          <h2>Experience</h2>
          <ul className="jobs">
            {jobs.map(([dates, role, org]) => (
              <li key={org}>
                <span>{dates}</span>
                <div>
                  <h3>{role}</h3>
                  <p>{org}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section id="skills" className={active === 'skills' ? 'on' : ''}>
          <h2>Skills</h2>
          <ul className="tags">
            {skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </section>
      </main>

      <footer>
        <a href="mailto:joeytcy1009@gmail.com">joeytcy1009@gmail.com</a>
        <span>012-606 7514</span>
      </footer>
    </>
  )
}
