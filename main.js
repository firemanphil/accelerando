var midi, data;
var heldDownNotes = {};
var notes = ['a','b_flat','b','c','c_sharp','d','d_sharp','e','f','f_sharp','g', 'g_sharp']
var bigNotes = "X:1\nM: 4/4\nL: 1/8\nK: Emin\n|:D2|EFB{c}BA B2 EB|\n";
var tempo = 60;
var returned = undefined;
var tune;
var TREBLE_CLEFF_MIDDLE_C = 0;
// midi functions
function onMIDISuccess(midiAccess) {
	// when we get a succesful response, run this code
	midi = midiAccess; // this is our raw MIDI data, inputs, outputs, and sysex status
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

function updateScreenText() {
	var heldDownText = "";
	for (var key in heldDownNotes){
		if(heldDownNotes[key] !== undefined){
			//console.log(key);
			heldDownText += toNoteString(key) + " ";
		}
	}
	$(".full").text(heldDownText);
}

function onMIDIMessage(message) {
	data = message.data; // this gives us our [command/channel, note, velocity] data.
	// MIDI data [144, 63, 73]
	// 60 is middle c (c_3)
	// 0 is bottom a (a_0)
	if(data.length == 3 && (data[0] == 144 || data[0] ==128)){
		//console.log('MIDI data', message);
		var note = data[1]-21;
		if (data[0] == 144){
			heldDownNotes[note] = message.receivedTime;
		} else {
			var timeDown = message.receivedTime - heldDownNotes[note];
			heldDownNotes[note] = undefined;
			console.log(toNoteString(note) +" was held down for "+ timeDown);
		}

	}


}


function setupEvents(engraver) {
	var eventHash = {};
	// The time is the number of measures from the beginning of the piece.
	var time = 0;
	var isTiedState = false;
	// not sure what staff groups refers to (or voice)
	

	// assume one voice and one staff group (and one staff)
	for (var line=0;line<engraver.staffgroups.length; line++) {
		var group = engraver.staffgroups[line];
		var voices = group.voices;
		var firstStaff = group.staffs[0];
        var currentBaseNote = TREBLE_CLEFF_MIDDLE_C;
		var maxVoiceTime = 0;
		// Put in the notes for all voices, then sort them, then remove duplicates
		for (var v = 0; v < voices.length; v++) {
			// start time of voice?
			var voiceTime = time;
			var elements = voices[v].children;
			for (var elem=0; elem<elements.length; elem++) {
				var element = elements[elem];
				if (element.duration > 0) {
					// There are 3 possibilities here: the note could stand on its own, the note could be tied to the next,
					// the note could be tied to the previous, and the note could be tied on both sides.
					var isTiedToNext = element.startTie;
					if (isTiedState) {
						if (!isTiedToNext)
							isTiedState = false;
						// If the note is tied on both sides it can just be ignored.
					} else {
						// the last note wasn't tied.
						if (!eventHash["event"+voiceTime])
							eventHash["event"+voiceTime] = { type: "event", time: voiceTime, pitch: element.abcelem.pitches[0].pitch+currentBaseNote};
						if (isTiedToNext)
							isTiedState = true;
					}
					voiceTime += element.duration;
				} else if (element.abcelem.type == "treble") {
                    alert("C'est un treble");
                    currentBaseNote = TREBLE_CLEFF_MIDDLE_C;
                }
			}
			maxVoiceTime = Math.max(maxVoiceTime, voiceTime);
		}
		time = maxVoiceTime;
	}
	return sort(eventHash)
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

$(document).ready( function(){
	tune = ABCJS.renderAbc("notation", bigNotes, {},{add_classes: true})[0];
	returned = ABCJS.startAnimation($('#notation')[0], tune, { showCursor: true, bpm:tempo} );
	// request MIDI access
	if (navigator.requestMIDIAccess) {
		navigator.requestMIDIAccess({
			sysex: false
		}).then(onMIDISuccess, onMIDIFailure);
	} else {
		alert("No MIDI support in your browser.");
	}

});
