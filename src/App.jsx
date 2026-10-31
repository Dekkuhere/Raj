import { useEffect, useState } from 'react'
import { useRoute } from './hooks/useRoute'
import { DEFAULT_SETTINGS, DEFAULT_LINKS, DEFAULT_PROJECTS } from './data/defaults'
import { registerVisit } from './lib/api'
import Intro from './components/Intro'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Work from './pages/Work'
import Personal from './pages/Personal'
import Resume from './pages/Resume'
import Contribute from './pages/Contribute'

const reduceMotion = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

export default function App() {
  const { route, open, navigate } = useRoute()
  const settings = DEFAULT_SETTINGS
  const links = DEFAULT_LINKS
  const projects = DEFAULT_PROJECTS
  const [phase, setPhase] = useState(reduceMotion ? 'done' : 'intro') // intro → out → done

  useEffect(() => {
    registerVisit().catch(error => console.error('Could not register portfolio visit:', error))
  }, [])
  useEffect(() => {
    if (phase === 'done') return
    const a = setTimeout(() => setPhase('out'), 900)
    const b = setTimeout(() => setPhase('done'), 1600)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [phase])

  // body classes + title + scroll reset (the stylesheet keys off these)
  useEffect(() => {
    document.body.classList.toggle('is-home', route === 'home')
    document.body.classList.toggle('is-contrib', route === 'contribute')
    document.title = settings.name + (['home', 'contribute'].includes(route) ? ' – Portfolio' : ' – ' + route[0].toUpperCase() + route.slice(1))
    if (!(route === 'personal' && open === 'interests')) scrollTo({ top: 0, behavior: 'instant' })
  }, [route, open, settings.name])

  if (route === 'contribute') return <Contribute navigate={navigate} />

  const page = {
    home: <Home projects={projects} navigate={navigate} />,
    work: <Work projects={projects} />,
    personal: <Personal open={open} />,
    resume: <Resume settings={settings} />,
  }[route]

  return (
    <>
      {phase !== 'done' && <Intro name={settings.name} out={phase === 'out'} />}
      <div className={'app' + (phase === 'intro' ? ' hold' : '')}>
        <div className="shell">
          <Header route={route} navigate={navigate} settings={settings} links={links} />
          <main className="page enter">
            {/* key remounts the section so the entrance animation replays on every page change */}
            <section className="on" key={route + (open || '')}>{page}</section>
          </main>
        </div>
        <Footer name={settings.name} links={links} />
      </div>
    </>
  )
}
