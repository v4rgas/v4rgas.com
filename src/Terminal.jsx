import React from 'react';

const Terminal = ({ children }) => {
    const terminalStyle = {
        backgroundColor: 'var(--color-bg-default)',
        padding: '1rem',
        borderRadius: '5px',
        border: '1px solid var(--color-border)',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
        overflow: 'auto',
        // whiteSpace: 'pre-wrap',
    };

    return <div style={terminalStyle}>{children}</div>;
};

export default Terminal;