// ForgeBeam Solutions website: WhatsApp links, the live chat demo, scroll beam and counters.
(() => {
  // One place for the WhatsApp number every "Escribirle a Marcelino" link opens.
  const WHATSAPP_NUMBER = '50373238367'
  const WHATSAPP_TEXT = 'Hola Marcelino, quiero automatizar mi negocio.'
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_TEXT)}`
  document.querySelectorAll('[data-wa]').forEach((a) => {
    a.href = waUrl
    a.target = '_blank'
    a.rel = 'noopener'
  })
  const year = document.querySelector('[data-year]')
  if (year) year.textContent = String(new Date().getFullYear())

  // Sticky nav shadow and the section link that is in view.
  const nav = document.querySelector('[data-nav]')
  const onScroll = () => nav && nav.classList.toggle('is-scrolled', window.scrollY > 8)
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  const links = [...document.querySelectorAll('.nav__links a')]
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return
        links.forEach((l) => l.setAttribute('aria-current', String(l.getAttribute('href') === `#${e.target.id}`)))
      })
    },
    { rootMargin: '-45% 0px -50% 0px' },
  )
  links.forEach((l) => {
    const target = document.querySelector(l.getAttribute('href'))
    if (target) spy.observe(target)
  })

  // Live chat demo: three businesses, typed out one message at a time.
  const scenes = {
    restaurante: {
      name: 'Pupusería La Esquina',
      avatar: 'P',
      messages: [
        ['in', 'Hola, ¿tienen pupusas de loroco con queso?'],
        ['out', '¡Hola! Sí, de maíz o de arroz, a $0.75 cada una. ¿Para recoger hoy?'],
        ['in', '6 de loroco de maíz para las 7:30'],
        ['out', 'Su pedido:\n6 pupusas de loroco con queso, maíz\nRecoge: hoy 7:30 p. m.\nTotal: $4.50\n\n¿Lo confirmo? Responda SÍ o NO.'],
        ['in', 'SÍ'],
        ['out', 'Pedido confirmado. El equipo ya lo está preparando.'],
      ],
    },
    clinica: {
      name: 'Clínica Dental Sonrisa',
      avatar: 'C',
      messages: [
        ['in', 'Buenas, quiero una limpieza dental esta semana'],
        ['out', 'Con gusto. Tengo jueves 10:00 a. m., jueves 3:30 p. m. o viernes 9:00 a. m. ¿Cuál le queda mejor?'],
        ['in', 'Jueves 3:30'],
        ['out', 'Su cita:\nLimpieza dental\nJueves 3:30 p. m.\n\n¿La agendo? Responda SÍ o NO.'],
        ['in', 'Sí por favor'],
        ['out', 'Listo, quedó agendada. Le recuerdo el miércoles por la tarde.'],
      ],
    },
    distribuidora: {
      name: 'Distribuidora El Cedro',
      avatar: 'D',
      messages: [
        ['in', 'Necesito precio de 40 cajas de agua de 600 ml para el lunes'],
        ['out', 'Con gusto. 40 cajas de agua 600 ml a $5.25 la caja: $210.00, con entrega el lunes en San Salvador.'],
        ['in', '¿Me lo manda en PDF?'],
        ['out', 'Aquí está su cotización.\nCOT-0142.pdf\n\nVálida por 15 días. ¿Desea confirmar el pedido?'],
      ],
    },
  }

  const log = document.querySelector('[data-chat-log]')
  const nameEl = document.querySelector('[data-chat-name]')
  const avatarEl = document.querySelector('[data-avatar]')
  const statusEl = document.querySelector('[data-chat-status]')
  const tabs = [...document.querySelectorAll('.chat__tab')]
  let run = 0
  let auto = true

  const wait = (ms) => new Promise((r) => setTimeout(r, ms))
  const clock = (i) => {
    const d = new Date()
    d.setMinutes(d.getMinutes() - 6 + i)
    return d.toLocaleTimeString('es-SV', { hour: 'numeric', minute: '2-digit' })
  }
  const bubble = (dir, text, i) => {
    const li = document.createElement('li')
    // The visitor reads it as the customer: their messages on the right, the business on the left.
    li.className = `msg msg--${dir === 'in' ? 'out' : 'in'}`
    li.textContent = text
    const t = document.createElement('time')
    t.textContent = clock(i)
    li.append(t)
    return li
  }

  async function play(key) {
    const id = ++run
    const scene = scenes[key]
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.scene === key)))
    nameEl.textContent = scene.name
    avatarEl.textContent = scene.avatar
    log.replaceChildren()
    if (reduce) {
      scene.messages.forEach(([dir, text], i) => log.append(bubble(dir, text, i)))
      return
    }
    for (const [i, [dir, text]] of scene.messages.entries()) {
      if (id !== run) return
      if (dir === 'out') {
        statusEl.textContent = 'escribiendo…'
        const typing = document.createElement('li')
        typing.className = 'msg msg--in msg--typing'
        typing.setAttribute('aria-hidden', 'true')
        typing.innerHTML = '<span></span><span></span><span></span>'
        log.append(typing)
        await wait(Math.min(1600, 500 + text.length * 12))
        if (id !== run) return
        typing.remove()
        statusEl.textContent = 'en línea'
      } else {
        await wait(900)
        if (id !== run) return
      }
      log.append(bubble(dir, text, i))
      while (log.children.length > 7) log.firstElementChild.remove()
    }
    await wait(4200)
    if (id !== run || !auto) return
    const keys = Object.keys(scenes)
    play(keys[(keys.indexOf(key) + 1) % keys.length])
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      auto = false
      play(tab.dataset.scene)
    })
  })
  // Start the demo when it is on screen; pause it while the tab is hidden.
  const chat = document.querySelector('.chat')
  let started = false
  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !started) {
      started = true
      play('restaurante')
    }
  }).observe(chat)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) run++
    else if (started) play(tabs.find((t) => t.getAttribute('aria-selected') === 'true').dataset.scene)
  })

  // The beam across the pilot steps fills as the section scrolls by.
  const steps = document.querySelector('[data-steps]')
  const stepItems = steps ? [...steps.children] : []
  const fill = () => {
    if (!steps) return
    const r = steps.getBoundingClientRect()
    const vh = window.innerHeight
    const p = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)))
    steps.style.setProperty('--progress', p.toFixed(3))
    stepItems.forEach((s, i) => s.classList.toggle('is-lit', p >= i / Math.max(1, stepItems.length - 1) - 0.02))
  }
  let ticking = false
  window.addEventListener('scroll', () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => { fill(); ticking = false })
  }, { passive: true })
  fill()

  // Numbers count up once when they come into view.
  const counters = document.querySelectorAll('[data-count]')
  if (!reduce) {
    counters.forEach((el) => { el.textContent = '0' })
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return
        io.unobserve(e.target)
        const end = Number(e.target.dataset.count)
        const t0 = performance.now()
        const dur = 1400
        const tick = (now) => {
          const k = Math.min(1, (now - t0) / dur)
          e.target.textContent = String(Math.round(end * (1 - Math.pow(1 - k, 4))))
          if (k < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      })
    }, { threshold: 0.6 })
    counters.forEach((el) => io.observe(el))
  }
})()
