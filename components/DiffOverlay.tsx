// components/DiffOverlay.tsx

'use client';

import React, { useEffect, useState } from 'react';

interface DiffOverlayProps {
  oldText: string;
  newText: string;
}

const DiffOverlay: React.FC<DiffOverlayProps> = ({ oldText, newText }) => {
  const [diffElements, setDiffElements] = useState<React.ReactNode[]>([]);
  const [jsDiff, setJsDiff] = useState<any>(null);

  useEffect(() => {
    const loadJsDiff = async () => {
      if (typeof window !== 'undefined') {
        // Import jsDiff dynamically
        setJsDiff(window.Diff);
      }
    };

    loadJsDiff();
  }, []);

  useEffect(() => {
    if (jsDiff) {
      const getDiffElements = () => {
        const diff = jsDiff.diffChars(oldText, newText);
        return diff.map((part: any, index: number) => {
          return (
            <span
              key={index}
              style={{
                backgroundColor: part.added ? 'rgba(0, 255, 0, 0.2)' : part.removed ? 'rgba(255, 0, 0, 0.2)' : 'transparent',
                textDecoration: part.removed ? 'line-through' : 'none',
              }}
            >
              {part.value}
            </span>
          );
        });
      };

      setDiffElements(getDiffElements());
    }
  }, [oldText, newText, jsDiff]);

  return <>{diffElements}</>;
};

export default DiffOverlay;