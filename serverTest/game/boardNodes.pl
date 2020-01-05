:-ensure_loaded('gameLogicLists.pl').

/*------------------------------------------------------------------------------------------------------*/

find([Element|_], 1, Element).

find([_|Row], X, Value):-
    X > 1,
    Xn is X - 1,
    find(Row, Xn, Value).

find([Row|_], X, 1, Value):-
    find(Row, X, Value).

find([_|BoardPieces], X, Y, Value):-
    Y > 1,
    Y < 9,
    X > 0,
    X < 9,
    Yn is Y - 1,
    find(BoardPieces, X, Yn, Value).

/*------------------------------------------------------------------------------------------------------*/

getStartingHorizontal([2|_], 1).

getStartingHorizontal([_|Row], X):-
    getStartingHorizontal(Row, Xn),
    X is Xn + 1.

getStartingVertical([[1|_]|_], 1).

getStartingVertical([_|BoardPieces], Y):-
    getStartingVertical(BoardPieces, Yn),
    Y is Yn + 1.

getStartingPoints([[Row|_], _], Points, 2):-
    findall(X, getStartingHorizontal(Row, X), XValues),
    makePointList(XValues, 1, Points).


getStartingPoints([BoardPieces, _], Points, 1):-
    findall(Y, getStartingVertical(BoardPieces,Y), YValues),
    makePointList(1, YValues, Points).

/*------------------------------------------------------------------------------------------------------*/

isAdjacent([X,Y], [X,Ya]):-
    Ya is Y + 1.

isAdjacent([X,Y], [X,Ya]):-
    Ya is Y - 1.

isAdjacent([X,Y], [Xa,Y]):-
    Xa is X + 1.

isAdjacent([X,Y], [Xa,Y]):-
    Xa is X - 1.

/*------------------------------------------------------------------------------------------------------*/

isValidAdjacent([BoardPieces,_], Player, Point, [Xadjacent,Yadjacent]):-
    isAdjacent(Point, [Xadjacent,Yadjacent]),
    find(BoardPieces, Xadjacent, Yadjacent, Player).

getAdjacents(GameState, Player, Point, Adjacents):-
    findall(Adjacent, isValidAdjacent(GameState, Player, Point, Adjacent), Adjacents).

isDiagonal([X,Y], [X,Y], [Xp,Yp]):-
    Xp is X + 1,
    Yp is Y + 1.

isDiagonal([X,Y], [X,Yp], [Xp,Yp]):-
    Xp is X + 1,
    Yp is Y - 1.

isDiagonal([X,Y], [Xp,Yp], [Xp,Yp]):-
    Xp is X - 1,
    Yp is Y - 1.

isDiagonal([X,Y], [Xp,Y], [Xp,Yp]):-
    Xp is X - 1,
    Yp is Y + 1.

/*----------------------------------------------------------------------------*/

checkForEmpty([0|_], 1).

checkForEmpty([0|_], 0).

checkForEmpty([_|Row], X):-
    X >= 0,
    Xn is X - 1,
    checkForEmpty(Row, Xn).

checkForEmpty([Row|_], X, 1):-
    checkForEmpty(Row,X).

checkForEmpty([Row|_], X, 0):-
    checkForEmpty(Row,X).

checkForEmpty([_|BoardPieces], X, Y):-
    Y >= 0,
    Yn is Y - 1,
    checkForEmpty(BoardPieces, X, Yn).

/*----------------------------------------------------------------------------*/

isUnbreakableDiagonal([BoardPieces, BoardConnections], Player, Point, [Xdiagonalpoint,Ydiagonalpoint]):-
    isDiagonal(Point, [Xconnect, Yconnect],[Xdiagonalpoint,Ydiagonalpoint]),
    find(BoardConnections, Xconnect, Yconnect, Player),
    find(BoardPieces, Xdiagonalpoint, Ydiagonalpoint, Player),
    \+(checkForEmpty(BoardPieces, Xconnect,Yconnect)).

getDiagonals(GameState, Player, Point, Diagonals):-
    findall(Diagonal, isUnbreakableDiagonal(GameState, Player, Point, Diagonal), Diagonals).

/*------------------------------------------------------------------------------------------------------*/

findAllEmpty(BoardPieces, Points):-
    findAllEmpty(BoardPieces, 1, 1, Points), !.

findAllEmpty(_, _, 9, []).

findAllEmpty([Row|BoardPieces], X, Y, Points):-
    findAllEmpty(Row, X, XValues),
    makePointList(XValues, Y, RowPoints),
    Yn is Y + 1,
    findAllEmpty(BoardPieces, X, Yn, ExtraPoints),
    append(RowPoints, ExtraPoints, Points).

findAllEmpty(_, 9, []).

findAllEmpty([0|Row], X, [X|XValues]):-
    Xn is X + 1,
    findAllEmpty(Row, Xn, XValues).

findAllEmpty([_|Row], X, XValues):-
    Xn is X + 1,
    findAllEmpty(Row, Xn, XValues).