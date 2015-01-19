// The board is basically a 2d array of squares
var board = (function() {
  "use strict";
  var __ = {}
    , held_piece
    , candidate_square
  ;

  __.$get = function() { return $('.board'); };

  __.DARK  = "d";
  __.LIGHT = "l";

  __.pgn_code = function(rank, file) {
    return String.fromCharCode("a".charCodeAt() + file) + (rank + 1);
  }

  var square = function(rank, file) {
    var piece = null
      , color = ((rank + file) % 2 == 0) ? __.DARK : __.LIGHT
      , selector = "div.square:eq(" + (((7 - rank) * 8) + file) + ")"

      , that = {
          rank:     function() { return rank; },
          file:     function() { return file; },
          piece:    function() { return piece; },
          color:    function() { return color; },
          pgn_code: function() { return __.pgn_code(rank, file); }
    };

    that.$get = function() {
      return $(selector);
    };

    that.$attacked_squares = function() {
      return $(".attacker[data-square=" + this.pgn_code() + "]")
    }

    // mark all squares attacked by the piece in that square
    that.mark_attacked_squares = function() {
      this.$attacked_squares().remove();
      var my_pgn = this.pgn_code();
      if(piece) {
        _(piece.attacks()).forEach(function(sq) {
          sq.$get().append('<div class="attacker" ' + 
                           'data-square="' + my_pgn + '"' +
                           'data-piece="' + piece.pgn_code() + '"' +
                           'data-color="' + piece.color() + '"></div>');
        });
      }
    };

    // recalculate all of the attack squares for everything previously attacking
    // "that" square
    var recalculate_attackers = function() {
      _(that.$get().children(".attacker")).forEach( function($square) {
        var square_pgn = $($square).data().square;
        board.get(square_pgn).mark_attacked_squares();
      });
    };

    that.clear = function() {
      if(piece) {
        this.$get().children("img").remove();
        piece = null;

        this.$attacked_squares().remove();
        recalculate_attackers();
      }
    };

    // remove a piece from the board, returning it.  Recalculate all the attacks
    // that were affected by removing the piece as well.
    that.pick_up = function() {
      held_piece = piece; // board global
      this.clear();
      return held_piece;
    };

    var bind_piece_callbacks = function() {
      // save scope objects for the callback functions - the callbacks use apply,
      // so they don't have the same scope as the function that creates them
      var scope = this
        , orig_square = that
        , my_board = board
        , my_piece = piece
        , my_place = function(sq) {
            $('.square.valid-move').removeClass('valid-move');
            $('.square').off();
            $(document).off('mousemove');
            $('.board').off('mouseleave');
            $('#held_piece').remove();
            sq.place(held_piece);
            held_piece = null;
        };

      this.$get().children("img").on('mousedown', function(e1) {
        // mark the squares you can move to
        _(piece.moves()).forEach(function(sq) {
          sq.$get().addClass('valid-move');
        });

        // pick the piece up
        scope.pick_up.apply(scope);
        my_board.$get().append('<img id=held_piece src="' + held_piece.image_url() + '" ' + 
          'style="left:' + e1.pageX + 'px; top:' + e1.pageY + 'px; z-index: 10;">');

        // keep the piece next to the mosue when you move it
        $(document).on('mousemove', function(e) {
          $('#held_piece').css({left: e.pageX, top: e.pageY })
        });

        // place the piece if you drop it on a square it can move to
        $('.square.valid-move').on('mouseup', function() {
          var sq = my_board.get($(this).data().pgn);
          my_place(sq);
        });

        // if you drag the piece off the board, just return it
        $('.board').on('mouseleave', function() {
          my_place(orig_square);
        });

        // if you mouseup on a square that's not a valid move, put the piece back
        $('.square:not(.valid-move)').on('mouseup', function() {
          my_place(orig_square);
        });
      });
    }

    // Place a piece on the board, recalculating all the attacks that affect
    // that square
    that.place = function(new_piece) {
      this.clear();
      piece = new_piece;

      if (piece) {
        piece.place(this);
        this.$get().append("<img src=\"" + piece.image_url() + "\">");
        recalculate_attackers();
        this.mark_attacked_squares();

        bind_piece_callbacks.apply(this);
      }
    };

    return that;
  };

  var file_pgn = function(file) {
    return String.fromCharCode('a'.charCodeAt() + file);
  };

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
  };

  return __;
})();
