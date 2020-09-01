function addBehaviour() {
    let button = document.querySelector("#btnMidi");
    button.addEventListener("click", () => {
      console.log("Button clicked.");
    });
}

export {addBehaviour}