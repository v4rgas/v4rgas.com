import './ProjectShower.css';

export default function ProjectShower({ project }) {
    return (
        <div className='project-shower'>
            <span className='project-name'>
                {project.name}
            </span>
            <span className='project-description'>
                {project.description}
            </span>
        </div>
    )
}