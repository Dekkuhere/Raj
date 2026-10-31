import { useCallback, useEffect, useState } from 'react'

export const ROUTES = ['home', 'work', 'personal', 'resume', 'contribute', 'admin']
const read = () => { const id = (location.hash || '#home').slice(1); return ROUTES.includes(id) ? id : 'home' }

export function useRoute() {
  const [state, setState] = useState({ route: read(), open: undefined })

  useEffect(() => {
    const onHash = () => setState(s => (s.route === read() ? s : { route: read(), open: undefined }))
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])

  const navigate = useCallback((route, open) => {
    if (!ROUTES.includes(route)) route = 'home'
    if (location.hash !== '#' + route) location.hash = route
    setState({ route, open })
  }, [])

  return { ...state, navigate }
}
