var notes = ['A','B♭','B','C','C♯','D','D♯','E','F','F♯','G', 'G♯']

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

function toNoteString(note){
	var letterInt = note % 12;
	return  {
        octave: (note - letterInt) / 12,
        letter: notes[letterInt]
    }
}

export { generateDiffs, toNoteString }