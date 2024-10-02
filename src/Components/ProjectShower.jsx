import './ProjectShower.css';

import { useEffect, useState } from 'preact/hooks';

import Markdown from 'preact-markdown';
import useGithubFetcher from '../useGithubFetcher';

export default function ProjectShower({ project }) {
    const [projectMarkdown, setProjectMarkdown] = useState('')

    const { getProjectReadme } = useGithubFetcher()

    const getProjectMarkdown = async () => {
        const data = await getProjectReadme(project)
        setProjectMarkdown(data)
        // console.log(data)
    }

    useEffect(() => {
        if (project)
            getProjectMarkdown()
    }, [project])

    return (
        <div className='project-shower'>
            <span className='links'>
                {project.demoUrl && <a href={project.demoUrl} target='_blank' rel='noreferrer'> {"Link to Demo"} </a>}
                <a href={project.repoUrl} target='_blank' rel='noreferrer'> {"Link to Code"}</a>
            </span>
            <span className='project-md'>
                <Markdown markdown={projectMarkdown} markedOpts={{ gfm: true }} />
            </span>
        </div>
    )
}