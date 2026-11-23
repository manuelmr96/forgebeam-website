// Software a la medida: the 12 week build. The rest lives in /landing/landing.js.
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // The 12 week build: the slider picks a week, the week maps to a phase, the phase drives the mock.
  const PHASES = [
    { from: 1, name: 'Consultoría' },
    { from: 3, name: 'Diseño' },
    { from: 5, name: 'Desarrollo' },
    { from: 9, name: 'Pruebas' },
    { from: 11, name: 'En producción' },
  ]
  const stage = document.querySelector('[data-stage]')
  const slider = document.querySelector('[data-week]')
  const label = document.querySelector('[data-phase-label]')
  const phaseOf = (week) => PHASES.reduce((idx, p, i) => (week >= p.from ? i : idx), 0)
  const show = (week) => {
    const i = phaseOf(week)
    const text = `Semana ${week}: ${PHASES[i].name}`
    stage.dataset.step = String(i)
    label.textContent = text
    slider.value = String(week)
    slider.setAttribute('aria-valuetext', text)
  }
  let autoplay = null
  const stopAutoplay = () => { if (autoplay) { clearInterval(autoplay); autoplay = null } }
  slider.addEventListener('input', () => { stopAutoplay(); show(Number(slider.value)) })
  slider.addEventListener('pointerdown', stopAutoplay)
  if (reduce) {
    show(12)
  } else {
    show(1)
    // Plays the 12 weeks once when the build is on screen; the visitor can take over at any time.
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return
      io.disconnect()
      let week = 1
      setTimeout(() => {
        autoplay = setInterval(() => {
          week += 1
          show(week)
          if (week >= 12) stopAutoplay()
        }, 650)
      }, 900)
    }, { threshold: 0.4 })
    io.observe(stage)
  }

})()
