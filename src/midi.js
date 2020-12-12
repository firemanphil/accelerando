let keyDownListeners = [];
let keyUpListeners = [];
let recordedMidi = [];
let recording = true;

function registerKeyDownListener(listener) {
  keyDownListeners.push(listener);
}

function registerKeyUpListener(listener) {
  keyUpListeners.push(listener);
}

function onMIDIMessage(message) {
  if (recording) {
    recordedMidi.push(message);
  }
  var data = message.data; // this gives us our [command/channel, note, velocity] data.
  // MIDI data [144, 63, 73]
  // 60 is middle c (c_3)
  // 0 is bottom a (a_0)

  // this is a data point about a key coming up or down
  if (data.length == 3 && (data[0] == 144 || data[0] == 128)) {
    //console.log('MIDI data', message);
    var note = data[1] - 21;
    if (data[0] == 144) {
      var keyDownEvent = new Object()
      keyDownEvent.note = note
      keyDownEvent.start = message.timeStamp;
      keyDownEvent.velocity = data[2];
      keyDownListeners.forEach(lis => lis(keyDownEvent));
    } else {
      var keyUpEvent = new Object();
      keyUpEvent.note = note;
      keyUpEvent.timeStamp = message.timeStamp;
      keyUpListeners.forEach(lis => lis(keyUpEvent));
      // is it a good assumption that the notes are in time order?
      // what does time order mean? I guess that the start of note 1 is before the start of note 2

    }
  }
}

export { registerKeyDownListener, registerKeyUpListener, onMIDIMessage }