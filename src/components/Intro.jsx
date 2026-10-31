export default function Intro({ name, out }) {
  return (
    <div className={'intro' + (out ? ' out' : '')} aria-hidden="true">
      <div className="intro-in"><span className="intro-name">{name.toLowerCase()}</span><span className="intro-line" /></div>
    </div>
  )
}
