var assert = require('assert');
var main = require("../src/notes");

var played1 = new Object()
played1.note = 0
var played2 = new Object()
played2.note = 1

describe('#generateDiffs()', function() {
    it('should return nothing given nothing', function() {
        assert.equal(0, main.generateDiffs([]).length);
    });
});

describe('#generateDiffs()', function() {
    it('should return 1 given two notes 1 semitone apart', function() {
        var notes = [played1, played2]
        assert.deepEqual([1], main.generateDiffs(notes));
    });
});