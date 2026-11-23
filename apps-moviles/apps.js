// Apps móviles: the phone prototype (screens, swipe, dots, platform) and the process path. The rest lives in /landing/landing.js.
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const proto = document.querySelector('[data-proto]')
  const tpl = document.getElementById('screens')
  const strips = [...document.querySelectorAll('[data-strip]')]
  strips.forEach((strip) => strip.append(tpl.content.cloneNode(true)))
  const COUNT = strips[0].children.length
  const dots = [...document.querySelectorAll('[data-go]')]
  let at = 0

  const go = (i) => {
    at = (i + COUNT) % COUNT
    proto.style.setProperty('--i', String(at))
    proto.dataset.at = String(at)
    dots.forEach((d) => d.setAttribute('aria-pressed', String(Number(d.dataset.go) === at)))
  }
  go(0)

  // Auto-advance while the phone is on screen and the visitor is not interacting with it.
  let timer = null
  let visible = false
  let held = false
  const tick = () => go(at + 1)
  const sync = () => {
    const run = visible && !held && !reduce && !document.hidden
    if (run && !timer) timer = setInterval(tick, 2800)
    if (!run && timer) { clearInterval(timer); timer = null }
  }
  new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; sync() }, { threshold: 0.35 }).observe(proto)
  document.addEventListener('visibilitychange', sync)
  proto.addEventListener('pointerenter', () => { held = true; sync() })
  proto.addEventListener('pointerleave', () => { held = false; sync() })
  proto.addEventListener('focusin', () => { held = true; sync() })
  proto.addEventListener('focusout', () => { held = false; sync() })

  dots.forEach((d) => d.addEventListener('click', () => go(Number(d.dataset.go))))

  // Swipe between screens with a finger or the mouse; vertical scrolling stays with the page.
  const area = document.querySelector('[data-swipe]')
  let start = null
  area.addEventListener('pointerdown', (e) => { start = { x: e.clientX, y: e.clientY } })
  area.addEventListener('pointerup', (e) => {
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    start = null
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(at + (dx < 0 ? 1 : -1))
  })
  area.addEventListener('pointercancel', () => { start = null })

  // Platform: the frame and the store line follow the choice.
  const store = document.querySelector('[data-store]')
  const STORES = { ios: 'Lista para App Store', android: 'Lista para Google Play', both: 'Lista para App Store y Google Play' }
  document.querySelectorAll('input[name="platform"]').forEach((input) => {
    input.addEventListener('change', () => {
      proto.dataset.platform = input.value
      store.textContent = STORES[input.value]
    })
  })

  // The process path fills as the section scrolls by.
  const steps = document.querySelector('[data-steps]')
  const items = steps ? [...steps.children] : []
  const fill = () => {
    if (!steps) return
    const r = steps.getBoundingClientRect()
    const vh = window.innerHeight
    const p = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.3)))
    steps.style.setProperty('--progress', p.toFixed(3))
    items.forEach((s, i) => s.classList.toggle('is-lit', p >= i / Math.max(1, items.length - 1) - 0.02))
  }
  let ticking = false
  window.addEventListener('scroll', () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => { fill(); ticking = false })
  }, { passive: true })
  fill()
})()
