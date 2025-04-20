// utils/diff.ts

import * as Diff from 'diff';

export const applyDiff = (originalText: string, diffText: string) => {
    const diffs = Diff.diffChars(originalText, diffText);
    let result = "";

    diffs.forEach((part) => {
        // If the part was added, include it. If it was removed, skip it. Otherwise, include the original.
        result += part.added ? part.value : (part.removed ? "" : part.value);
    });

    return result;
};