import { useState } from 'react'

export default function Resume({ settings }) {
  const [shown, setShown] = useState(false)
  const { resume_url: url, resume_preview_url: preview, resume_filename: filename } = settings

  // fetch → blob so the browser actually downloads (the `download` attr is ignored for cross-origin files)
  const download = async e => {
    e.preventDefault()
    try {
      const blob = await (await fetch(url)).blob()
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: filename || 'resume.pdf' })
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => URL.revokeObjectURL(a.href), 4000)
    } catch { window.open(url, '_blank', 'noopener') }
  }

  return (
    <>
      <div className="rhead">
        <h2>Resume</h2>
        <a className="rdl" href={url} onClick={download}>Download
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
        </a>
      </div>
      <div className={'rwin' + (shown ? '' : ' gated')}>
        <div className="rpages" aria-label="Resume preview" aria-hidden={!shown}>
          {preview
            ? <img src={preview} alt={settings.name + '’s resume'} />
            : <iframe src={url + '#toolbar=0'} title="Resume" style={{ width: '100%', height: '70vh', border: 0 }} />}
        </div>
        <div className="rgate">
          <button className="rview" type="button" onClick={() => setShown(true)}>View
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
          </button>
        </div>
      </div>
    </>
  )
}
