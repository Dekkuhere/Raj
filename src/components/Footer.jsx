import SocialLinks from './SocialLinks'

export default function Footer({ name, links }) {
  return (
    <footer className="foot">
      <div className="foot-in">
        <p className="rights">© {new Date().getFullYear()} {name}. All rights reserved.</p>
        <div className="cn"><div><SocialLinks links={links} /></div></div>
      </div>
    </footer>
  )
}
