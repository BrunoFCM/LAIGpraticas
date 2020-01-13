/* placePieceX(+Board, +Player, +Xcoordinate, +Ycoordinate, +IsDiag, -NewBoard) */
/* placePieceY(+Column, +Player, +Ycoordinate, +IsDiag, -NewColumn) */
/* These two predicates are used in tandem to place a piece of the given player on the board at the given coordinates; */
/* they are used for both regular pieces and diagonal connectors, since the only difference is on the stopping criteria, */
/* and the IsDiag variable is used to indicate this. A yes return means successful placement, and a no means an invalid placement. */
placePieceY([0 | RemColumn], Player, 1, 0, [Player | RemColumn]).

placePieceY([ _ | RemColumn], Player, 1, 1, [Player | RemColumn]).

placePieceY(_, _, 1, _, _):-
    !, fail.

placePieceY([CurrentSpace | RemColumn], Player, Ynum, IsDiag, [CurrentSpace | RetColumn]):-
    Ynum2 is Ynum - 1,
    placePieceY(RemColumn, Player, Ynum2, IsDiag, RetColumn).


placePieceX([CurrentColumn | RemBoard], Player, 1, Ynum, IsDiag, [RetColumn | RemBoard]):-
    !,
    placePieceY(CurrentColumn, Player, Ynum, IsDiag, RetColumn).

placePieceX([CurrentColumn | RemBoard], Player, Xnum, Ynum, IsDiag, [CurrentColumn | RetBoard]):-
    Xnum2 is Xnum - 1,
    placePieceX(RemBoard, Player, Xnum2, Ynum, IsDiag, RetBoard).


/* checkPieceX(+Board, +Player, +Xcoordinate, +Ycoordinate) */
/* checkPieceY(+Column, +Player, +Ycoordinate) */
/* These two predicates are used in tandem to check if there is a piece of the given player on the given coordinates of the board; */
/* yes and no is returned accordingly. */
checkPieceY([Player | _ ], Player, 1).
checkPieceY(_, _, 1):-
    !, fail.
checkPieceY([ _ | RemColumn], Player, Ynum):-
    Ynum2 is Ynum - 1,
    checkPieceY(RemColumn, Player, Ynum2).

checkPieceX([Column | _ ], Player, 1, Ynum):-
    !, checkPieceY(Column, Player, Ynum).
checkPieceX([ _ | RemBoard], Player, Xnum, Ynum):-
    Xnum2 is Xnum - 1,
    checkPieceX(RemBoard, Player, Xnum2, Ynum).


/* connectDiag(+Board, +Diags, +Player, +Xtile, +Ytile, +Xbridge, +Ybridge, -NewDiags) */
/* Checks if a diagonal connection is to be made via the bridging space at the bridge coordinates and places it. */

connectDiag(Board, Diags, Player, Xtile, Ytile, Xbridge, Ybridge, NewDiags):-
    checkPieceX(Board, Player, Xtile, Ytile),
    !, placePieceX(Diags, Player, Xbridge, Ybridge, 1, NewDiags).

connectDiag(_, Diags, _, _, _, _, _, Diags).


/* connectDiags(+Board, +Diags, +Player, +Xcoordinate, +Ycoordinate, -NewDiags) */
/* Checks all diagonal directions of a given tile for possible connections to be made. */
/* There are several unique cases that require special attention, all related with being at the edges of the board. */

connectDiags(Board, Diags, Player, 1, 1, NewDiags):-
    connectDiag(Board, Diags, Player, 2, 2, 1, 1, NewDiags).
connectDiags(Board, Diags, Player, 1, 8, NewDiags):-
    connectDiag(Board, Diags, Player, 2, 7, 1, 7, NewDiags).
connectDiags(Board, Diags, Player, 8, 1, NewDiags):-
    connectDiag(Board, Diags, Player, 7, 2, 7, 1, NewDiags).
connectDiags(Board, Diags, Player, 8, 8, NewDiags):-
    connectDiag(Board, Diags, Player, 7, 7, 7, 7, NewDiags).

connectDiags(Board, Diags, Player, Xnum, 1, NewDiags):-
    XnumDec is Xnum - 1,
    XnumInc is Xnum + 1,
    connectDiag(Board, Diags, Player, XnumDec, 2, XnumDec, 1, NewD1),
    connectDiag(Board, NewD1, Player, XnumInc, 2, Xnum, 1, NewDiags).
