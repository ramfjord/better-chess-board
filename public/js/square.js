function square(board, rank, file) {
  var piece = null
    , color = ((rank + file) % 2 == 0) ? board.DARK : board.LIGHT
    , pgn_code = board.pgn_code(rank, file)

    , attacking = [] // [ square ]
    , attackers = {} // { pgn_code : square, ... }

    , that = {
        rank:      function() { return rank; },
        file:      function() { return file; },
        piece:     function() { return piece; },
        color:     function() { return color; },
        pgn_code:  function() { return pgn_code; },
        attacking: function() { return _.clone(attacking); },
        attackers: function() { return _.values(attackers); },
        $get:      function() { return board.display().get_square(rank, file); }
    };

  // Resets the attacking squares
  that.reset_attacking = function() {
    _(attacking).forEach(function(a) {
      a.remove_attacker(that);
    });

    attacking = piece ? piece.attacks(this) : [];

    _(attacking).forEach(function(a) {
      a.add_attacker(that);
    });
  }

  // Clears a square on the board, removing any pieces and recalculating attacks
  // returns a piece if one was removed
  that.clear = function() {
    if(piece) {
      piece = null;

      this.reset_attacking();
      
      // recalculate the attacks of any squares that were previously on this one - we
      // may have previously been blocking attacks that can now go through.
      _(attackers).forEach(function(a) {
        a.reset_attacking();
      });

      board.display().remove_piece(that);
      board.overlay().update();

      return piece;
    }
  };

  // Place a piece on the board, recalculating all the attacks that affect
  // that square
  that.place = function(new_piece) {
    this.clear();
    piece = new_piece;

    if (piece) {
      piece.place(this);

      this.reset_attacking();

      // if we're now blocking attacks, mark that
      _(attackers).forEach(function(a) {
        a.reset_attacking();
      });

      board.display().place_piece(this, piece);
      board.overlay().update();
    }

    return piece;
  };

  // Tell a square that it is now being attacked by another one
  that.add_attacker = function(square) {
    attackers[square.pgn_code()] = square;
  };

  // Tell a square that it is no longer being attacked by another one
  that.remove_attacker = function(square) {
    delete attackers[square.pgn_code()];
  };

  return that;
}
