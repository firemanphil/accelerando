var midi = require('./midi');

var notes = ['A','B♭','B','C','C♯','D','D♯','E','F','F♯','G', 'G♯']
var heldDownNotes = {};
var playedNotes = [];
var noteListeners = [];

function registerNoteListener(noteListener) {
  noteListeners.push(noteListener);
}

function onKeyDown(keyDownEvent) {
  heldDownNotes[keyDownEvent.note] = keyDownEvent;
  playedNotes.push(keyDownEvent)
}

function onKeyUp(keyUpEvent) {
  var timeDown = keyUpEvent.timeStamp - heldDownNotes[keyUpEvent.note].start;
  heldDownNotes[keyUpEvent.note].end = keyUpEvent.timeStamp 
  heldDownNotes[keyUpEvent.note].length = timeDown
  heldDownNotes[keyUpEvent.note] = undefined
  
  console.log(toNoteString(keyUpEvent.note).letter + " was held down for "+ timeDown);

  var playedNotesSorted = playedNotes.sort(function(a, b) {
    return a.start - b.start
  });

  noteListeners.forEach(nl => nl(keyUpEvent, playedNotesSorted));
  isResetSequence(playedNotesSorted);

}

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

function isResetSequence(playedNotesSorted) {
  if (playedNotes.length < 4) {
    return false;
  }
  var playedNotesSorted = playedNotes.sort(function(a, b) {
      return b.start - a.start
  });
  var note = null
  for (var i = 0; i < 4; i++) {
      if (playedNotesSorted[i].note == note || note === null) {
          note = playedNotesSorted[i].note
      } else {
          return false
      }
  }
  return true
}

function toNoteString(note){
	var letterInt = note % 12;
	return  {
        octave: (note - letterInt) / 12,
        letter: notes[letterInt]
    }
}

midi.registerKeyDownListener(onKeyDown);
midi.registerKeyUpListener(onKeyUp);

export { generateDiffs, toNoteString, registerNoteListener }