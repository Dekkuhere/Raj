import KitPopover from '../components/KitPopover'

export default function Work({ projects }) {
  return (
    <>
      <h2>Work</h2>
      <p className="sub">Projects I’ve built while learning the MERN stack.</p>
      <div>
        {projects.map(p => (
          <article className="wk" key={p.id}>
            <div className="wk-top">
              <div><h3 className="wk-name">{p.name}</h3><p className="wk-role">{p.role}</p></div>
              <div className="wk-meta"><p>{p.year}</p><p>{p.location}</p></div>
            </div>
            <div className="wk-body">
              <div className="wk-kit wk-row"><h4>What I’ve done</h4><KitPopover label="Kit" /></div>
              <ul className="wk-list">{(p.bullets || []).map((b, i) => <li key={i}>{b}</li>)}</ul>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
