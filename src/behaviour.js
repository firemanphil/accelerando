var storage = require("./storage")
var scales = require("./scales")

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
		}).then(onMIDISuccess, showMidiNotConnectedSection);
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
  let softwareMidiEnabled = new URLSearchParams(location.search).get("softwareMidi") !== null;
  if (midi.inputs.size == 1 || softwareMidiEnabled) {
    showChartDiv()
    // showMidiNotConnectedSection();
  } else {
    showMidiNotConnectedSection();
  }
}

function showMidiNotConnectedSection() {
  let browserProblemSection = document.querySelector("#midiNotConnectedProblem");
  let helpSection = document.querySelector("#help");
  browserProblemSection.hidden = false;
  helpSection.hidden = true;
}


function onScale(scale) {
  $(".Title").text("Scale found: " + scale.toString()+ ", score was " + scale.score.total + " (accuracy " + scale.score.accuracy + ", speed " + scale.score.speed + ")");
  var best = storage.getBestScaleMatching(scale);
  
}

scales.registerScaleListener(onScale);

export {addBehaviour}