// In-app hash link: <A to="work"> or <A to="personal" open="interests">
export default function A({ to, open, navigate, children, ...rest }) {
  return (
    <a href={'#' + to} {...rest} onClick={e => { e.preventDefault(); navigate(to, open) }}>
      {children}
    </a>
  )
}
