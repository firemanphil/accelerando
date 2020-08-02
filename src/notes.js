function generateDiffs(playedNotesSorted) {
    var prev = null;
    var diffs = [];
    for (const note of playedNotesSorted) {
        if (prev !== null) {
            console.log(note);
            diffs.push(note.note - prev.note);
        }
        prev = note;
    }
    return diffs
}

export { generateDiffs }