// ForgeBeam landing pages, shared: nav, pains checklist, projects rail, lightbox and Calendly.
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Nav shadow once the page scrolls.
  const nav = document.querySelector('[data-nav]')
  const onScroll = () => nav && nav.classList.toggle('is-scrolled', window.scrollY > 8)
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })

  // Pains checklist: the call to action answers what the visitor ticked.
  const checks = [...document.querySelectorAll('[data-checks] input')]
  const count = document.querySelector('[data-count]')
  const cta = document.querySelector('[data-pains-cta]')
  const updateChecks = () => {
    const n = checks.filter((c) => c.checked).length
    if (n === 0) {
      count.textContent = 'Marque las que apliquen.'
      cta.textContent = 'Agendar consultoría'
    } else if (n === 1) {
      count.textContent = 'Se identifica con 1 de 6.'
      cta.textContent = 'Hablemos de eso'
    } else {
      count.textContent = `Se identifica con ${n} de 6.`
      cta.textContent = `Hablemos de esas ${n} cosas`
    }
  }
  if (count && cta) {
    checks.forEach((c) => c.addEventListener('change', updateChecks))
    updateChecks()
  }

  // Projects rail: buttons, drag with the mouse, and button states at the ends.
  const track = document.querySelector('[data-rail-track]')
  if (track) setupRail()
  function setupRail() {
  const prev = document.querySelector('[data-rail-prev]')
  const next = document.querySelector('[data-rail-next]')
  const stepSize = () => (track.firstElementChild ? track.firstElementChild.getBoundingClientRect().width + 20 : 400)
  const updateButtons = () => {
    prev.disabled = track.scrollLeft <= 4
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4
  }
  prev.addEventListener('click', () => track.scrollBy({ left: -stepSize(), behavior: reduce ? 'auto' : 'smooth' }))
  next.addEventListener('click', () => track.scrollBy({ left: stepSize(), behavior: reduce ? 'auto' : 'smooth' }))
  track.addEventListener('scroll', updateButtons, { passive: true })
  window.addEventListener('resize', updateButtons)
  updateButtons()
  let drag = null
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return
    drag = { x: e.clientX, left: track.scrollLeft, moved: false }
  })
  window.addEventListener('pointermove', (e) => {
    if (!drag) return
    const dx = e.clientX - drag.x
    if (Math.abs(dx) > 5) { drag.moved = true; track.classList.add('is-dragging') }
    track.scrollLeft = drag.left - dx
  })
  const endDrag = () => {
    if (!drag) return
    const moved = drag.moved
    drag = null
    track.classList.remove('is-dragging')
    if (moved) track.addEventListener('click', (ev) => ev.preventDefault(), { capture: true, once: true })
  }
  window.addEventListener('pointerup', endDrag)
  window.addEventListener('pointercancel', endDrag)
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next.click() }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click() }
  })

  }

  // Lightbox: a project shot opens large; focus returns to the shot on close.
  const box = document.querySelector('[data-lightbox]')
  const boxImg = document.querySelector('[data-lightbox-img]')
  let opener = null
  document.querySelectorAll('.shot').forEach((shot) => {
    shot.addEventListener('click', (e) => {
      if (e.defaultPrevented) return
      const img = shot.querySelector('img')
      boxImg.src = shot.dataset.full
      boxImg.alt = img.alt
      opener = shot
      box.showModal()
    })
  })
  box.addEventListener('click', (e) => { if (e.target === box) box.close() })
  box.addEventListener('close', () => opener && opener.focus())

  // Calendly loads only when the booking section gets close, so the page opens fast.
  const widget = document.querySelector('[data-calendly]')
  const loadCalendly = () => {
    const inline = document.createElement('div')
    inline.className = 'calendly-inline-widget'
    inline.dataset.url = widget.dataset.calendly
    widget.prepend(inline)
    const s = document.createElement('script')
    s.src = 'https://assets.calendly.com/assets/external/widget.js'
    s.async = true
    s.onload = () => widget.classList.add('is-loaded')
    document.body.append(s)
  }
  const near = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return
    near.disconnect()
    loadCalendly()
  }, { rootMargin: '600px 0px' })
  if (widget) near.observe(widget)

  // A finished booking takes the visitor to the thank-you page with the next steps.
  window.addEventListener('message', (e) => {
    if (e.origin !== 'https://calendly.com' || !e.data || e.data.event !== 'calendly.event_scheduled') return
    setTimeout(() => { window.location.href = '/gracias/' }, 900)
  })
})()
