Overlay.num_attacks = {
  init: function() {
    board.display().squares().append("<div class=numAttackers></div>");
    this.update();
  },

  update: function() {
    Overlay.base.update_all_squares.call(this, this.display_attackers);
  },

  clear: function() { board.display().board().find('.numAttackers').remove() },

  display_attackers: function(square) {
    var atk_counts = Overlay.base.attacker_counts(square)
      , n_white = atk_counts[0]
      , n_black = atk_counts[1];

    square.$get().find('.numAttackers').html(this.html(n_white, n_black));
  },

  html: function(n_white, n_black) {
    var section = function(isWhite, count) {
      if (count > 0 && isWhite) {
        return "<div class=section><div class=white>" + n_white + "</div></div>";
      }
      if (count > 0 && !isWhite) {
        return "<div class=section><div class=bottom-aligner></div><div class=black>"+n_black+"</div></div>";
      }
      return "<div class=section></div>";
    }

    return "<div class=container>" + section(false, n_black) + section(true, n_white) + "</div>";
  }
}

