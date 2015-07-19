board.bind_callbacks = function() {
  var held_piece = null

    , mouse_up = function(square, piece) {
        $('.square.valid-move').removeClass('valid-move');
        $('.square').off('mouseup');
        $(document).off('mousemove');
        $('.board').off('mouseleave');
        $('#held_piece').remove();
        square.place(piece);
        square.$get().on('mousedown', function(e1) { mouse_down(square, e1) });
      }

    , mouse_down = function(square, e1) {
      var piece = square.piece();

      // don't bind any events if there is no piece on this square
      if (!piece) { return ; }

      // mark the squares you can move to
      _(piece.moves()).forEach(function(sq) {
        sq.$get().addClass('valid-move');
      });

      square.clear();

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

      // if you drag the piece off the board, just return it
      $('.board').on('mouseleave', function() {
        mouse_up(square, piece);
      });

      // if you mouseup on a square that's not a valid move, put the piece back
      $('.square:not(.valid-move)').on('mouseup', function() {
        mouse_up(square, piece);
      });

      // we can no longer lift up this piece on this square...
      $(this).off('mousedown');
    };

  board.eachSquare(function(square) {
    square.$get().on('mousedown', function(e1) { mouse_down(square, e1) });
  });
}
