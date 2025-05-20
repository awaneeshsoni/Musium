import React from 'react';
import { diffWords } from 'diff';

const DiffOverlay = ({ oldText, newText }) => {
    const diff = diffWords(oldText, newText);

    return (
        <div className="diff-overlay">
            {diff.map((part, index) => {
                const className = part.added ? 'added' : part.removed ? 'removed' : 'unchanged';
                return (
                    <span key={index} className={className}>
                        {part.value}
                    </span>
                );
            })}
        </div>
    );
};

export default DiffOverlay;