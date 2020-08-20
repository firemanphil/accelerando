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

export {storeScale, getBestScaleMatching};