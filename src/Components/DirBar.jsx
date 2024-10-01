import './DirBar.css';

export default function DirBar({ dirs }) {
    const selectedDir = 0
    return (
        <div className='dir-bar'>
            {dirs.map((dir, index) => (
                <span key={index} className={selectedDir == index ? 'selected-dir' : 'unselected-dir'}>
                    {dir}
                </span>
            ))}
        </div>
    )
}