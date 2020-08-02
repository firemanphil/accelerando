import './main.scss';
require("expose-loader?$!jquery");
import {Chart} from "chart.js" ;
import {api as MIDIKeys} from "./MidiKeys";
import * as scales from './scales'
var chord_movement = import('./chord_movement')
var mid;
var heldDownNotes = {};
var playedNotes = [];
var notes = ['a','b_flat','b','c','c_sharp','d','d_sharp','e','f','f_sharp','g', 'g_sharp']
var abcNotes =       ['c','d','e','f','g','a','b']
var abcToMidiPitch = [ 0,  2,  4,  5,  7,  9,  11]
var bigNotes = "X:1\nM: 4/4\nL: 1/8\nK: Emaj\n|:D2|EFB{c}BA B2 EB|\n";
var tempo = 60;
var returned = undefined;
var recording = true;
var tune;
var TREBLE_CLEFF_MIDDLE_C = 60;
var barChart; 
// midi functions
function onMIDISuccess(midiAccess) {
	// when we get a succesful response, run this code
	var midi = midiAccess; // this is our raw MIDI data, inputs, outputs, and sysex status
	var inputs = midi.inputs.values();
	// loop over all available inputs and listen for any MIDI input
	for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
		// each time there is a midi message call the onMIDIMessage function
		input.value.onmidimessage = onMIDIMessage;
	}
};

function onMIDIFailure(error) {
	// when we get a failed response, run this code
	console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + error);
}

function toNoteString(note){
	var letterInt = note % 12;
	var octave = (note - letterInt) / 12;
	var letter = notes[letterInt];
	return letter+"_"+octave;
}

function onMIDIMessage(message) {
	var data = message.data; // this gives us our [command/channel, note, velocity] data.
	// MIDI data [144, 63, 73]
	// 60 is middle c (c_3)
    // 0 is bottom a (a_0)
    
    // this is a data point about a key coming up or down
	if(data.length == 3 && (data[0] == 144 || data[0] == 128)){
		//console.log('MIDI data', message);
		var note = data[1]-21;
		if (data[0] == 144){
            var played = new Object()
            played.note = note
            played.start = message.timeStamp;
            played.velocity = data[2]
            heldDownNotes[note] = played;
            playedNotes.push(played)
		} else {
            var timeDown = message.timeStamp - heldDownNotes[note].start;
            heldDownNotes[note].end = message.timeStamp 
            heldDownNotes[note].length = timeDown
			heldDownNotes[note] = undefined
            // is it a good assumption that the notes are in time order?
            // what does time order mean? I guess that the start of note 1 is before the start of note 2

            console.log(toNoteString(note) + " was held down for "+ timeDown);

            if (playedNotes.length > 4 && isResetSequence(playedNotes)) {
                playedNotes = []
                heldDownNotes = {}
                console.log("Found reset sequence")
                $(".Score").text("");
                $(".Title").text("Play a scale to see your score!");
                return
            }
            
            var playedNotesSorted = playedNotes.sort(function(a, b) {
                return a.start - b.start
            });
            updateChart(playedNotesSorted);

            var diffs = generateDiffs(playedNotesSorted);
            if (scales.isScale(playedNotesSorted)) {
                $(".Title").text("Scale found: " + toNoteString(playedNotesSorted[0].note) + " major");
                scoreScale(playedNotesSorted)
            } else {
                $(".Score").text("");
                $(".Title").text("Play a scale to see your score!");
            }
        }
	}
}

function updateChart(notes) {
    addData(barChart, toNoteString(notes[notes.length-1].note), notes[notes.length-1].length)
    barChart.update();
}

function avg(values) {
    let sum = values.reduce((previous, current) => current += previous);
    return sum / values.length;
}

function isResetSequence(playedNotesSorted) {
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

function scoreScale(playedNotesSorted) {
    // first consider speed
    var prev = null
    var timeDiffs = []
    for (const note of playedNotesSorted) {
        if (prev !== null) {
            timeDiffs.push(note.start - prev.start)
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
    let averageTime = avg(timeDiffs)
    console.log("time was " + averageTime)
    var bpm = Math.floor(60000 / (4 *  averageTime))
    console.log("bpm was " + bpm)
    $(".Score").text("SCORE WAS " + bpm/3).show()
    
}

function isTwoHandedScale(notesSorted) {
    // i'm gonna define a two handed scale as 
    //
    // 0. first two notes are 12 apart (easy to rule lots out)
    // 1. follows general rules about distances
    // 2. 90% of the time (defined by time in which there is a note sounding) there are two notes seperated by 12 sounding 
    // 3. taken modulo 12, two interleaving scales are formed

    // 0.

    if (notesSorted[0].note % 12 != notesSorted[1].note % 12) {
        return false;
    }

    // 1.
    var diffs = generateDiffs(notesSorted)
    var generalRulesForScalePass = checkGeneralRulesForScale(diffs)
    if (! generalRulesForScalePass) {
        return false
    }

    // 2.
    var maxTime = notesSorted.reduce(function(a,b) { return Math.max(a.end, b.end)});
    var minTime = notesSorted.reduce(function(a,b) { return Math.min(a.start, b.start)});
    var timeCovered = calculateCoverage(notesSorted);


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

Number.prototype.absBetween = function(a, b) {
    var min = Math.min.apply(Math, [a, b]),
      max = Math.max.apply(Math, [a, b]);
    return Math.abs(this) >= min && Math.abs(this) <= max;
};


function calculatePitch(abcPitch, baseNote) {
    var notePitch = abcPitch % 8;
    var octave = (abcPitch - notePitch) / 8;
    return baseNote + octave * 12 + abcToMidiPitch[notePitch]; 
}

function sort(hashedevents) {
	var time = -1
	var array = $.map(hashedevents, function(value, index) {
		    return [value];
	});

	return array.sort(function (a,b) {
		return a['time'] - b['time'];	
	});
}

function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}

function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    chart.update();
}


document.addEventListener("DOMContentLoaded",function(){

    MIDIKeys.onmessage = onMIDIMessage;
	// tune = ABCJS.renderAbc("notation", bigNotes, {},{add_classes: true})[0];
	// returned = ABCJS.startAnimation($('#notation')[0], tune, { showCursor: true, bpm:tempo} );
	// request MIDI access
	if (navigator.requestMIDIAccess) {
		navigator.requestMIDIAccess({
			sysex: false
		}).then(onMIDISuccess, onMIDIFailure);
	} else {
		alert("No MIDI support in your browser.");
	}
    $(".ResetScore").click( function() {
      
      $(".timer").text('9321');
      setTimeout(function() {
        $('.timer').countTo(); 
      }, 5000);
      
      var el = $( ".Score" );
      el.before( el.clone(true) ).remove();
      
    });
    var ctx = document.getElementById('myChart');

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'length held down',
                data: [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
    console.log(barChart);
    console.log(barChart.data);
    

});