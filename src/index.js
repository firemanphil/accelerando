import './main.scss';
require("expose-loader?$!jquery");

import * as notes from './notes'

import * as scales from './scales'
import {api as MIDIKeys} from "./MidiKeys";
import * as behaviour from './behaviour'
import * as midi from './midi'

document.addEventListener("DOMContentLoaded",function(){
    behaviour.addBehaviour();
    if (new URLSearchParams(location.search).get("softwareMidi") !== null) {
      MIDIKeys.onmessage = midi.onMIDIMessage;
    }
  });