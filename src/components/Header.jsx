import A from './Link'
import KitPopover from './KitPopover'
import SocialLinks from './SocialLinks'
import CommandBox from './CommandBox'

const NAV = ['home', 'work', 'personal', 'resume']

function toggleTheme() {
  const r = document.documentElement
  r.setAttribute('data-theme', r.getAttribute('data-theme') === 'dark' ? 'light' : 'dark')
}

export default function Header({ route, navigate, settings, links }) {
  return (
    <>
      <div className="banner" role="img" aria-label="Sunset sky behind tree silhouettes" />
      <div className="bar">
        <A to="home" navigate={navigate} className="pfp" aria-label={settings.name + ', home'} />
        <nav aria-label="Main">
          {NAV.map(n => <A key={n} to={n} navigate={navigate} aria-current={route === n ? 'page' : undefined}>{n}</A>)}
          <CommandBox route={route} navigate={navigate} />
          <button className="theme" onClick={toggleTheme} aria-label="Switch between dark and light theme">
            <svg className="sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" /></svg>
            <svg className="moon" viewBox="0 0 24 24"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z" /></svg>
          </button>
        </nav>
      </div>
      <header className="id">
        <h1>{settings.name}</h1>
        <div className="lrow">
          <p className="line">{settings.tagline}</p>
          <KitPopover label="Mykit" />
        </div>
        <SocialLinks links={links} />
      </header>
    </>
  )
}
