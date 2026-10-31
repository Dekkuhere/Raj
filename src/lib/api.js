import { supabase, BUCKET } from './supabase'
import { DEFAULT_SETTINGS, DEFAULT_LINKS, DEFAULT_PROJECTS } from '../data/defaults'

const bySort = (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)

export async function fetchSiteData() {
  if (!supabase) return { settings: DEFAULT_SETTINGS, links: DEFAULT_LINKS, projects: DEFAULT_PROJECTS, live: false }
  try {
    const [s, l, p] = await Promise.all([
      supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('social_links').select('*').order('sort_order'),
      supabase.from('projects').select('*').order('sort_order'),
    ])
    if (s.error || l.error || p.error) throw new Error('fetch failed')
    return {
      settings: { ...DEFAULT_SETTINGS, ...(s.data || {}) },
      links: (l.data || []).sort(bySort),
      projects: (p.data || []).sort(bySort),
      live: true,
    }
  } catch {
    return { settings: DEFAULT_SETTINGS, links: DEFAULT_LINKS, projects: DEFAULT_PROJECTS, live: false }
  }
}

/* ---------- admin writes ---------- */
export const saveSettings = patch => supabase.from('site_settings').update(patch).eq('id', 1)
export const saveRow = (table, row) => supabase.from(table).upsert(row).select().single()
export const deleteRow = (table, id) => supabase.from(table).delete().eq('id', id)

export async function uploadFile(file, path) {
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw error
  // ?v= busts the browser cache when you replace a file with the same name
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl + '?v=' + Date.now()
}

/* ---------- bug sweeper stats (works locally if Supabase isn't set up) ---------- */
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v) } catch { return d } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} },
}
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 12))
export const VID = (() => { let v = LS.get('rs_vid', null); if (!v) { v = uuid(); LS.set('rs_vid', v) } return v })()

export const statsLive = !!supabase
export const registerVisit = () => (supabase ? supabase.rpc('register_visit', { p_vid: VID }) : Promise.resolve())

export async function getStats() {
  if (supabase) {
    const { data, error } = await supabase.rpc('get_stats', { p_vid: VID })
    if (error) throw error
    return data
  }
  const l = LS.get('bs:local', {})
  return { visitors: 1, contributions: l.won ? 1 : 0, likes: l.vote === 1 ? 1 : 0, dislikes: l.vote === -1 ? 1 : 0, myVote: l.vote || 0, won: !!l.won }
}
export async function castVote(vote) {
  if (supabase) return supabase.rpc('cast_vote', { p_vid: VID, p_vote: vote })
  const l = LS.get('bs:local', {}); l.vote = vote; LS.set('bs:local', l)
}
export async function recordWin() {
  if (supabase) return supabase.rpc('record_win', { p_vid: VID })
  const l = LS.get('bs:local', {}); l.won = true; LS.set('bs:local', l)
}