connectDiags(Board, Diags, Player, Xnum, 8, NewDiags):-
    XnumDec is Xnum - 1,
    XnumInc is Xnum + 1,
    connectDiag(Board, Diags, Player, XnumDec, 7, XnumDec, 7, NewD1),
    connectDiag(Board, NewD1, Player, XnumInc, 7, Xnum, 7, NewDiags).
connectDiags(Board, Diags, Player, 1, Ynum, NewDiags):-
    YnumDec is Ynum - 1,
    YnumInc is Ynum + 1,
    connectDiag(Board, Diags, Player, 2, YnumDec, 1, YnumDec, NewD1),
    connectDiag(Board, NewD1, Player, 2, YnumInc, 1, Ynum, NewDiags).
connectDiags(Board, Diags, Player, 8, Ynum, NewDiags):-
    YnumDec is Ynum - 1,
    YnumInc is Ynum + 1,
    connectDiag(Board, Diags, Player, 7, YnumDec, 7, YnumDec, NewD1),
    connectDiag(Board, NewD1, Player, 7, YnumInc, 7, Ynum, NewDiags).
    
    
connectDiags(Board, Diags, Player, Xnum, Ynum, NewDiags):-
    XnumDec is Xnum - 1,
    XnumInc is Xnum + 1,
    YnumDec is Ynum - 1,
    YnumInc is Ynum + 1,
    connectDiag(Board, Diags, Player, XnumDec, YnumDec, XnumDec, YnumDec, NewD1),
    connectDiag(Board, NewD1, Player, XnumDec, YnumInc, XnumDec, Ynum, NewD2),
    connectDiag(Board, NewD2, Player, XnumInc, YnumDec, Xnum, YnumDec, NewD3),
    connectDiag(Board, NewD3, Player, XnumInc, YnumInc, Xnum, Ynum, NewDiags).


/* checkCutsX(+OldDiags, +NewDiags, +X, +Y, -Cut) */
/* checkCutsY(+OldCol, +NewCol, +X, +Y, -Cut) */
/* These two predicates are used in tandem to compare two arrays of diagonal connection tiles; */
/* a difference means a cut was made. (X and Y are used only for the recursion and indicate nothing) */

checkCutsY([1 | _], [2 | _], _, _, 1).
checkCutsY([2 | _], [1 | _], _, _, 1).
checkCutsY(_, _, 1, 1, 0).
checkCutsY( _, _, _, 1, _):-
    !, fail.
checkCutsY([ _ | OldCol], [ _ | NewCol], Xnum, Ynum, Cut):-
    Ynum2 is Ynum - 1,
    checkCutsY(OldCol, NewCol, Xnum, Ynum2, Cut).

checkCutsX([OldCol | _], [NewCol | _], Xnum, Ynum, Cut):-
    checkCutsY(OldCol, NewCol, Xnum, Ynum, Cut).
checkCutsX([_ | OldDiags], [_ | NewDiags], Xnum, Ynum, Cut):-
    Xnum2 is Xnum - 1,
    checkCutsX(OldDiags, NewDiags, Xnum2, Ynum, Cut).



/* A small issue of X and Y being the wrong way around arised, and due to a lack of time, all Xs and Ys above this line are swapped */

/* executePlay(+Board, +Player, +Xcoordinate, +Ycoordinate, -NewBoard, -Cut) */
/* Places a tile on the board and and enacts all subsequent consequences, and informs the caller on whether a cut was made. */

executePlay([Board, Diags], Player, Xnum, Ynum, [RetBoard, RetDiags], Cut):-
    placePieceX(Board, Player, Ynum, Xnum, 0, RetBoard),
    connectDiags(Board, Diags, Player, Ynum, Xnum, RetDiags),
    checkCutsX(Diags, RetDiags, 7, 7, Cut).

/* updateTurnState(+Turns, +Cut, -NewTurns) */
/* Determines the amount of remaining moves each player has, depending on whether there was a cut. */
updateTurnState([ _, 0], 1, [ 0, 2]).
updateTurnState([ 0, _], 1, [ 2, 0]).
updateTurnState([ 2, 0], 0, [ 1, 0]).
updateTurnState([ 0, 2], 0, [ 0, 1]).
updateTurnState([ 1, 0], 0, [ 0, 1]).
updateTurnState([ 0, 1], 0, [ 1, 0]).

/* getCurrentPlayer(+Turns, -CurrentPlayer) */
/* Reads the turn list and determines who plays next. */
getCurrentPlayer([ _, 0], 1).
getCurrentPlayer([ 0, _], 2).

/* opponent(+Player, -Opponent) */
/* Determines the identifier for a given Player's Opponent */
opponent(1,2).
opponent(2,1).