// The board is basically a 2d array of squares
var board = (function() {
  "use strict";
    // board private variables
  var display = Display
    , overlay = Overlay.none
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

  __.init = function() {
    this.get('a1').place(pieces.rook(this.LIGHT));
    this.get('h1').place(pieces.rook(this.LIGHT));
    this.get('b1').place(pieces.knight(this.LIGHT));
    this.get('g1').place(pieces.knight(this.LIGHT));
    this.get('c1').place(pieces.bishop(this.LIGHT));
    this.get('f1').place(pieces.bishop(this.LIGHT));
    this.get('d1').place(pieces.queen(this.LIGHT));
    this.get('e1').place(pieces.king(this.LIGHT));

    this.get('a8').place(pieces.rook(this.DARK));
    this.get('h8').place(pieces.rook(this.DARK));
    this.get('b8').place(pieces.knight(this.DARK));
    this.get('g8').place(pieces.knight(this.DARK));
    this.get('c8').place(pieces.bishop(this.DARK));
    this.get('f8').place(pieces.bishop(this.DARK));
    this.get('d8').place(pieces.queen(this.DARK));
    this.get('e8').place(pieces.king(this.DARK));

    for(var f = 0; f < 8; f++) {
      this.get(1,f).place(pieces.pawn(this.LIGHT));
      this.get(6,f).place(pieces.pawn(this.DARK));
    }

    for(var f = 0; f < 8; f++) {
      for(var r = 2; r < 6; r++) {
        this.get(r, f).clear();
      }
    }

    this.bind_callbacks();
    this.set_overlay(Overlay.all_attacks);
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
