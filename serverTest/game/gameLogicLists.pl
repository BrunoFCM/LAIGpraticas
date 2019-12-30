:-use_module(library(random)).

/*------------------------------------------------------------------------------------------------------*/

makePointList([], _, []).
makePointList(_, [], []).

makePointList([X|XList], Y, List):-
    makePointList(XList, Y, Points),
    append([[X,Y]], Points, List).

makePointList(X, [Y|YList], List):-
    makePointList(X, YList, Points),
    append([[X,Y]], Points, List).

/*------------------------------------------------------------------------------------------------------*/

subtractRandomIndex(List, Value, NewList):-
    length(List, Length),
    UpperBound is Length + 1,
    random(1, UpperBound, Index),
    subtractIndex(List, Index, Value, NewList).

subtractIndex([Value|List], 1, Value, List).

subtractIndex([Element|List], Index, Value, [Element|NewList]):-
    IndexN is Index - 1,
    subtractIndex(List, IndexN, Value, NewList).

/*------------------------------------------------------------------------------------------------------*/

intersectUnit(_,[],[]).

intersectUnit(Element, [Element|_], [Element]).

intersectUnit(ElementA, [_|ListB], List):-
    intersectUnit(ElementA, ListB, List).

intersect([],_,[]).

intersect([ElementA|ListA], ListB, List):-
    intersectUnit(ElementA, ListB, List1),
    intersect(ListA, ListB, List2),
    append(List1, List2, List).

/*------------------------------------------------------------------------------------------------------*/

listOfSize(_, 0, []).

listOfSize(Element, Size, [Element|List]):-
    SizeN is Size - 1,
    listOfSize(Element, SizeN, List).

/*------------------------------------------------------------------------------------------------------*/

pointListLength([],0).

pointListLength([_|List], Length):-
    pointListLength(List, LengthReturned),
    Length is LengthReturned + 1.