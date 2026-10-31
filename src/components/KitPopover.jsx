import { useEffect, useRef, useState } from 'react'
import { ICONS } from '../data/icons'
import { KIT } from '../data/defaults'

const CHEV = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>

export default function KitPopover({ label }) {
  const [open, setOpen] = useState(false)
  const pinned = useRef(false)
  const timer = useRef()
  const wrap = useRef()
  const canHover = typeof matchMedia !== 'undefined' && matchMedia('(hover:hover)').matches

  const close = () => { pinned.current = false; clearTimeout(timer.current); setOpen(false) }
  const show = () => { clearTimeout(timer.current); setOpen(true); window.dispatchEvent(new CustomEvent('kit-open', { detail: wrap.current })) }
  const later = () => { clearTimeout(timer.current); timer.current = setTimeout(() => { if (!pinned.current) setOpen(false) }, 220) }

  useEffect(() => {
    const onOther = e => { if (e.detail !== wrap.current) close() }
    const onDoc = e => { if (wrap.current && !wrap.current.contains(e.target)) close() }
    const onKey = e => { if (e.key === 'Escape') close() }
    addEventListener('kit-open', onOther); document.addEventListener('click', onDoc); document.addEventListener('keydown', onKey)
    return () => { removeEventListener('kit-open', onOther); document.removeEventListener('click', onDoc); document.removeEventListener('keydown', onKey) }
  }, [])

  const hover = canHover ? { onMouseEnter: show, onMouseLeave: later } : {}

  return (
    <span ref={wrap} style={{ display: 'contents' }}>
      <button className="opt kit" type="button" aria-expanded={open} {...hover}
        onClick={() => { clearTimeout(timer.current); if (open && pinned.current) close(); else { pinned.current = true; show() } }}>
        {label}{CHEV}
      </button>
      <div className={'kitpanel' + (open ? ' open' : '')} role="region" aria-label={label} {...hover}>
        {KIT.map(g => (
          <div key={g.title}>
            <h3 className="ilabel">{g.title}</h3>
            <div className="ico">
              {g.names.map(n => <span key={n} className="ic" role="img" aria-label={n} dangerouslySetInnerHTML={{ __html: ICONS[n] || '' }} />)}
            </div>
          </div>
        ))}
      </div>
    </span>
  )
}
