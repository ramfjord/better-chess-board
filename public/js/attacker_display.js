basic_attacker_display = {
  display_attackers: function(attackers) {
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
                 , 'hsla(0,50%,45%,1)' ];

    var num_dark = 0, num_light = 0;
    _.forEach(attackers, function (a) {
      if (a.piece().color() == board.LIGHT) {
        num_light += 1;
      }
      else {
        num_dark += 1;
      }
    });

    var col_light = (num_light >= colors.length) ? _.last(colors) : colors[num_light]
      , col_dark  = (num_dark >= colors.length)  ? _.last(colors) : colors[num_dark]
      , $attackers = this.$get().children('.attackers');

    $attackers.css('border-top-color', col_dark);
    $attackers.css('border-right-color', col_dark);
    $attackers.css('border-bottom-color', col_light);
    $attackers.css('border-left-color', col_light);
  }
}
