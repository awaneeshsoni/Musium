import * as Diff from 'diff';

export const applyDiff = (originalText, diffText) => {
    const diffs = Diff.diffChars(originalText, diffText);
    let result = "";
    diffs.forEach((part) => {
        result += part.added ? part.value : (part.removed ? "" : part.value);
    });

    return result;
};