import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import A from '../components/Link'
import { castVote, getStats, recordWin, statsLive } from '../lib/api'

const N = 8, TOTAL = N * N, BUGS = 10, SAFE = TOTAL - BUGS
const FLAG = <svg className="bs-flag" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" /><path d="M6 4h12l-3 4.5L18 13H6z" fill="#ff5a4e" /></svg>
const fmt = n => Number(n || 0).toLocaleString()

const nbrs = i => {
  const r = i >> 3, c = i & 7, out = []
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    if (!dr && !dc) continue
    const rr = r + dr, cc = c + dc
    if (rr >= 0 && rr < N && cc >= 0 && cc < N) out.push(rr * N + cc)
  }
  return out
}
const emptyBoard = () => Array.from({ length: TOTAL }, () => ({ bug: false, open: false, flag: false, n: 0 }))

export default function Contribute({ navigate }) {
  const g = useRef({ board: emptyBoard(), phase: 'idle', opened: 0, flags: 0, boom: -1 })
  const [, redraw] = useReducer(x => x + 1, 0)
  const [stats, setStats] = useState({ visitors: 0, contributions: 0, likes: 0, dislikes: 0, myVote: 0, won: false })
  const [ok, setOk] = useState(true)
  const press = useRef(null)

  const load = useCallback(() => getStats().then(s => { setStats(s); setOk(true) }).catch(() => setOk(false)), [])
  useEffect(() => {
    load()
    const t = setInterval(() => { if (!document.hidden) load() }, 20000)
    return () => clearInterval(t)
  }, [load])

  const vote = v => {
    const next = stats.myVote === v ? 0 : v
    setStats(s => ({ ...s, myVote: next,
      likes: s.likes - (s.myVote === 1) + (next === 1), dislikes: s.dislikes - (s.myVote === -1) + (next === -1) }))
    Promise.resolve(castVote(next)).then(load).catch(() => setOk(false))
  }

  /* ---- game ---- */
  const reset = () => { g.current = { board: emptyBoard(), phase: 'idle', opened: 0, flags: 0, boom: -1 }; redraw() }
  const seed = safe => {
    const { board } = g.current
    const pool = [...Array(TOTAL).keys()].filter(i => i !== safe)
    for (let k = pool.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [pool[k], pool[j]] = [pool[j], pool[k]] }
    pool.slice(0, BUGS).forEach(i => { board[i].bug = true })
    board.forEach((_, i) => { board[i].n = nbrs(i).filter(j => board[j].bug).length })
  }
  const openCell = i => {
    const s = g.current, b = s.board[i]
    if (s.phase === 'won' || s.phase === 'lost' || b.open || b.flag) return
    if (s.phase === 'idle') { seed(i); s.phase = 'playing' }
    if (b.bug) {
      s.phase = 'lost'; s.boom = i
      s.board.forEach(c => { if (c.bug) { c.open = true; c.flag = false } })
      navigator.vibrate?.([40, 40, 40])
    } else {
      const stack = [i]
      while (stack.length) {
        const k = stack.pop(), c = s.board[k]
        if (c.open || c.flag || c.bug) continue
        c.open = true; s.opened++
        if (c.n === 0) stack.push(...nbrs(k))
      }
      if (s.opened === SAFE) {
        s.phase = 'won'
        s.board.forEach(c => { if (c.bug) c.flag = true })
        s.flags = BUGS
        if (!stats.won) {
          setStats(x => ({ ...x, won: true, contributions: x.contributions + 1 }))
          Promise.resolve(recordWin()).then(load).catch(() => {})
        }
      }
    }
    redraw()
  }
  const toggleFlag = i => {
    const s = g.current, b = s.board[i]
    if (s.phase === 'won' || s.phase === 'lost' || b.open) return
    b.flag = !b.flag; s.flags += b.flag ? 1 : -1
    navigator.vibrate?.(12); redraw()
  }

  // quick tap opens, long-press / right-click flags
  const cellOf = e => e.target.closest('.bs-cell')
  const onDown = e => {
    const c = cellOf(e); if (!c) return
    const i = +c.dataset.i
    if (e.pointerType === 'mouse' && e.button === 2) return toggleFlag(i)
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const p = { i, long: false }
    p.t = setTimeout(() => { p.long = true; toggleFlag(i) }, 420)
    press.current = p
  }
  const onUp = e => {
    const p = press.current; if (!p) return
    clearTimeout(p.t); press.current = null
    const c = cellOf(e)
    if (!p.long && c && +c.dataset.i === p.i) openCell(p.i)
  }
  const cancel = () => { if (press.current) { clearTimeout(press.current.t); press.current = null } }

  const { board, phase, opened, flags, boom } = g.current
  const v = ok ? fmt : () => '–'

  return (
    <div id="contribute" role="main" aria-label="Bug Sweeper">
      <div className="bs-frame">
        <div className="bs-top">
          <A className="bs-back" to="home" navigate={navigate} aria-label="Back to portfolio">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
          </A>
          <div className="bs-stats" aria-live="polite">
            <span><b>{v(stats.contributions)}</b>contributions</span>
            <span><b>{v(stats.visitors)}</b>visitors</span>
          </div>
          <A className="pfp" to="home" navigate={navigate} aria-label="Home" />
        </div>

        <div className="bs-play">
          <div className="bs-grid" role="group" aria-label="Bug Sweeper board: 8 by 8"
            onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={cancel} onPointerLeave={cancel}
            onContextMenu={e => e.preventDefault()}
            onClick={e => { if (e.detail === 0) { const c = cellOf(e); if (c) openCell(+c.dataset.i) } }}
            onKeyDown={e => { if (e.key.toLowerCase() === 'f') { const c = cellOf(e); if (c) toggleFlag(+c.dataset.i) } }}>
            {board.map((b, k) => {
              let cls = 'bs-cell', inner = null, label = `Row ${(k >> 3) + 1}, column ${(k & 7) + 1}: `
              if (b.open && b.bug) { cls += ' open bug' + (k === boom ? ' boom' : ''); inner = <img src="/assets/bug.png" alt="" draggable="false" />; label += 'bug' }
              else if (b.open) { cls += ' open file'; inner = <img src="/assets/file.png" alt="" draggable="false" />; label += 'file' }
              else if (b.flag) { cls += ' flag'; inner = FLAG; label += 'flagged' }
              else label += 'hidden'
              return <button key={k} type="button" className={cls} data-i={k} aria-label={label}>{inner}</button>
            })}
          </div>

          <div className="bs-actions">
            <div className="bs-vote">
              <button type="button" aria-pressed={stats.myVote === 1} aria-label="Like" onClick={() => vote(1)}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" /><path className="cut" d="M7 10v12" /></svg>
                <span>{v(stats.likes)}</span>
              </button>
              <button type="button" aria-pressed={stats.myVote === -1} aria-label="Dislike" onClick={() => vote(-1)}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" /><path className="cut" d="M17 14V2" /></svg>
                <span>{v(stats.dislikes)}</span>
              </button>
            </div>
            <div className="bs-tools">
              <button type="button" aria-label="New game" title="New game" onClick={reset}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 4v7h-7" /></svg>
              </button>
            </div>
          </div>

          <div className="bs-status" aria-live="polite">
            {phase === 'won' ? (
              <div className="bs-res win"><h2>Production saved</h2><p>Every safe file recovered and not a single bug shipped. You’re on the contributors list.</p><button className="opt" onClick={reset}>Play again</button></div>
            ) : phase === 'lost' ? (
              <div className="bs-res lose"><h2>Bug reported</h2><p>A bug crashed the build. Squash it and try again.</p><button className="opt" onClick={reset}>Play again</button></div>
            ) : (
              <p><b>{BUGS - flags}</b> bugs left &middot; <b>{SAFE - opened}</b> files to save</p>
            )}
          </div>
          {(!statsLive || !ok) && (
            <p className="bs-note">{!statsLive ? 'Preview mode: these numbers are saved on this device only. Connect Supabase to count everyone.' : 'Couldn’t reach the server just now.'}</p>
          )}
        </div>
      </div>
    </div>
  )
}
