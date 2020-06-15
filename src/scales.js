var chords = require('./chord_movement');
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

function calculateCoverageWithRightNotes() {
    chords.g
}

export { calculateCoverage };
