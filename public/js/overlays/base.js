Overlay = {};
/* An empty overlay that does nothing.  It has some useful utility methods
 * that can be copied, or accessed directly as overlays are singletons.
 */

Overlay.base = {
  /* Initialize any resources (i.e. DOM elements) you will need here */
  init: function() {},

  /* This will be called every time a move is made */
  update: function() {},
  
  /* This should remove any reasources created in init() */
  clear: function() {},

  attacker_counts: function(square) {
    var attackers = square.attackers()
      , num_dark = 0, num_light = 0;

    _.forEach(attackers, function (a) {
      if (a.piece().color() == board.LIGHT) {
        num_light += 1;
      }
      else {
        num_dark += 1;
      }
    });

    return [num_light, num_dark];
  },

  // Apply func to each square - func should accept a square as an arg
  update_all_squares: function(func) {
    var squares = board.squares()
      , that = this;
    for(var rank = 0; rank < 8; rank++) {
      for(var file = 0; file < 8; file++) {
        func.call(that, squares[rank][file]);
      }
    }
  }
}
