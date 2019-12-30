:-ensure_loaded('nodePaths.pl').
:-ensure_loaded('gameLogic.pl').
:-ensure_loaded('gameLogicLists.pl').
:-ensure_loaded('boardNodes.pl').

/*------------------------------------------------------------------------------------------------------*/

isEmptyList([]).

handlePaths(PlayerPath, OpponentPath, Intersected):-
    intersect(PlayerPath, OpponentPath, Intersected),
    \+isEmptyList(Intersected).

handlePaths(PlayerPath, OpponentPath, PlayerPath):-
    length(PlayerPath, PlayerLength),
    length(OpponentPath, OpponentLength),
    PlayerLength < OpponentLength.

handlePaths(_, OpponentPath, OpponentPath).

/*------------------------------------------------------------------------------------------------------*/

simulatePaths(_, Turns, BoardState, _):-
    getCurrentPlayer(Turns, Player),
    opponent(Player, Opponent),
    checkGameEnd(BoardState, Opponent),
    !,
    fail.

simulatePaths(Depth, Turns, BoardState, Play):-
    Depth > 0,
    getCurrentPlayer(Turns, Player),
    opponent(Player, Opponent),
    getIdealPath(BoardState, Player, PlayerPath),
    getIdealPath(BoardState, Opponent, OpponentPath),
    handlePaths(PlayerPath, OpponentPath, Path),
    subtractRandomIndex(Path, Play, AlternativePlays),
    !,
    simulateFollowingPaths(Depth, Turns, BoardState, [Play|AlternativePlays]).

/*------------------------------------------------------------------------------------------------------*/

simulateDoubleMove(_, Turns, BoardState, 0):-
    getCurrentPlayer(Turns, Player),
    checkGameEnd(BoardState, Player).

simulateDoubleMove(Depth, Turns, BoardState, 0):-
    simulatePaths(Depth, Turns, BoardState, _).

simulateDoubleMove(Depth, Turns, BoardState, _):-
    \+simulatePaths(Depth, Turns, BoardState, _).

/*Considering two turn plays*/ 
simulateFollowingPaths(Depth, [_,2], BoardState, [[Xcoord,Ycoord]|_]):-
    getCurrentPlayer([0,2], Player),
    executePlay(BoardState, Player, Xcoord, Ycoord, NewBoard, Cut),
    updateTurnState([0,2], Cut, NewTurns),
    DepthN is Depth - 1,
    /*Simulating the next move as the same player*/
    simulateDoubleMove(DepthN, NewTurns, NewBoard, Cut).

simulateFollowingPaths(Depth, [2,_], BoardState, [[Xcoord,Ycoord]|_]):-
    getCurrentPlayer([2,0], Player),
    executePlay(BoardState, Player, Xcoord, Ycoord, NewBoard, Cut),
    updateTurnState([2,0], Cut, NewTurns),
    DepthN is Depth - 1,
    /*Simulating the next move as the same player*/
    simulateDoubleMove(DepthN, NewTurns, NewBoard, Cut).

simulateFollowingPaths(0, _, _, _).

% Considering one turn plays
simulateFollowingPaths(Depth, Turns, BoardState, [[Xcoord,Ycoord]|_]):-
    Depth > 0,
    getCurrentPlayer(Turns, Player),
    executePlay(BoardState, Player, Xcoord, Ycoord, NewBoard, Cut),
    updateTurnState(Turns, Cut, NewTurns),
    DepthN is Depth - 1,
    /*Simulating the next move as the opposing player*/
    \+simulatePaths(DepthN, NewTurns, NewBoard, _).

simulateFollowingPaths(Depth, Turns, BoardState, [_|AlternativePlays]):-
    simulateFollowingPaths(Depth, Turns, BoardState, AlternativePlays).

/*------------------------------------------------------------------------------------------------------*/

getAIinput(-1, _, [BoardPieces,_], Input):-
    findAllEmpty(BoardPieces, PossiblePlays),
    subtractRandomIndex(PossiblePlays, Input, _).

getAIinput(Depth, Turns, BoardState, Input):-
    simulatePaths(Depth, Turns, BoardState, Input).

getAIinput(_, _, [BoardPieces,_], Input):-
    findAllEmpty(BoardPieces, PossiblePlays),
    subtractRandomIndex(PossiblePlays, Input, _).

/*------------------------------------------------------------------------------------------------------*/
