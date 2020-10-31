import { v4 as uuidv4 } from 'uuid';

function storeScale(scale) {
    var scalesString = window.localStorage.getItem("scales");
    
    if (!scalesString) {
        window.localStorage.setItem("scales", JSON.stringify([scale]))
    } else {
        var scales = JSON.parse(scalesString);
        scales.push(scale)
        window.localStorage.setItem("scales", JSON.stringify(scales))
    }
}

function getBestScaleMatching(scale) {
  var scalesString = window.localStorage.getItem("scales");
  if (scalesString){
    var scales = JSON.parse(scalesString);
    var matchingScales = scales.filter(curre => {
      return curre.startingNote == scale.startingNote && curre.twoHanded == scale.twoHanded && curre.type == scale.type
    });
    if (matchingScales.length > 0){
      return matchingScales.reduce((prev, curr) => {
        if (prev.score.total > curr.score.total) {
          return prev;
        } else {
          return curr;
        }
      })
    }

  }
}

function storeMidiData(midiMessages) {
  var file = new Blob([JSON.stringify(midiMessages)], {type: 'application/json'});
  var a = document.createElement("a"),
                url = URL.createObjectURL(file);
  a.href = url;
  a.download = uuidv4()+ '.json';
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);  
  }, 0); 

}

export {storeScale, getBestScaleMatching, storeMidiData};