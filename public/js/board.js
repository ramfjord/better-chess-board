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

    var attacking = [];
    // mark all squares attacked by the piece in that square
    that.mark_attacking = function() {
      var now_attacking = (piece && piece.attacks()) || [];
      var me = this;
      _(_.difference(now_attacking, attacking)).forEach(function(sq) { sq.add_attacker(me) });
      _(_.difference(attacking, now_attacking)).forEach(function(sq) { sq.remove_attacker(me) });
      attacking = now_attacking;
    };

    // clears a square on the board, removing any pieces and recalculating attacks
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

    // remove a piece from the board, returning it and marking it as held.
    // Recalculate all the attacks that were affected by removing the piece as
    // well.
    that.pick_up = function() {
      held_piece = piece; // board global
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

    var bind_piece_callbacks = function() {
      // save scope objects for the callback functions - the callbacks use apply,
      // so they don't have the same scope as the function that creates them
      var scope = this
        , orig_square = that
        , my_board = board
        , my_piece = piece
        , my_place = function(sq) {
            $('.square.valid-move').removeClass('valid-move');
            $('.square').off('mouseup');
            $(document).off('mousemove');
            $('.board').off('mouseleave');
            $('#held_piece').remove();
            sq.place(held_piece);
            held_piece = null;
        };

      this.$get().on('mousedown', function(e1) {

        held_piece = my_piece;
        // mark the squares you can move to
        _(my_piece.moves()).forEach(function(sq) {
          sq.$get().addClass('valid-move');
        });

        // pick the piece up and mark it is held
        scope.pick_up();

        // keep the piece next to the mouse when you move it
        my_board.$get().append('<img id=held_piece src="' + my_piece.image_url() + '" ' + 
          'style="left:' + e1.pageX + 'px; top:' + e1.pageY + 'px; z-index: 10;">');

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

        // we can no longer lift up this piece on this square...
        $(this).off('mousedown');
      });
    }

    var attackers = {};
    that.add_attacker = function(square) {
      attackers[square.pgn_code()] = square;
      display_attackers();
    }

    that.remove_attacker = function(square) {
      delete attackers[square.pgn_code()];
      display_attackers();
    }

    var display_attackers = function() {
      var colors = [ 'transparent'
                   , 'hsla(60, 100%,35%,1)'
                   , 'hsla(86,100%,48%,1)'
                   , 'hsla(116,100%,38%,1)'
                   , 'hsla(180,50%,45%,1)'
                   , 'hsla(210,50%,45%,1)'
                   , 'hsla(240,50%,45%,1)'
                   , 'hsla(270,50%,45%,1)'
                   , 'hsla(300,50%,45%,1)'
                   , 'hsla(330,50%,45%,1)'
                   , 'hsla(0,50%,45%,1)' ]
      var num_dark = 0, num_light = 0;
      _.forEach(attackers, function (a) {
        if (a.piece().color() == board.LIGHT) {
          num_light += 1;
        }
        else {
          num_dark += 1;
        }
      });

      var col_light = (num_light >= colors.length) ? _.last(colors) : colors[num_light]
        , col_dark  = (num_dark >= colors.length)  ? _.last(colors) : colors[num_dark];

      var $attackers = that.$get().children('.attackers')
      $attackers.css('border-top-color', col_dark);
      $attackers.css('border-right-color', col_dark);
      $attackers.css('border-bottom-color', col_light);
      $attackers.css('border-left-color', col_light);
    }

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

    for(var f = 0; f < 8; f++) {
      for(var r = 2; r < 6; r++) {
        this.get(r, f).clear();
      }
    }
  };

  return __;
})();
