// The board is basically a 2d array of squares
var board = (function() {
  "use strict";
  // board private variables
  var display = Display
    , overlay = Overlay.base
    , squares = []
  ;

  var getter = function(value) {
    return function() { return value };
  }

  var __ = { // board object to return
    $get : display.board,
    display : getter(display),
    overlay : getter(overlay),
    squares : getter(squares),
    DARK  : "d",
    LIGHT : "l"
  }

  __.set_overlay = function(new_overlay) {
    overlay.clear();
    overlay = new_overlay;
    overlay.init();
    this.overlay = getter(overlay);
  }

  __.pgn_code = function(rank, file) {
    return String.fromCharCode("a".charCodeAt() + file) + (rank + 1);
  }

  __.get = function() {
    // get pgn code
    if (arguments.length == 1) {
      if (typeof arguments[0] == 'string') {
        var file = arguments[0][0].charCodeAt() - 'a'.charCodeAt()
          , rank = _.parseInt(arguments[0][1]) - 1

        return this.get(rank, file);
      }
      else {
        return square;
      }

    // get rank,file
    } else if (arguments.length == 2) {
      var rank = arguments[0], file = arguments[1];
      if (0 <= rank && rank < 8 && 0 <= file && file < 8)
        return squares[rank][file];
    }
    // return undefined by default
  };

  __.eachSquare = function(f) {
    _.forEach(_.flatten(squares), f)
  };

  __.read_fen = function(fen) {
    var parts = fen.split(/\s+/g)
      , rows = parts[0].split('/').reverse();

    for(var rank = 0; rank < 8; rank++) {
      var row = rows[rank];
      for (var file = 0, i = 0, r_len = row.length; i < r_len; i++) {
        var cur = row[i];
        if(cur.match(/[0-9]/)) {
          for (var j = 0, len = parseInt(cur); j < len; j++) {
            this.get(rank, file).clear();
            file += 1;
          }
        } else {
          this.get(rank, file).place(pieces.from_fen(cur));
          file += 1;
        }
      }
    }
  }

  __.init = function() {
    this.read_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    this.bind_callbacks();
    this.set_overlay(Overlay.num_attacks);
  };

  // Initialize squares.  They do not have to be linked to the DOM yet - but we
  // are assuming we will always use an 8*8 board
  for(var rank = 0; rank < 8; rank++) {
    squares[rank] = [];
    for(var file = 0; file < 8; file++) {
      squares[rank][file] = square(__, rank, file);
    }
  }

  return __;
})();
