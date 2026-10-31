import { supabase } from './supabase'

/* ---------- bug sweeper stats ---------- */
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v) } catch { return d } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} },
}
let statsCache = LS.get('bs:stats-cache', null)

export const getCachedStats = () => statsCache

const cacheStats = stats => {
  statsCache = stats
  LS.set('bs:stats-cache', stats)
  return stats
}

const uuid = () => globalThis.crypto?.randomUUID?.()
  || Date.now().toString(36) + Math.random().toString(36).slice(2, 12)
export const VID = (() => {
  let v = LS.get('rs_vid', null)
  if (!v) { v = uuid(); LS.set('rs_vid', v) }
  return v
})()

export const statsLive = !!supabase
export const registerVisit = () => (supabase ? supabase.rpc('register_visit', { p_vid: VID }).then(({ error }) => {
  if (error) throw error
}) : Promise.resolve())

export async function getStats() {
  if (supabase) {
    const { data, error } = await supabase.rpc('get_stats', { p_vid: VID })
    if (error) throw error
    return cacheStats(data)
  }
  const l = LS.get('bs:local', {})
  return cacheStats({ visitors: 1, contributions: l.won ? 1 : 0, likes: l.vote === 1 ? 1 : 0, dislikes: l.vote === -1 ? 1 : 0, myVote: l.vote || 0, won: !!l.won })
}
export async function castVote(vote) {
  if (supabase) {
    const { error } = await supabase.rpc('cast_vote', { p_vid: VID, p_vote: vote })
    if (error) throw error
    return
  }
  const l = LS.get('bs:local', {}); l.vote = vote; LS.set('bs:local', l)
}
export async function recordWin() {
  if (supabase) {
    const { error } = await supabase.rpc('record_win', { p_vid: VID })
    if (error) throw error
    return
  }
  const l = LS.get('bs:local', {}); l.won = true; LS.set('bs:local', l)
}
