board.bind_callbacks = function() {
  var piece = null
    , captured_piece = null
    , current_square = null

    , mouse_move = function(to_square) {
        if (to_square.pgn_code() != current_square.pgn_code()) {
          new_captured_piece = to_square.place(piece);
          current_square.place(captured_piece);
          current_square = to_square;
        }
    }

    , mouse_up = function(square, piece) {
        mouse_move(square);
        $('.square.valid-move').removeClass('valid-move');
        $('.square').off('mouseup');
        $('.square').off('mouseenter');
        $(document).off('mousemove');
        $('.board').off('mouseleave');
        $('#held_piece').remove();
        square.place(piece);
    }

    , mouse_down = function(square, e1) {
      piece = square.piece();
      current_square = square;

      // don't bind any events if there is no piece on this square
      if (!piece) { return ; }

      // mark the squares you can move to
      _(piece.moves()).forEach(function(sq) {
        sq.$get().addClass('valid-move');
      });

      // keep the piece next to the mouse when you move it
      board.$get().append('<img id=held_piece src="' + piece.image_url() + '" ' + 
        'style="left:' + e1.pageX + 'px; top:' + e1.pageY + 'px; z-index: 10;">');

      $(document).on('mousemove', function(e) {
        $('#held_piece').css({left: e.pageX, top: e.pageY })
      });

      // place the piece if you drop it on a square it can move to
      $('.square.valid-move').on('mouseup', function() {
        var sq = board.get($(this).data().pgn);
        mouse_up(sq, piece);
      });

      // update the display as if a piece was placed before making a move.
      $('.square').on('mouseenter', function() {
        if ($(this).hasClass('valid-move')) {
          var to_square = board.get($(this).data().pgn);
        } else {
          var to_square = square;
        }
        mouse_move(to_square);
      });

      // if you drag the piece off the board, just return it
      $('.board').on('mouseleave', function() {
        mouse_up(square, piece);
      });

      // if you mouseup on a square that's not a valid move, put the piece back
      $('.square:not(.valid-move)').on('mouseup', function() {
        mouse_up(square, piece);
      });
    };
  board.eachSquare(function(square) {
    square.$get().on('mousedown', function(e1) { mouse_down(square, e1) });
  });
}
