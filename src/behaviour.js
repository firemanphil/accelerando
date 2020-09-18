function addBehaviour() {
    let midiButton = document.querySelector("#btnMidi");
    midiButton.addEventListener("click", () => {
      onMidiButtonClick(midiButton);
    });
}

function onMidiButtonClick(midiButton) {
  console.log("we are here")
  midiButton.disabled = true;
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({
			sysex: false
		}).then(onMIDISuccess, onMIDIFailure);
  } else {
    showMidiProblemDiv()
  }
}

function showMidiProblemDiv() {
  let browserProblemSection = document.querySelector("#midiBrowserProblem");
  let helpSection = document.querySelector("#help");
  browserProblemSection.hidden = false;
  helpSection.hidden = true;
}


function showChartDiv() {
  let browserProblemSection = document.querySelector(".chart-container");
  let helpSection = document.querySelector("#help");
  browserProblemSection.hidden = false;
  helpSection.hidden = true;
}

function onMIDISuccess(midiAccess) {
	// when we get a succesful response, run this code
	var midi = midiAccess; // this is our raw MIDI data, inputs, outputs, and sysex status
  var inputs = midi.inputs.values();
  if (midi.inputs.size == 0) {
    showChartDiv()
    // showMidiNotConnectedSection();
  } else {

  }
}

function onMIDIFailure() {
	// when we get a succesful response, run this code
	var midi = midiAccess; // this is our raw MIDI data, inputs, outputs, and sysex status
  var inputs = midi.inputs.values();
  if (inputs.length == 0) {
    showMidiNotConnectedSection();
  }
}

function showMidiNotConnectedSection() {
  let browserProblemSection = document.querySelector("#midiNotConnectedProblem");
  let helpSection = document.querySelector("#help");
  browserProblemSection.hidden = false;
  helpSection.hidden = true;
}

export {addBehaviour}