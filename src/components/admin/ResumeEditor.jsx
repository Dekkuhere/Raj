import { useState } from 'react'
import { saveSettings, uploadFile } from '../../lib/api'

export default function ResumeEditor({ settings, onSaved }) {
  const [s, setS] = useState(settings)
  const [msg, setMsg] = useState('')
  const set = (k, v) => setS(x => ({ ...x, [k]: v }))

  const upload = async (file, key, path) => {
    if (!file) return
    setMsg('Uploading…')
    try { set(key, await uploadFile(file, path)); setMsg('Uploaded — now press Save') }
    catch (e) { setMsg('Error: ' + e.message) }
  }
  const save = async () => {
    const { name, tagline, resume_url, resume_preview_url, resume_filename } = s
    const { error } = await saveSettings({ name, tagline, resume_url, resume_preview_url, resume_filename })
    setMsg(error ? 'Error: ' + error.message : 'Saved ✓'); if (!error) onSaved()
  }

  return (
    <div className="ad-card">
      <div className="ad-grid">
        <label><span>Name</span><input value={s.name || ''} onChange={e => set('name', e.target.value)} /></label>
        <label><span>Tagline</span><input value={s.tagline || ''} onChange={e => set('tagline', e.target.value)} /></label>

        <label className="wide"><span>Resume PDF — upload</span>
          <input type="file" accept="application/pdf" onChange={e => upload(e.target.files[0], 'resume_url', 'resume.pdf')} /></label>
        <label className="wide"><span>…or paste a link (Drive, etc.)</span>
          <input value={s.resume_url || ''} onChange={e => set('resume_url', e.target.value)} /></label>
        <label><span>Download file name</span>
          <input value={s.resume_filename || ''} onChange={e => set('resume_filename', e.target.value)} /></label>

        <label className="wide"><span>Resume preview image (optional — leave empty to embed the PDF instead)</span>
          <input type="file" accept="image/*" onChange={e => upload(e.target.files[0], 'resume_preview_url', 'resume-preview.' + (e.target.files[0]?.name.split('.').pop() || 'jpg'))} /></label>
        <label className="wide"><span>Preview image URL</span>
          <input value={s.resume_preview_url || ''} onChange={e => set('resume_preview_url', e.target.value)} /></label>
      </div>
      <div className="ad-actions"><button className="ad-btn" onClick={save}>Save</button><em>{msg}</em></div>
    </div>
  )
}
