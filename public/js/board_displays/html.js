var Display = {
  board: function() { return $('.board'); },

  squares: function() {
    return $('.squares');
  },

  get_square: function(rank, file) {
    return $("div.square:eq(" + (((7 - rank) * 8) + file) + ")");
  },

  // returns the piece added
  place_piece: function(square, piece) {
    this.get_square(square.rank(), square.file()).append("<img src=\"" + piece.image_url() + "\">");
  },

  // returns the piece removed
  remove_piece: function(square) {
    this.get_square(square.rank(), square.file()).children("img").remove();
  }
}
