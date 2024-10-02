import './app.css'

import DirBar from './Components/DirBar'
import ProjectShower from './Components/ProjectShower'
import Topbar from './Components/Topbar'
import { useState } from 'preact/hooks'

export function App() {


  return (
    <main className='flex'>
      <Topbar user={'v4rgas@github'} route={'/home/v4rgas'} folder={'Projects'} />
      <div className="dir-grid">
        <DirBar dirs={['sortEm', 's', 'asd']} />
        <ProjectShower project={{ name: 'SortEm', description: 'A cool game' }} />
      </div>

    </main>
  )
}
