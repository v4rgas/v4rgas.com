import './app.css'

import DirBar from './Components/DirBar'
import ProjectShower from './Components/ProjectShower'
import Topbar from './Components/Topbar'
import { useState } from 'preact/hooks'
import Terminal from './Terminal'

export function App() {

  const [selectedProject, setSelectedProject] = useState('About Me')
  const PAGES = ['About Me', 'Projects']

  return (
    <Terminal>
    <main className='flex'>
      <Topbar user={'v4rgas@github'} route={'/home/v4rgas'} folder={'Projects'} />
      <div className="dir-grid">
        <DirBar dirs={PAGES} selectedDir={selectedProject} onSelectDir={(name) => {
          setSelectedProject(name)
        }} />
        <ProjectShower project={selectedProject} />
      </div>

    </main>
    </Terminal>
  )
}
