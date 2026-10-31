import { useCallback, useEffect, useState } from 'react'
import { fetchSiteData } from '../lib/api'
import { DEFAULT_SETTINGS, DEFAULT_LINKS, DEFAULT_PROJECTS } from '../data/defaults'

export function useSiteData() {
  const [data, setData] = useState({ settings: DEFAULT_SETTINGS, links: DEFAULT_LINKS, projects: DEFAULT_PROJECTS, live: false })
  const refresh = useCallback(() => fetchSiteData().then(setData), [])
  useEffect(() => { refresh() }, [refresh])
  return { ...data, refresh }
}
