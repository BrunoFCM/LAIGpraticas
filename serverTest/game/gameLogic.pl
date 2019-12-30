:-ensure_loaded('gameLogicLists.pl').
:-ensure_loaded('boardNodes.pl').

:- dynamic(visited/2).

/*------------------------------------------------------------------------------------------------------*/

visitPoint(GameState, Player, [Xpoint,Ypoint], ExtraPoints):-
    \+(visited(Xpoint,Ypoint)),
    asserta(visited(Xpoint,Ypoint)),
    getAdjacents(GameState, Player, [Xpoint,Ypoint], Adjacents),
    getDiagonals(GameState, Player, [Xpoint,Ypoint], Diagonals),
    append(Adjacents,Diagonals, ExtraPoints).

/*------------------------------------------------------------------------------------------------------*/

visitPoints(_, 1, [[8,_]|_]).

visitPoints(_, 2, [[_,8]|_]).

visitPoints(GameState, Player, [Point|Points]):-
    visitPoint(GameState, Player, Point, ExtraPoints),
    append(Points, ExtraPoints, NewPoints),
    !,
    visitPoints(GameState, Player, NewPoints).

visitPoints(GameState, Player, [_|Points]):-
    !,
    visitPoints(GameState, Player, Points).

visitPoints(_, _, []):-
    !, fail.

/*------------------------------------------------------------------------------------------------------*/

checkGameEnd(GameState, Player):-
    getStartingPoints(GameState, Points, Player),
    !,    
    retractall(visited(_,_)),
    visitPoints(GameState, Player, Points),
    retractall(visited(_,_)).
