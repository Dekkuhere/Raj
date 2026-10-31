import { useState } from 'react'

export default function ProjectAccordion({ p }) {
  const [open, setOpen] = useState(false)
  const stop = e => { if (e.currentTarget.getAttribute('href') === '#') e.preventDefault() }
  return (
    <article className={'proj' + (open ? ' open' : '')}>
      <button className="proj-head" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="l1"><span className="pname">{p.name}</span><svg className="go" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg></span>
        <span className="rt">{p.year}</span><span className="role">{p.role}</span><span className="rt">{p.location}</span>
      </button>
      <div className="more"><div className="more-in"><div className="more-body">
        <p>{p.summary}</p><p className="stack">{p.stack}</p>
        <p className="links">
          {p.live && <a href={p.live} onClick={stop} target={p.live.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">Live</a>}
          {p.code && <a href={p.code} onClick={stop} target={p.code.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">Code</a>}
        </p>
      </div></div></div>
    </article>
  )
}
