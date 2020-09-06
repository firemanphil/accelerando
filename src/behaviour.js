function addBehaviour() {
    let midiButton = document.querySelector("#btnMidi");
    midiButton.addEventListener("click", () => {
      onMidiButtonClick(midiButton);
    });
}

function onMidiButtonClick(midiButton) {
  console.log("we are here")
  midiButton.disabled = true;
}

export {addBehaviour}