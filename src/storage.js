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

export {storeScale};