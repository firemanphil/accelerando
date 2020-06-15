var assert = require('assert');
var main = require("../src/scales");
describe('main', function() {
  var notes = []
  var played1 = new Object()
  played1.start = 0
  played1.end = 2
  var played2 = new Object()
  played2.start = 2
  played2.end = 4
  var played3 = new Object()
  played3.start = 5
  played3.end = 6
  var played4 = new Object()
  played4.start = 1
  played4.end = 4;

  describe('#calculateCoverage()', function() {
    it('should return full amount when played notes cover the area', function() {
        var playedNotes = []
        playedNotes.push(played1)
        playedNotes.push(played2)
        assert.equal(4, main.calculateCoverage(playedNotes));
    });
  });

  describe('#calculateCoverage()', function() {
    it('should only return part of the area when played notes don\'t the area', function() {
        var playedNotes = []
        playedNotes.push(played1)
        playedNotes.push(played3)
        assert.equal(3, main.calculateCoverage(playedNotes));
    });
  });

  describe('#calculateCoverage()', function() {
    it('should only return part of the area when played notes don\'t the area, even if they overlap', function() {
        var playedNotes = []
        playedNotes.push(played1)
        playedNotes.push(played4)
        assert.equal(4, main.calculateCoverage(playedNotes));
    });
  });
});