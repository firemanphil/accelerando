var chords = require('./chord_movement');
var notes = require('./notes');

let recording = true;

const major = [2, 2, 1, 2, 2, 2, 1];
const scoreRange = [
{
    0: [100, Number.MAX_VALUE]
}, {
    1: [50, 100]
},{
    2: [25, 50]
}, {
    5: [10, 25]
}, {
    10: [5, 10]
}, {
    20: [2, 5]
}, {
    50: [1, 2]
}, {
    100: [-1, 1]
}];

var scaleListeners = [];

function registerScaleListener(scaleListener) {
  scaleListeners.push(scaleListener);
}

function calculateCoverage(notesSorted) {
    var i
    var timeCovered = 0
    var rollingSumStart = -1
    for (i = 0 ; i < notesSorted.length; i++) {
        var current = notesSorted[i]
        if (rollingSumStart == -1) {
            rollingSumStart = current.start
        } 
        if (i != (notesSorted.length - 1) && notesSorted[i+1].start < current.end) {
            console.log("connection found")
            // connection... notes overlapping
            continue
        } else {
            console.log("current.end= " + current.end + " rollingSumStart = " +rollingSumStart)
            timeCovered += (current.end - rollingSumStart)
            rollingSumStart = -1
        }

    }
    return timeCovered;
}

function avg(values) {
    let sum = values.reduce((previous, current) => current += previous);
    return sum / values.length;
}

function isScale(_, playedNotes) {

    var date = new Date();
    
    var scale = {
        twoHanded: false,
        type: "major",
        startingNote: 0,
        score: {
          total: 0,
          accuracy: 0,
          speed: 0
        },
        timestamp: date.getTime(),
        toString: function() {
            var noteString = notes.toNoteString(this.startingNote).letter;

            if (this.twoHanded) {
                return "Two handed "+ noteString + " " + this.type
            } else {
                return noteString + " " + this.type
            }
        }
    }
    // this is hard to figure out. When playing with two hands, certain notes are supposed to 
    // be played together, but that won't be the case due to human imperferctions. Therefore
    // there is not absolute order to a scale. 

    // What we CAN say is there never should be more than two played notes between two written down notes
    // on a scale. If the note is x then the next note should be x +1/2 (next note same hand),
    // x +/- 12 (same note in other hand),
    // x + 13/14  OR x - 11/10 `(next note in the other hand) 

    // The algorithm will be to scan for a scale in one hand and then assume the rest of the notes are a scale in the other.
    // TODO for now we focus on one direction (up)

    // var generalRulesPass = checkGeneralRulesForScale(diffs)
    var hands = extractDifferentHands(playedNotes);

    var diffs1 = notes.generateDiffs(hands.handOne);
    if (diffs1.length % 7 != 0) {
        return undefined
    }
    var diffs2 = notes.generateDiffs(hands.handTwo);
    if (diffs2.length % 7 != 0) {
        return undefined
    }
    scale.score = scoreScale(hands.handOne);
    if (diffs2.length != 0) {
        var bothHandsMajor = isMajorScale(diffs1) && isMajorScale(diffs2);
        var bothHandsStartOnTheSameNote = hands.handOne[0].note % 12 == hands.handTwo[0].note % 12;
        scale.type = "major"
        scale.startingNote = hands.handOne[0].note;
        scale.twoHanded = true;
        if (bothHandsMajor && bothHandsStartOnTheSameNote) {
          scaleListeners.forEach(l => l(scale))  
          return scale;
        }
    } else {
        var isMajor = isMajorScale(diffs1);
        scale.type = 'major';
        scale.startingNote = hands.handOne[0].note;
        scale.twoHanded = false;
        if (isMajor) {
            scaleListeners.forEach(l => l(scale))
            return scale;
        }
    }
    return undefined;
}

function extractDifferentHands(playedNotes) {
    var hands = {
        handOne: [],
        handTwo: [],
        otherHand: function(hand) {
            if (hand === this.handOne) {
                return this.handTwo;
            } else {
                return this.handOne;
            }
        }
    }
    if (playedNotes.length == 0) {
        return hands;
    }
    var previousNote;
    var currentHand;
    playedNotes.forEach(element => {
        if (previousNote === undefined) {
            hands.handOne.push(element);
            currentHand = hands.handOne;
        } else { 
            if (Math.abs(previousNote.note - element.note) >= 10) {
                currentHand = hands.otherHand(currentHand);
                currentHand.push(element);
            } else {
                currentHand.push(element);
            }            
        }
        previousNote = element;
    });
    return hands;
}

function scoreScale(handOne, handTwo) {

    if (!handOne || handOne.length < 8 || (handTwo && handOne.length != handTwo.length)) {
        return;
    }
    // first consider speed
    var prev = null
    var noteLengths = []

    for (const note of handOne) {
        // we don't consider the last note because that tends to be longer
        if (prev !== null) {
            noteLengths.push(note.start - prev.start)
        }
        prev = note
    }
    // this is in millis
    // 60 bpm = 1 second per beat = 1000ms per beat
    // bpm = 60 * 1000 / 4 * averageTime (I think) 
    // 4 because I'm measuring each note as a semiquaver
    // as per Hanon. Lets say 100/100 = 300bpm (impossible??)
    // 0/100 = 0bpm
    // so ... just divide by 3
    let averageTime = avg(noteLengths)

    var percDiffsFromAvg = noteLengths.map(element => {
        return 100 * (Math.abs(averageTime - element)/ averageTime);
    });
    console.log(percDiffsFromAvg);
    var scorePerNote = percDiffsFromAvg.map(element =>  {
        return Object.keys(scoreRange.filter(function(el) {
            var key = el[Object.keys(el)];
            return element > key[0] && element <= key[1]
          })[0])[0]|| {0: []};
    });
    console.log(scorePerNote);

    console.log("time was " + averageTime)
    var bpm = Math.floor(60000 / (4 *  averageTime))
    console.log("bpm was " + bpm);
    var accuracy = scorePerNote.reduce(function(a, b){
      return parseInt(a) + parseInt(b);
    }, 0);
    return {
      total: bpm * accuracy,
      speed: bpm,
      accuracy: accuracy
    }
}

function isMajorScale(diffs) {       
    if (diffs.length % 7 != 0 || diffs.length == 0) {
        return false;
    }
    var diffsSplit = [];

    var chunk = 7;
    for (var i=0; i<diffs.length; i+=chunk) {
        diffsSplit.push(diffs.slice(i,i+chunk));
    }

    for (const chunkDiffs of diffsSplit) {
        if (!chunkDiffs.every(function(value, index) { return value === major[index]})
                && !chunkDiffs.reverse().every(function(value, index) { return value * -1 === major[index]})){
            return false
        }
    }
    return true 
}

Number.prototype.absBetween = function(a, b) {
    var min = Math.min.apply(Math, [a, b]),
      max = Math.max.apply(Math, [a, b]);
    return Math.abs(this) >= min && Math.abs(this) <= max;
};

notes.registerNoteListener(isScale);

export { calculateCoverage, isMajorScale, isScale, registerScaleListener };
