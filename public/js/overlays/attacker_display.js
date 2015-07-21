Overlay.all_attacks = {
  /* Initialize any resources (i.e. DOM elements) you will need here */
  init: function() {
    board.display().squares().append("<div class=attackers></div>");
    this.update();
  },

  /* This will be called every time a move is made */
  update: function() {
    var squares = board.squares();

    for(var rank = 0; rank < 8; rank++) {
      for(var file = 0; file < 8; file++) {
        this.display_attackers(squares[rank][file]);
      }
    }
  },

  /* This should remove any reasources created in init() */
  clear: function() {
    board.display().board().find('.attackers').remove();
  },


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

  display_attackers: function(square) {
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

      , atk_c = this.attacker_counts(square)
      , num_light = atk_c[0]
      , num_dark = atk_c[1]
    

      , col_light = (num_light >= colors.length) ? _.last(colors) : colors[num_light]
      , col_dark  = (num_dark >= colors.length)  ? _.last(colors) : colors[num_dark]
      , $attackers = square.$get().find('.attackers');

    $attackers.css('border-top-color', col_dark);
    $attackers.css('border-right-color', col_dark);
    $attackers.css('border-bottom-color', col_light);
    $attackers.css('border-left-color', col_light);
  }
}
