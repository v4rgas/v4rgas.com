import './Topbar.css';

export default function Topbar({ user, route, folder }) {
    return (
        <span className='topbar'>
            <span className='user'>
                {user}
            </span>
            {' '}
            <span className='route'>
                {route}
                {'/'}
            </span>

            <span className='folder'>
                {folder}
            </span>
        </span>
    )

}