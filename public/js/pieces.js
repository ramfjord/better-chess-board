var pieces = (function() {
  "use strict";
  var __ = {};

  var piece = function (pgn_code, move_func, color) {
    var that = {}
      , square = undefined
      , color = (color || board.LIGHT)
    ;

    that.square = function() { return square };

    that.pgn_code = function() { return pgn_code };

    that.color = function() { return color };

    that.image_url = function() {
      return "images/pieces/" + this.pgn_code() + "_" + this.color() + ".svg";
    };

    that.attacks = function() {
      var sq = arguments[0] || this.square();

      if(typeof sq === 'string') {
        sq = board.get(sq);
      }

      if (!sq) {
        return [];
      }

      return move_func.apply(this, [sq]);
    };

    that.moves = function() {
      var sq = arguments[0] || this.square();
      var attacked_squares = that.attacks(sq);
      _.remove(attacked_squares, function(sq) {
        return sq.piece() && (sq.piece().color() == this.color());
      }, this);

      return attacked_squares;
    };

    that.place = function(dest) {
      if (typeof dest == 'string')
        square = board.get(dest);
      else 
        square = dest;
    };

    return that;
  };

  var move_to_positions = function(relative_positions) {
    return function(square) {
      var r = square.rank(), f = square.file();
      return _.chain(relative_positions)
              .map(function(dr_f) {
                return board.get(r + dr_f[0], f + dr_f[1])
              }).compact().value();
    }
  }

  var king_moves = move_to_positions([[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]);
  __.king = function(color) {
    var that = piece("k", king_moves, color);
    return that;
  };

  var knight_moves = move_to_positions([[-2,-1],[-2,1],[-1,2],[1,2],[2,1],[2,-1],[1,-2],[-1,-2]]);
  __.knight = function(color) {
    var that = piece("n", knight_moves, color);
    return that;
  };

  // helper method for queen, bishop, and rook, all of which can move in a direction until
  // they hit a piece
  var move_in_directions = function(directions) {
    return function(square) {
      var valid_squares = [];

      _(directions).forEach (function (dr_f) {
        for(var i = 1; i < 8; i++) {
          var sq = board.get(square.rank() + i*dr_f[0], square.file() + i*dr_f[1]);

          if (sq === undefined) {
            break;
          }

          valid_squares.push(sq);

          if (sq.piece()) {
            break;
          }
        }
      });
      return valid_squares;
    };
  };

  var bishop_moves = move_in_directions([[-1,-1], [-1,1], [1,1], [1,-1]]);
  __.bishop = function(color) {
    var that = piece("b", bishop_moves, color);
    return that;
  };

  var rook_moves = move_in_directions([[-1,0], [0,1], [1,0], [0,-1]]);
  __.rook = function(color) {
    var that = piece("r", rook_moves, color);
    return that;
  };

  var queen_moves = move_in_directions([[-1,0], [0,1], [1,0], [0,-1], [-1,-1], [-1,1], [1,1], [1,-1]]);
  __.queen = function(color) {
    var that = piece("q", queen_moves, color);
    return that;
  };

  var pawn_moves = function(square) {
    var valid_squares = [], sq;

    sq = board.get(square.rank());
  }

  __.pawn = function(color) {
    var d_r = (color == board.LIGHT) ? 1 : -1;
    var pawn_attacks = move_to_positions([[d_r,-1],[d_r,1]]);

    var that = piece("p", pawn_attacks, color);

    that.moves = function() {
      var sq = arguments[0] || that.square()
        , valid_squares = [];

      if(typeof sq === 'string') {
        sq = board.get(sq);
      }

      if (!sq) {
        return [];
      }

      // add in attack squares if there's an enemy piece on them
      _([-1,1]).forEach(function(d_f) {
        var move_sq = board.get(sq.rank() + d_r, sq.file() + d_f);
        if (move_sq && move_sq.piece() && move_sq.piece().color() != that.color()) {
          valid_squares.push(move_sq);
        }
      });

      // add in the normal move square if it's not blocked
      var move_sq = board.get(sq.rank() + d_r, sq.file());
      if (move_sq && !move_sq.piece()) {
        valid_squares.push(move_sq);

        if ((sq.rank() == 1 && that.color() == board.LIGHT) || 
            (sq.rank() == 6 && that.color() == board.DARK)) {
          var move_sq  = board.get(sq.rank() + d_r * 2, sq.file())
          if (move_sq && !move_sq.piece()) {
            valid_squares.push(move_sq);
          }
        }
      }

      return valid_squares;
    };

    that.image_url

    return that;
  };

  var fen_map = {
    "p" : [__.pawn   , board.DARK],
    "n" : [__.knight , board.DARK],
    "b" : [__.bishop , board.DARK],
    "r" : [__.rook   , board.DARK],
    "q" : [__.queen  , board.DARK],
    "k" : [__.king   , board.DARK],
    "P" : [__.pawn   , board.LIGHT],
    "N" : [__.knight , board.LIGHT],
    "B" : [__.bishop , board.LIGHT],
    "R" : [__.rook   , board.LIGHT],
    "Q" : [__.queen  , board.LIGHT],
    "K" : [__.king   , board.LIGHT],
  }
  __.from_fen = function(fen_char) {
    var c_c = fen_map[fen_char]
      , constructor = c_c[0]
      , color = c_c[1];
    return constructor(color);
  }

  return __;
})();
