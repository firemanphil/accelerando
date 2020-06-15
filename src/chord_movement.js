var chordHistory = []
export function noteStarting(note) {
    if (chordHistory.length == 0) {
        chordHistory.push([note]);
    } else {
        chordHistory[chordHistory.length - 1].push(note)
    }
}

export function noteEnding(note) {
    console.log ("i'm in note ending")
    var chord = chordHistory[chordHistory.length - 1]
    var new_chord = []
    console.log(chord)
    for (const note_down of chord) {
        if (note.note != note_down.note) {
            console.log (note.note + " does not equal " + note_down.note)
            var continuedNote = new Object();
            continuedNote.note = note_down.note;
            continuedNote.start = note.end;
            continuedNote.velocity = note_down.velocity;
            new_chord.push(continuedNote);
            note_down.end = note.end;
        } else {
            note_down.end = note.end
        }
    }
    chordHistory.push(new_chord);
}

export function getCurrentChord() {
    if (chordHistory.length > 0) {
        return chordHistory[chordHistory.length - 1];
    } else {
        return undefined
    }
}

export function getChordHistory() {
    return chordHistory;
}

export function reset() {
    chordHistory = []
}