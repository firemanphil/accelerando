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

function isMajorScale(diffs) {
    
    console.log(diffs)
    console.log(major)
    
    if (diffs.length % 7 != 0) {
        return false;
    }
    var diffsSplit = [];

    var chunk = 7;
    for (var i=0; i<diffs.length; i+=chunk) {
        diffsSplit.push(diffs.slice(i,i+chunk));
    }
    console.log(diffsSplit)
    for (const chunkDiffs of diffsSplit) {
        console.log(chunkDiffs)
        if (!chunkDiffs.every(function(value, index) { return value === major[index]})){
            
            console.log("problem chunk")
            return false
        } else {
            console.log("found major chunk")
        }
    }
    return true 
}

Number.prototype.absBetween = function(a, b) {
    var min = Math.min.apply(Math, [a, b]),
      max = Math.max.apply(Math, [a, b]);
    return Math.abs(this) >= min && Math.abs(this) <= max;
};


export { calculateCoverage, isMajorScale };
