import './ProjectShower.css';

import { useEffect, useState } from 'preact/hooks';

import Markdown from 'preact-markdown';

export default function ProjectShower({ project }) {
    // get project markdown
    const [projectMarkdown, setProjectMarkdown] = useState('')

    const getProjectMarkdown = async () => {
        const response = await fetch(`https://raw.githubusercontent.com/v4rgas/sortEm/refs/heads/main/README.md`)
        const data = await response.text()
        setProjectMarkdown(data)
    }

    useEffect(() => {
        getProjectMarkdown()
    }, [])

    return (
        <div className='project-shower'>
            <span className='project-md'>
                <Markdown markdown={projectMarkdown} markedOpts={{ gfm: true }} />
            </span>
        </div>
    )
}