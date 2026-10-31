import { useState } from 'react'

const COMMANDS = [
  { cmd: '/home', hint: 'start page' },
  { cmd: '/work', hint: 'projects' },
  { cmd: '/personal', hint: 'about me' },
  { cmd: '/resume', hint: 'view / download' },
]

export default function CommandBox({ route, navigate }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [active, setActive] = useState(0)
  const [error, setError] = useState('')

  const q = value.trim().toLowerCase().replace(/^\//, '')
  const matches = COMMANDS.filter(c => c.cmd.slice(1).startsWith(q))

  const go = c => { navigate(c.slice(1)); setValue(''); setError(''); setActive(0); setOpen(false); document.activeElement?.blur() }
  const submit = e => {
    e.preventDefault()
    if (!value.trim()) return setOpen(true)
    if (matches.length) go(matches[Math.min(active, matches.length - 1)].cmd)
    else setError('command not found: ' + value.trim().replace(/[<>&]/g, ''))
  }
  const onKey = e => {
    const n = Math.max(matches.length, 1)
    if (e.key === 'Escape') { setOpen(false); e.target.blur() }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((active + 1) % n) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((active - 1 + n) % n) }
  }

  return (
    <div className={'cmd' + (open ? ' open' : '')} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false) }}>
      <form className="cmd-field" autoComplete="off" onSubmit={submit}>
        <span className="cmd-prompt" aria-hidden="true">&gt;</span>
        <input placeholder="cmd" aria-label="Type a command to navigate" autoCapitalize="none" autoCorrect="off" spellCheck="false" enterKeyHint="go"
          value={value} onFocus={() => setOpen(true)} onKeyDown={onKey}
          onChange={e => { setValue(e.target.value); setError(''); setActive(0) }} />
      </form>
      <div className={'cmd-list' + (open ? ' open' : '')} role="listbox" aria-label="Commands" onPointerDown={e => e.preventDefault()}>
        {error && <p className="cmd-err">{error}</p>}
        {matches.map((c, i) => (
          <button key={c.cmd} type="button" role="option" aria-selected={i === active}
            className={'cmd-item' + (i === active ? ' is-active' : '') + (route === c.cmd.slice(1) ? ' here' : '')}
            onClick={() => go(c.cmd)}>
            <span className="cmd-name">{c.cmd}</span><span className="cmd-hint">{c.hint}</span>
          </button>
        ))}
        {!matches.length && !error && <p className="cmd-err">no matching command</p>}
      </div>
    </div>
  )
}
