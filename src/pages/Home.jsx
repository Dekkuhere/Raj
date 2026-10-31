import A from '../components/Link'
import ProjectAccordion from '../components/ProjectAccordion'
import { QUOTES } from '../data/quotes'

const CHEV = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 864e5)

export default function Home({ projects, navigate }) {
  return (
    <>
      <h2>Work</h2>
      <div className="projects">{projects.slice(0, 3).map(p => <ProjectAccordion key={p.id} p={p} />)}</div>

      <h2 className="gap">About me</h2>
      <p>I’m Raj, a third year student working towards becoming a MERN developer. I like turning ideas into small, working apps and learning something new with every project I build.</p>
      <div className="opts">
        <A className="opt" to="personal" open="more" navigate={navigate}>More of me{CHEV}</A>
        <A className="opt" to="personal" open="interests" navigate={navigate}>Interests{CHEV}</A>
      </div>

      <h3 className="ilabel gap">Quote of the day</h3>
      <div className="qbox"><p>“{QUOTES[day % QUOTES.length]}”</p></div>

      <div className="opts cta">
        <A className="opt big" to="contribute" navigate={navigate}>
          Contribute<svg className="arrow" viewBox="0 0 60 16" aria-hidden="true"><path d="M2 8h54M49 2l7 6-7 6" /></svg>
        </A>
      </div>
    </>
  )
}
