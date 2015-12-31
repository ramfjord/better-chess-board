# Better Chess Board

The goal of this short javascipt chess app is to show new players what to look for on the board.  There is no engine attached, it just adds notation to the board to help show which squares are attacked by which pieces.

To see what the current (crappy) board/attacker notation looks like, see screenshot.png in the root dir of this project.

Currently the board needs to start off with some html.  To use the board yourself, you need to install ruby and sinatra and run

    ruby server.rb

Sinatra will tell you the port it's running on (default 4567).

# Documentation

Right now this is a small project, so for now I'm keeping the docs in one place.

the `pieces` namespace exposes constructors for each of the pieces.  There is a lower case constructor function for each piece type, and each takes a color argument (either board.LIGHT or board.DARK).

    pieces.knight(board.LIGHT); // returns a new knight (not placed anywhere on the baord)

Although no classical inheritance is used for the pieces, a piece is expected to implement the following methods.  None of these should be called directly - moves should take place from the baord object.

    .square()                      // returns the square (see below) the piece is currently on (may be undefined)
    .color()                       // the color of the piece (board.LIGHT or board.DARK)
    .image_url()                   // the location of the image for the piece
    .attacks(square = this.square) // the squares the piece is attacking/defending from square.  
    .moves(square = this.square)   // the squares this piece has available as moves from square
    .place(square)                 // sets the square to the argument.

the `board` namespace exposes constants, general purpose methods, and the `.get` method to look at specific squares

    .init()               // initializes a default board
    .$get()               // returns jQuery DOM elt
    .get(pgn_code)        // returns the square for a pgn_code (eg 'e4')
    .get(rank, file)      // returns the square on a given rank,file.  'a1' is 0,0 and 'h8' is 7,7
    .pgn_code(rank, file) // returns the pgn code for a rank, file argument

the `square` object contains methods for placing and picking up pieces

    .$get()  // returns jQuery DOM elt
    .rank()  // rank
    .file()  // file
    .color() // color of square (either board.LIGHT or board.DARK)
    .piece() // the piece on this square, if any

square's also have methods with the logic for moving pieces.  These are the only methods that should really be called for moving pieces, because they recalculate and re-mark all of the attacked squares upon use

    .place(piece) // puts a piece on the given square (this calls piece.place, and should be called instead of piece.place).  This method also binds all of the callbacks for a piece in the DOM, allowing it to be moved with the mouse (see bind_piece_callbacks).
    .pick_up()    // picks up the piece (if any) on a square, and clears it.
    .clear()      // removes any piece on this square

# TODO

Roughly prioritized list

* When you are moving a piece, updated the attacked squares as if you've moved it to the square you're hovering over
* Add FEN parser/generator
* Add pgn notation parser/generator
* Keep track of move history
  * Undo button
* Add board flip animations
* Indicate multiple attackers in case of "batteries", by which I mean a queen backing up a bishop, or rooks piling on the same file, or even a bishop defending a pawn.  In the last case, one of the pawns attack squares should also show as attacked by the bishop.
* Move all board creation logic into board.init(), so I don't have to have this simple sinatra backend
* Add tests
* Add pgn/fen display
* Make prettier/more functional markers for which pieces are attacking which squares
* Add minified single js + css file for usage
