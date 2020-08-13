var assert = require('assert');
var rewire = require('rewire')
var main = rewire("../src/scales");
var extractDifferentHands =  main.__get__('extractDifferentHands');
var scoreScale =  main.__get__('scoreScale');
var major = main.__get__('major');

function generateScale() {
  return [...Array(16).keys()].map(value => { 
    return {
        start: value % 8,
        end: value % 8 + 1,
        note: value
    };
  });
}

describe('main', function() {
  var notes = []
  var played1 = new Object()
  played1.start = 0
  played1.end = 2
  played1.note = 0
  var played2 = new Object()
  played2.start = 2
  played2.end = 4
  played2.note = 2
  var played3 = new Object()
  played3.start = 5
  played3.end = 6
  played3.note = 12
  var played4 = new Object()
  played4.start = 1
  played4.end = 4;
  played4.note = 14

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

  describe('#isMajorScale()', function() {
    it('should return false given 0 diffs', function() {
        var diffs = []
        assert.equal(false, main.isMajorScale(diffs));
    });
  });

  describe('#isMajorScale()', function() {
    it('should return false given less than seven diffs', function() {
        var diffs = []
        diffs.push(2)
        diffs.push(2)
        assert.equal(false, main.isMajorScale(diffs));
    });
  });

  describe('#isMajorScale()', function() {
    it('should return false given a minor scale', function() {
        var diffs = []
        diffs.push(2)
        diffs.push(2)
        diffs.push(1)
        diffs.push(2)
        diffs.push(2)
        diffs.push(3)
        diffs.push(1)
        assert.equal(false, main.isMajorScale(diffs));
    });
  });

  describe('#isMajorScale()', function() {
    it('should return true given a major scale', function() {
        var diffs = []
        diffs.push(2)
        diffs.push(2)
        diffs.push(1)
        diffs.push(2)
        diffs.push(2)
        diffs.push(2)
        diffs.push(1)
        assert.equal(true, main.isMajorScale(diffs));
    });
  });

  describe('#isMajorScale()', function() {
    it('should return false given a major scale plus nonsense', function() {
        var diffs = []
        diffs.push(2)
        diffs.push(2)
        diffs.push(1)
        diffs.push(2)
        diffs.push(2)
        diffs.push(2)
        diffs.push(1)
        diffs.push(1)
        assert.equal(false, main.isMajorScale(diffs));
    });
  });

  describe('#isMajorScale()', function() {
    it('should return true given a multiple major scales', function() {
        var diffs = []
        diffs.push(2)
        diffs.push(2)
        diffs.push(1)
        diffs.push(2)
        diffs.push(2)
        diffs.push(2)
        diffs.push(1)
        Array.from(diffs).forEach(function(value) {diffs.push(value)})
        assert.equal(true, main.isMajorScale(diffs));
    });
  });

  describe('#isMajorScale()', function() {
    it('should return true given a major scale forward and back', function() {
        var diffs = []
        diffs.push(2)
        diffs.push(2)
        diffs.push(1)
        diffs.push(2)
        diffs.push(2)
        diffs.push(2)
        diffs.push(1)
        Array.from(diffs).reverse().forEach(function(value) {diffs.push(value*-1)})
        assert.equal(true, main.isMajorScale(diffs));
    });
  });

  describe('#isMajorScale()', function() {
    it('should return false given a major scale back then forward', function() {
        var diffs = []
        diffs.push(-2)
        diffs.push(-2)
        diffs.push(-1)
        diffs.push(-2)
        diffs.push(-2)
        diffs.push(-2)
        diffs.push(-1)
        Array.from(diffs).reverse().forEach(function(value) {diffs.push(value*-1)})
        assert.equal(false, main.isMajorScale(diffs));
    });
  });

  describe('#extractDifferentHands()', function() {
    it('should return empty array when passed nothing', function() {
        var playedNotes = []
        assert.equal(0, extractDifferentHands(playedNotes).handOne.length);
        assert.equal(0, extractDifferentHands(playedNotes).handTwo.length);
    });
  });

  describe('#extractDifferentHands()', function() {
    it('should return single array when passed one note', function() {
        var playedNotes = [];
        playedNotes.push(played1);
        assert.equal(1, extractDifferentHands(playedNotes).handOne.length);
        assert.equal(0, extractDifferentHands(playedNotes).handTwo.length);
    });
  });

  describe('#extractDifferentHands()', function() {
    it('should return double array when passed two notes far apart', function() {
        var playedNotes = [];
        playedNotes.push(played1);
        playedNotes.push(played3);
        assert.equal(1, extractDifferentHands(playedNotes).handOne.length);
        assert.equal(1, extractDifferentHands(playedNotes).handTwo.length);
        
    });
  });

  describe('#extractDifferentHands()', function() {
    it('should cope with intermingled hands', function() {
        var playedNotes = [];
        playedNotes.push(played1);
        playedNotes.push(played3);
        playedNotes.push(played4);
        playedNotes.push(played2);
        assert.equal(2, extractDifferentHands(playedNotes).handOne.length);
        assert.equal(2, extractDifferentHands(playedNotes).handTwo.length);
        assert.deepEqual([played1, played2], extractDifferentHands(playedNotes).handOne);
        assert.deepEqual([played3, played4], extractDifferentHands(playedNotes).handTwo);
        
    });
  });

  describe('#scoreScale()', function() {
    it('should return nothing when sent nothing', function() {
        var playedNotes = [];
        assert.equal(undefined, scoreScale());
    });
  });
  
  describe('#scoreScale()', function() {
    it('should return nothing when sent less than eight notes', function() {
        var playedNotes = [];
        playedNotes.push(played1);
        playedNotes.push(played3);
        playedNotes.push(played4);
        playedNotes.push(played2);
        assert.equal(scoreScale(playedNotes), undefined);
        
    });
  });

  describe('#scoreScale()', function() {
    it('should return nothing when sent more than eight notes in the first hand, but less in the second', function() {
        var playedNotes = [];
        playedNotes.push(played1);
        assert.equal(scoreScale(generateScale(), playedNotes), undefined);
        
    });
  });

  describe('#scoreScale()', function() {
    it('should return score when sent 8 notes in each hand', function() {
        var scaleOfNotes = generateScale();
        var handOne = scaleOfNotes.slice(0, 8)
        var handTwo = scaleOfNotes.slice(8)  
      
        assert.notEqual(scoreScale(handOne, handTwo), undefined);
        
    });
  });

  describe('#scoreScale()', function() {
    it('should return a better score when more accurate', function() {
        var scaleOfNotes = generateScale();
        var handOne = scaleOfNotes.slice(0, 8);
        var handTwo = scaleOfNotes.slice(8); 
        var score1 = scoreScale(handOne, handTwo);
        handOne[7].start = 70;
        var score2 = scoreScale(handOne, handTwo);
        assert(score1.total > score2.total);
        
    });
  });

  describe('#scoreScale()', function() {
    it('should return a better score when quicker', function() {
        var scaleOfNotes = generateScale();
        var handOne = scaleOfNotes.slice(0, 8);
        var handTwo = scaleOfNotes.slice(8); 
        var score1 = scoreScale(handOne, handTwo);
        handOne.forEach(el => el.start *= 2);
        var score2 = scoreScale(handOne, handTwo);
        assert(score1.total > score2.total);
        
    });
  });
  
});