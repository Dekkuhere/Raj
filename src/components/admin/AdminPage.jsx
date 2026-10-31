import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { SOCIAL_ICONS } from '../../data/socialIcons'
import A from '../Link'
import ListEditor from './ListEditor'
import ResumeEditor from './ResumeEditor'

const LINK_FIELDS = [
  { key: 'label', label: 'Label (e.g. LinkedIn)' },
  { key: 'icon', label: 'Icon', type: 'select', options: Object.keys(SOCIAL_ICONS) },
  { key: 'href', label: 'URL (https://… or mailto:you@mail.com)', wide: true },
]
const PROJECT_FIELDS = [
  { key: 'name', label: 'Project name' }, { key: 'year', label: 'Year' },
  { key: 'role', label: 'Your role' }, { key: 'location', label: 'Location' },
  { key: 'summary', label: 'Summary', type: 'textarea', wide: true },
  { key: 'stack', label: 'Stack (e.g. React · Node.js)', wide: true },
  { key: 'live', label: 'Live URL' }, { key: 'code', label: 'Code URL' },
  { key: 'bullets', label: 'What I’ve done', type: 'lines', wide: true },
]

function Login() {
  const [email, setEmail] = useState(''), [pw, setPw] = useState(''), [err, setErr] = useState('')
  const submit = async e => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    if (error) setErr(error.message)
  }
  return (
    <form className="ad-card ad-login" onSubmit={submit}>
      <h2>Admin login</h2>
      <label><span>Email</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
      <label><span>Password</span><input type="password" value={pw} onChange={e => setPw(e.target.value)} required /></label>
      <button className="ad-btn" type="submit">Log in</button>
      {err && <em>{err}</em>}
    </form>
  )
}

export default function AdminPage({ data, navigate }) {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)
  const [tab, setTab] = useState('links')

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const tabs = [['links', 'Connect links'], ['projects', 'Projects'], ['resume', 'Resume & profile']]

  return (
    <div className="admin">
      <div className="ad-top">
        <A to="home" navigate={navigate} className="opt">← Back to site</A>
        {session && <button className="ad-btn ghost" onClick={() => supabase.auth.signOut()}>Log out</button>}
      </div>

      {!supabase ? (
        <div className="ad-card"><h2>Supabase isn’t connected</h2>
          <p>Copy <code>.env.example</code> to <code>.env</code>, fill in your Supabase URL and anon key, then restart <code>npm run dev</code>.</p></div>
      ) : !ready ? null : !session ? <Login /> : (
        <>
          <div className="ad-tabs">
            {tabs.map(([k, l]) => <button key={k} className={'ad-btn' + (tab === k ? '' : ' ghost')} onClick={() => setTab(k)}>{l}</button>)}
          </div>
          {tab === 'links' && <ListEditor table="social_links" items={data.links} fields={LINK_FIELDS} titleKey="label"
            blank={{ label: '', href: '', icon: 'link' }} addLabel="Add link" onSaved={data.refresh} />}
          {tab === 'projects' && <ListEditor table="projects" items={data.projects} fields={PROJECT_FIELDS} titleKey="name"
            blank={{ name: '', year: String(new Date().getFullYear()), role: '', location: '', summary: '', stack: '', live: '#', code: '#', bullets: [] }}
            addLabel="Add project" onSaved={data.refresh} />}
          {tab === 'resume' && <ResumeEditor settings={data.settings} onSaved={data.refresh} />}
        </>
      )}
    </div>
  )
}
