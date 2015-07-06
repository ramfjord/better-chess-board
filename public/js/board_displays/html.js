BOARD_DISPLAYS = { "html" : {
  get_board: function() { return $('.board'); },

  get_square: function(rank, file) {
    return $("div.square:eq(" + (((7 - rank) * 8) + file) + ")");
  },

  bind_piece_callbacks: function() {
    // save scope objects for the callback functions - the callbacks use apply,
    // so they don't have the same scope as the function that creates them
    var square = this
      , my_place = function(sq) {
        $('.square.valid-move').removeClass('valid-move');
        $('.square').off('mouseup');
        $(document).off('mousemove');
        $('.board').off('mouseleave');
        $('#held_piece').remove();
        sq.place_held_piece();
      };

    this.$get().on('mousedown', function(e1) {
      // pick the piece up and mark it is held
      var piece = square.pick_up();

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
        my_place(sq);
      });

      // if you drag the piece off the board, just return it
      $('.board').on('mouseleave', function() {
        my_place(square);
      });

      // if you mouseup on a square that's not a valid move, put the piece back
      $('.square:not(.valid-move)').on('mouseup', function() {
        my_place(square);
      });

      // we can no longer lift up this piece on this square...
      $(this).off('mousedown');
    });
  }
} }
