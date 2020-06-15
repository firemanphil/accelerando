var assert = require('assert');
var main = require("../src/chord_movement");
describe('main', function() {
    var played = new Object();
    played.note = 0;
    played.start = 0;
    var played2 = new Object();
    played2.note = 1;
    played2.start = 1;
    var ending = new Object();
    ending.note = 0;
    ending.start = 0;
    ending.end = 2;

  describe('#noteStarting()', function() {
    it('should update the current chord', function() {
        main.noteStarting(played)
        assert.equal(1, main.getCurrentChord().length);
        assert.equal(0, main.getCurrentChord()[0].note);
    });
  });

  describe('#reset()', function() {
    it('should empty the current chord', function() {
        main.noteStarting(played)
        main.reset()
        assert.equal(undefined, main.getCurrentChord());
    });
  });

  describe('#noteStarting()', function() {
    it('should update the current chord, even if there is another note sounding', function() {
        main.noteStarting(played)
        main.noteStarting(played2);
        assert.equal(2, main.getCurrentChord().length);
        assert.equal(0, main.getCurrentChord()[0].note);
        assert.equal(1, main.getCurrentChord()[1].note);
    });
  });

  describe('#noteEnding()', function() {
    it('should update the current chord to remove the ending note', function() {
        main.noteStarting(played);
        main.noteStarting(played2);
        main.noteEnding(ending);
        assert.equal(1, main.getCurrentChord().length);
        assert.equal(1, main.getCurrentChord()[0].note);
    });
  });

  describe('#getChordHistory()', function() {
    it('the list of chords should be longer after a single note in a chord is ended', function() {
        main.noteStarting(played);
        main.noteStarting(played2);
        main.noteEnding(ending);
        assert.equal(2, main.getChordHistory().length);
    });
  });

  describe('#getChordHistory()', function() {
    it('given one note held down, the previous chord should finish when the current one starts', function() {
        main.noteStarting(played);
        main.noteStarting(played2);
        main.noteEnding(ending);
        assert.equal(2, main.getChordHistory()[0][0].end);
        assert.equal(2, main.getChordHistory()[0][1].end);
        assert.equal(2, main.getChordHistory()[1][0].start);
    });
  });

  describe('#getCurrentChord()', function() {
    it('current chord should be empty when no notes are sounding', function() {
        main.noteStarting(played);
        main.noteEnding(ending);
        assert.equal(0, main.getCurrentChord().length);
    });
  });

  afterEach(function() {
     main.reset();
  });
//   describe('#calculateCoverage()', function() {
//     it('should only return part of the area when played notes don\'t the area', function() {
//         var playedNotes = []
//         playedNotes.push(played1)
//         playedNotes.push(played3)
//         assert.equal(3, main.calculateCoverage(playedNotes));
//     });
//   });

//   describe('#calculateCoverage()', function() {
//     it('should only return part of the area when played notes don\'t the area, even if they overlap', function() {
//         var playedNotes = []
//         playedNotes.push(played1)
//         playedNotes.push(played4)
//         assert.equal(4, main.calculateCoverage(playedNotes));
//     });
//   });
});