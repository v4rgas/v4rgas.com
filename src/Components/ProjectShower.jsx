import './ProjectShower.css';

import { useState } from 'preact/hooks';
import AboutMe from './Pages/AboutMe';
import { useEffect } from 'preact/hooks';
import Projects from './Pages/Projects';

export default function ProjectShower({ project }) {
    const [selectedProject, setSelectedProject] = useState(project);

    useEffect(() => {
        setSelectedProject(project);
    }, [project]);

    return (
        <div className='project-shower'>
            {selectedProject === 'About Me' && <AboutMe />}
            {selectedProject === 'Projects' && <Projects />}
            {!selectedProject && <div>Welcome! Please select a page.</div>}
        </div>
    );
}