// The board is basically a 2d array of squares
var board = (function() {
  "use strict";
  var __ = {} // board object to return

    // board private variables
    , held_piece
    , candidate_square
    , from_square
    , move_history = []

    , board_display = BOARD_DISPLAYS.html

    , attacker_display = basic_attacker_display
  ;

  __.$get = board_display.get_board;

  __.DARK  = "d";
  __.LIGHT = "l";

  __.pgn_code = function(rank, file) {
    return String.fromCharCode("a".charCodeAt() + file) + (rank + 1);
  }

  var square = function(rank, file) {
    var piece = null
      , color = ((rank + file) % 2 == 0) ? __.DARK : __.LIGHT

      , attacking = []
      , attackers = {}

      , bind_piece_callbacks = board_display.bind_piece_callbacks
      , display_attackers = attacker_display.display_attackers

      , that = {
          rank:     function() { return rank; },
          file:     function() { return file; },
          piece:    function() { return piece; },
          color:    function() { return color; },
          pgn_code: function() { return __.pgn_code(rank, file); },
          $get:     function() { return board_display.get_square(rank, file); }
      };

    // mark all squares attacked by the piece in that square
    that.mark_attacking = function() {
      var now_attacking = (piece && piece.attacks()) || [];
      var me = this;
      _(_.difference(now_attacking, attacking)).forEach(function(sq) { sq.add_attacker(me) });
      _(_.difference(attacking, now_attacking)).forEach(function(sq) { sq.remove_attacker(me) });
      attacking = now_attacking;
    };

    // Clears a square on the board, removing any pieces and recalculating attacks
    that.clear = function() {
      if(piece) {
        that.$get().children("img").remove();
        piece = null;

        that.mark_attacking();
        
        // if we're now blocking attacks, mark that
        _(attackers).forEach(function(a) {
          a.mark_attacking();
        });
      }
    };

    // Clears the square, marks the piece that was occupying it as held, and returns
    // the piece now being held
    that.pick_up = function() {
      held_piece = piece; // board global
      from_square = this;
      this.clear();
      return held_piece;
    };

    // Place a piece on the board, recalculating all the attacks that affect
    // that square
    that.place = function(new_piece) {
      this.clear();
      piece = new_piece;

      if (piece) {
        piece.place(this);
        this.$get().append("<img src=\"" + piece.image_url() + "\">");
        this.mark_attacking();

        // if we're now blocking attacks, mark that
        _(attackers).forEach(function(a) {
          a.mark_attacking();
        });

        bind_piece_callbacks.apply(this);
      }
    };

    // Place the piece that is currently being "held" by the game board, if any
    that.place_held_piece = function() {
      that.place(held_piece);
      held_piece = undefined;
    }

    // Tell a square that it is now being attacked by another one
    that.add_attacker = function(square) {
      attackers[square.pgn_code()] = square;
      display_attackers.apply(this, [attackers]);
    }

    // Tell a square that it is no longer being attacked by another one
    that.remove_attacker = function(square) {
      delete attackers[square.pgn_code()];
      display_attackers.apply(this, [attackers]);
    }

    return that;
  };

  var file_pgn = function(file) {
    return String.fromCharCode('a'.charCodeAt() + file);
  };

  // initialize squares.  They do not have to be linked to the DOM yet - but we
  // are assuming we will always use an 8*8 board
  var squares = []
  for(var rank = 0; rank < 8; rank++) {
    squares[rank] = [];
    for(var file = 0; file < 8; file++) {
      squares[rank][file] = square(rank, file);
    }
  }

  __.get = function() {
    // get pgn code
    if (arguments.length == 1) {
      var file = arguments[0][0].charCodeAt() - 'a'.charCodeAt()
        , rank = _.parseInt(arguments[0][1]) - 1

      return this.get(rank, file);

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
  };

  return __;
})();
