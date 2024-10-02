import './DirBar.css';

import { useEffect } from 'preact/hooks';

export default function DirBar({ dirs, selectedDir, onSelectDir }) {
    const DOWN_KEYS = ['ArrowDown', 'j', 'J']
    const UP_KEYS = ['ArrowUp', 'k', 'K']

    const handleKeyDown = (e) => {
        const index = dirs.indexOf(selectedDir)
        if (DOWN_KEYS.includes(e.key))
            onSelectDir(dirs[(index + 1) % dirs.length])
        else if (UP_KEYS.includes(e.key))
            onSelectDir(dirs[(index + dirs.length - 1) % dirs.length])
    }

    useEffect(
        () => {
            window.addEventListener('keydown', handleKeyDown)
            return () => window.removeEventListener('keydown', handleKeyDown)
        }, [selectedDir])




    return (
        <div className='dir-bar'>
            {dirs.map((dir, index) => (
                <button key={index} className={dir == selectedDir ? 'selected-dir' : 'unselected-dir'}
                    onClick={() => onSelectDir(dir)}>
                    {dir}
                </button>
            ))}
        </div>
    )
}