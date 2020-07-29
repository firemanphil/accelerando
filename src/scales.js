var chords = require('./chord_movement');

var major = [2, 2, 1, 2, 2, 2, 1];

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

function isScale(diffs) {
    // this is hard to figure out. When playing with two hands, certain notes are supposed to 
    // be played together, but that won't be the case due to human imperferctions. Therefore
    // there is not absolute order to a scale. 

    // What we CAN say is there never should be more than two played notes between two written down notes
    // on a scale. If the note is x then the next note should be x +1/2 (next note same hand),
    // x +/- 12 (same note in other hand),
    // x + 13/14  OR x - 11/10 `(next note in the other hand) 

    // The algorithm will be to scan for a scale in one hand and then assume the rest of the notes are a scale in the other.
    // TODO for now we focus on one direction (up)
    if (diffs.length % 7 != 0) {
        return false
    }
    // var generalRulesPass = checkGeneralRulesForScale(diffs)
    
    if(isMajorScale(diffs)) {
        return true;
    }
    return false;
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
        if (!chunkDiffs.every(function(value, index) { return value === major[index]})){
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


export { calculateCoverage, isMajorScale, isScale };
