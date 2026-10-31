import { useEffect, useState } from 'react'
import { deleteRow, saveRow } from '../../lib/api'

// Generic editor for a table: edit, add, delete and reorder rows.
// fields: [{ key, label, type: 'text'|'textarea'|'select'|'lines', options?, wide? }]
export default function ListEditor({ table, items, fields, blank, titleKey, onSaved, addLabel }) {
  const [rows, setRows] = useState(items)
  const [msg, setMsg] = useState({})
  useEffect(() => setRows(items), [items])

  const say = (id, text) => { setMsg(m => ({ ...m, [id]: text })); setTimeout(() => setMsg(m => ({ ...m, [id]: '' })), 2500) }
  const edit = (id, key, val) => setRows(rs => rs.map(r => (r.id === id ? { ...r, [key]: val } : r)))
  const clean = r => { const { _new, ...rest } = r; return rest }

  const save = async r => {
    const { error } = await saveRow(table, clean(r))
    say(r.id, error ? 'Error: ' + error.message : 'Saved ✓')
    if (!error) { setRows(rs => rs.map(x => (x.id === r.id ? { ...x, _new: false } : x))); onSaved() }
  }
  const remove = async r => {
    if (!confirm('Delete "' + (r[titleKey] || 'this item') + '"?')) return
    if (!r._new) { const { error } = await deleteRow(table, r.id); if (error) return say(r.id, 'Error: ' + error.message) }
    setRows(rs => rs.filter(x => x.id !== r.id)); onSaved()
  }
  const move = async (i, dir) => {
    const a = rows[i], b = rows[i + dir]
    if (!a || !b || a._new || b._new) return
    const next = rows.slice(); next[i] = { ...b, sort_order: a.sort_order }; next[i + dir] = { ...a, sort_order: b.sort_order }
    // equal sort_orders would make the swap a no-op, so renumber everything
    const numbered = next.map((r, k) => ({ ...r, sort_order: k + 1 }))
    setRows(numbered)
    await Promise.all(numbered.filter(r => !r._new).map(r => saveRow(table, clean(r))))
    onSaved()
  }
  const add = () => setRows(rs => [...rs, { ...blank, id: crypto.randomUUID(), sort_order: rs.reduce((m, r) => Math.max(m, r.sort_order || 0), 0) + 1, _new: true }])

  return (
    <div className="ad-list">
      {rows.map((r, i) => (
        <div className="ad-card" key={r.id}>
          <div className="ad-card-head">
            <strong>{r[titleKey] || 'Untitled'}{r._new && ' (not saved yet)'}</strong>
            <span>
              <button className="ad-btn ghost" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
              <button className="ad-btn ghost" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="Move down">↓</button>
            </span>
          </div>
          <div className="ad-grid">
            {fields.map(f => (
              <label key={f.key} className={f.wide ? 'wide' : ''}>
                <span>{f.label}</span>
                {f.type === 'textarea' ? (
                  <textarea rows={3} value={r[f.key] || ''} onChange={e => edit(r.id, f.key, e.target.value)} />
                ) : f.type === 'lines' ? (
                  <textarea rows={4} placeholder="One point per line" value={(r[f.key] || []).join('\n')}
                    onChange={e => edit(r.id, f.key, e.target.value.split('\n'))} />
                ) : f.type === 'select' ? (
                  <select value={r[f.key] || ''} onChange={e => edit(r.id, f.key, e.target.value)}>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input value={r[f.key] || ''} onChange={e => edit(r.id, f.key, e.target.value)} />
                )}
              </label>
            ))}
          </div>
          <div className="ad-actions">
            <button className="ad-btn" onClick={() => save({ ...r, bullets: r.bullets?.map(b => b.trim()).filter(Boolean) ?? undefined })}>Save</button>
            <button className="ad-btn danger" onClick={() => remove(r)}>Delete</button>
            <em>{msg[r.id]}</em>
          </div>
        </div>
      ))}
      <button className="ad-btn big" onClick={add}>+ {addLabel}</button>
    </div>
  )
}
