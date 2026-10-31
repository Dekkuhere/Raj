// Used when Supabase isn't configured (or is unreachable) so the site never shows empty.
export const DEFAULT_SETTINGS = {
  name: 'Raj Sharma',
  tagline: '3rd year aspiring MERN developer',
  resume_url: '/resume.pdf',
  resume_preview_url: '/assets/resume-preview.jpg',
  resume_filename: 'Raj-Sharma-Resume.pdf',
}

export const DEFAULT_LINKS = [
  { id: 'd1', label: 'Twitter', href: '#', icon: 'twitter', sort_order: 1 },
  { id: 'd2', label: 'LinkedIn', href: '#', icon: 'linkedin', sort_order: 2 },
  { id: 'd3', label: 'GitHub', href: 'https://github.com/Dekkuhere', icon: 'github', sort_order: 3 },
  { id: 'd4', label: 'Instagram', href: '#', icon: 'instagram', sort_order: 4 },
  { id: 'd5', label: 'Email', href: 'mailto:notraj2006@gmail.com', icon: 'email', sort_order: 5 },
]

export const DEFAULT_PROJECTS = [{
  id: 'p1', name: 'Project Name', year: '2025', role: 'Frontend Developer', location: 'Remote',
  summary: 'A short description of what the project does, the problem it solves and what you built.',
  stack: 'React · Node.js · Express · MongoDB', live: '#', code: '#',
  bullets: [
    'Built the complete frontend of the project, from the layout to the interactive features.',
    'Created the backend API and connected it to a MongoDB database.',
    'Deployed the project and improved its performance and responsiveness.',
  ],
  sort_order: 1,
}]

export const KIT = [
  { title: 'Technologies', names: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'] },
  { title: 'Tools', names: ['Git', 'GitHub', 'VS Code'] },
]
