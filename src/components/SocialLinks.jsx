import { SOCIAL_ICONS } from '../data/socialIcons'

export default function SocialLinks({ links }) {
  return (
    <ul className="social">
      {links.map(s => {
        const ext = /^https?:/.test(s.href)
        return (
          <li key={s.id}>
            <a
              href={s.href} aria-label={s.label}
              {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              onClick={s.href === '#' ? e => e.preventDefault() : undefined}
              dangerouslySetInnerHTML={{ __html: SOCIAL_ICONS[s.icon] || SOCIAL_ICONS.link }}
            />
          </li>
        )
      })}
    </ul>
  )
}
