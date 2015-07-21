var svgHelper = {
  makeSvg: function(svg_inner, klass) {
    return '<svg width="100%" height="100%" viewBox="0 0 100 100"' +
                'xmlns="http://www.w3.org/2000/svg" class="'+klass+'">' + 
              svg_inner +
           '</svg>';
  }
};

Overlay.hanging_pieces = {
  init: function() {
    this.update()
  },

  update: function() {
    var squares = board.squares();

    for(var rank = 0; rank < 8; rank++) {
      for(var file = 0; file < 8; file++) {
        var sq = squares[rank][file];

        if (this.isHanging(sq)) {
          this.markHanging(sq.$get());
        } else {
          this.clearHanging(sq.$get());
        }
      }
    }
  },

  clear: function() {
    this.clearHanging(board.display().board())
  },

  attacker_counts: Overlay.all_attacks.attacker_counts,

  isHanging: function(square) {
    if (!square.piece()) {
      return false;
    }

    var atk_counts = this.attacker_counts(square);

    if (square.piece().color() == board.DARK) {
      atk_counts.reverse();
    }

    return (atk_counts[0] < atk_counts[1]);
  },

  markHanging: function($square) {
    if ($square.find('.hanging').size() == 0) {
      $square.append(svgHelper.makeSvg(
        "<circle cx=50 cy=50 r=28 fill=none stroke=red stroke-width=9 stroke-opacity=0.5>",
        "hanging"
      ));
    }
  },

  clearHanging($elt) {
    $elt.find('.hanging').remove()
  }
}
