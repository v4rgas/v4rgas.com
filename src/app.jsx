import './app.css'

import DirBar from './Components/DirBar'
import PROJECTS from './assets/projects.json'
import ProjectShower from './Components/ProjectShower'
import Topbar from './Components/Topbar'
import { useState } from 'preact/hooks'

export function App() {

  const [selectedProject, setSelectedProject] = useState('About Me')

  return (
    <main className='flex'>
      <Topbar user={'v4rgas@github'} route={'/home/v4rgas'} folder={'Projects'} />
      <div className="dir-grid">
        <DirBar dirs={PROJECTS.map(project => project.name)} selectedDir={selectedProject} onSelectDir={(name) => {
          setSelectedProject(name)
        }} />
        <ProjectShower project={PROJECTS.find(p => p.name == selectedProject)} />
      </div>

    </main>
  )
}
