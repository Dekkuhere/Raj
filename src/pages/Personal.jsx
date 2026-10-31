import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { GAMES } from '../data/games'

export default function Personal({ open }) {
  const pin = useRef(), interests = useRef()
  const [expanded, setExpanded] = useState(open === 'more')

  // collapse to roughly the first 5 lines, expand to full height
  const fit = () => {
    const el = pin.current; if (!el) return
    if (expanded) { el.style.maxHeight = el.scrollHeight + 'px'; return }
    let left = 5, h = 0
    for (const c of el.children) {
      const cs = getComputedStyle(c)
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.6
      if (!c.offsetHeight) return
      const n = Math.round(c.offsetHeight / lh)
      if (n >= left) { h += left * lh; left = 0; break }
      h += c.offsetHeight + parseFloat(cs.marginBottom || 0)
      left -= n
    }
    el.style.maxHeight = left === 0 ? Math.ceil(h) + 'px' : 'none'
  }
  useLayoutEffect(fit, [expanded])
  useEffect(() => {
    addEventListener('resize', fit)
    document.fonts?.ready.then(fit)
    return () => removeEventListener('resize', fit)
  })
  useEffect(() => {
    if (open === 'interests' && interests.current) scrollTo({ top: Math.max(0, interests.current.offsetTop + 20), behavior: 'instant' })
  }, [open])

  const toggle = () => { if (!String(getSelection() || '')) setExpanded(v => !v) }

  return (
    <>
      <h2>More of me</h2>
      <div className="ptext" onClick={toggle}>
        <div className="pin" ref={pin}>
          <p>Hey, I’m Raj, aka Dekku.</p>
          <p>When I’m away from the keyboard, I’m usually exploring something new. I enjoy sketching (some of them turn out surprisingly professional), playing badminton, learning random things that catch my curiosity, and occasionally cooking whenever I’m on my own. I’m also looking to get back into content creation and be more consistent with sharing my journey and ideas online.</p>
          <p>I also dream of traveling the world someday, exploring different countries, experiencing new cultures, and finding those quiet places that bring a sense of peace and inspiration.</p>
        </div>
        <button className="pmore" type="button" aria-expanded={expanded} aria-label={expanded ? 'Show less' : 'Show more'}
          onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </button>
      </div>

      <h2 className="ih" ref={interests}>Interests</h2>
      <p className="sub">I’ve been a gamer for as long as I can remember. It all started with playing games on my dad’s Nokia phone, and since then I’ve played countless games across different genres. Gaming isn’t just a hobby for me, it’s something that has been part of my journey growing up.</p>
      <h3 className="gh">The games I like</h3>
      <div className="gwin" aria-label="Games I like">
        {GAMES.map(g => <img key={g.title} src={g.src} alt={g.title} title={g.title} loading="lazy" />)}
      </div>

      <h2 className="ih">Photography</h2>
      <p className="sub">I’m not a photographer by profession, but I love collecting moments through pictures.</p>
      <img className="pshot" src="/assets/photo.jpg" alt="A street lamp glowing against the night sky, framed by dark trees" loading="lazy" />

      <h2 className="ih">What I’m Up To Next</h2>
      <p className="sub">Right now, I’m focused on building startup ideas, learning through the process, and turning concepts into real products. I enjoy figuring things out as I go, whether that’s a new technology, a better way to build something, or solving a problem I’ve never faced before. Lately, I’ve become more curious about game development and the creative side of building interactive experiences. I’m also looking forward to exploring more technologies, contributing to meaningful projects, and creating things that can have a positive impact on the world.</p>
    </>
  )
}
