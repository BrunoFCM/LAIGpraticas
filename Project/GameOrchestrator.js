/**
 * XMLscene class, representing the scene that is to be rendered.
 */
//TODO comments
class GameOrchestrator {
    /**
     * @constructor
     * @param {MyInterface} myinterface
     * @param {XMLScene} scene 
     */
    constructor(myinterface, scene) {
        this.interface = myinterface;
        this.scene = scene;
        this.scene.playerInputHandler = this.handlePlayerInput.bind(this);
        
        this.undoAllowed = false;
        
        this.playerStates = [0,1]; 
        this.playerStatesNames = {
            "Human": 0,
            "Random": -1,
            "Normal CPU": 1
        };

        this.timer = new GameTimer(10,this.timeOut.bind(this));
        this.pieceDispatcher = new PieceDispatcher(this.scene);
        this.logicClient = new PrologClient(this.connected.bind(this));

        this.resultsElement = document.getElementById("results");
        
        this.followingFunctionTimeout;
        this.auxiliaryTimeout;
    }

    stop(){
        this.timer.stopTimer();
        this.logicClient.cancelRequests();
        if(this.followingFunctionTimeout){
            clearTimeout(this.followingFunctionTimeout);
        }
        if(this.auxiliaryTimeout){
            clearTimeout(this.auxiliaryTimeout);
        }
    }

    connected(){
        console.log("Connected");
        this.startGame();
    }

    changePlayer1State(v){
        this.playerStates[0] = v;
    }
    
    changePlayer2State(v){
        this.playerStates[1] = v;
    }

    startGame(){
        this.movie.stop();
        this.resultsElement.innerText = "";
        this.sequence = [];
        this.gameState = {
                            BoardState: { 
                                        Pieces: [   
                                                    [0,0,0,0,0,0,0,0],
                                                    [0,0,0,0,0,0,0,0],
                                                    [0,0,0,0,0,0,0,0],
                                                    [0,0,0,0,0,0,0,0],
                                                    [0,0,0,0,0,0,0,0],
                                                    [0,0,0,0,0,0,0,0],
                                                    [0,0,0,0,0,0,0,0],
                                                    [0,0,0,0,0,0,0,0]
                                                ],

                                        Connections:[   
                                                        [0,0,0,0,0,0,0],
                                                        [0,0,0,0,0,0,0],
                                                        [0,0,0,0,0,0,0],
                                                        [0,0,0,0,0,0,0],
                                                        [0,0,0,0,0,0,0],
                                                        [0,0,0,0,0,0,0],
                                                        [0,0,0,0,0,0,0]
                                                    ]
                                        },
                            Turns: [1,0],
                            CurrentPlayer: 1
                            };
        this.scene.reset();

        this.prepareTurn();
    }

    prepareTurn(){
        this.undoAllowed = true;

        if(this.gameState.Turns[0] == 0){
            this.gameState.CurrentPlayer = 2;
        }
        else{
            this.gameState.CurrentPlayer = 1;
        }

        if(this.scene.unhandledPieces.length == 0){
            this.scene.rotateCamera(this.gameState.CurrentPlayer);

            let playerIndex = this.gameState.CurrentPlayer - 1;
            let numberOfPieces = this.gameState.Turns[playerIndex];
            let pieces = this.pieceDispatcher.dispatchPieces(this.gameState.CurrentPlayer, numberOfPieces);
            this.scene.unhandledPieces.push(...pieces);
        }
        
        this.followingFunctionTimeout = setTimeout(this.doPlayerTurn.bind(this), 1000);
    }

    doPlayerTurn(){
        let playerIndex = this.gameState.CurrentPlayer - 1;
        if(this.playerStates[playerIndex] == 0){
            this.scene.inputAllowed = true;
            this.timer.startTimer();
        }
        else{
            this.logicClient.executeAIPlay(this.gameState.BoardState, this.playerStates[playerIndex], this.gameState.Turns, this.handleStateUpdate.bind(this));
        }
    }

    handlePlayerInput(objectId){
        let x = (objectId - 1) % 8; 
        let y = Math.floor((objectId - 1) / 8);
        if(this.gameState.BoardState.Pieces[y][x] != 0){ //Zone already occupied
            return;
        }

        this.timer.stopTimer();
        this.scene.inputAllowed = false;
        let Move = [x + 1, y + 1];
        this.logicClient.executePlay(this.gameState.BoardState, Move, this.gameState.Turns, this.handleStateUpdate.bind(this));
    }

    checkResponse(response){
        if(response == "Syntax Error"){
            console.log("Syntax error found in the request, the game will become unresponsive from now on");
            return false;
        }
        if(response == "Bad Request"){
            console.log("Bad Request");
            return false;
        }
        return true;
    }

    getDifferences(arrayA, arrayB){
        let out = [];
        
        if(arrayA.length != arrayB.length) return false;

        for(let i = 0; i < arrayA.length; ++i){
            if(arrayA[i].length != arrayB[i].length) return false;

            for(let j = 0; j < arrayA[i].length; ++j){
                if(arrayA[i][j] != arrayB[i][j]) out.push([j,i]);
            }
        }

        return out.length ? out : false;
    }

    handleStateUpdate(data){
        this.undoAllowed = false;

        if(!this.checkResponse(data.target.response)){
            return;
        }

        if(data.target.response != "Invalid"){
            let responseObject = JSON.parse(data.target.response);

            let pieceCoordinates = this.getDifferences(this.gameState.BoardState.Pieces, responseObject[0]);
            let pieceLocation = [3.5 - pieceCoordinates[0][1], 1, pieceCoordinates[0][0] - 3.5];
            let piece = this.scene.getUnhandledPiece();  
            if(piece == undefined) return;          
            this.pieceDispatcher.movePiece(piece, pieceLocation);

            let connectionsCoordinates = this.getDifferences(this.gameState.BoardState.Connections, responseObject[1]);
            let connectionLocations = [];
            for(let i = 0; i < connectionsCoordinates.length; ++i){
                let location = [];
                location[0] = 3 - connectionsCoordinates[i][1];
                
                location[1] = 0;
                
                location[2] = connectionsCoordinates[i][0] - 3;

                connectionLocations.push(location);
            }
            let connections = this.pieceDispatcher.dispatchConnections(this.gameState.CurrentPlayer, connectionLocations);
            this.scene.connections.push(...connections.added);

            let added = connections.added;
            added.push(piece);
            let move = {added: added,
                        changed: connections.changed,
                        previousState: JSON.parse(JSON.stringify(this.gameState))};
            this.sequence.push(move);

            let playerIndex = this.gameState.CurrentPlayer - 1;
            if(responseObject[2][playerIndex] == 0){
                this.pieceDispatcher.removePieces(this.scene.unhandledPieces);
                this.auxiliaryTimeout = setTimeout(function(){this.scene.unhandledPieces = [];}.bind(this), 1000);
            }

            this.gameState.BoardState.Pieces = responseObject[0];
            this.gameState.BoardState.Connections = responseObject[1];
            this.gameState.Turns = responseObject[2];
            
            this.logicClient.checkPlayerVictory(this.gameState.CurrentPlayer, this.gameState.BoardState, this.checkEndGame.bind(this));
        }
        else{
            console.log("Invalid move");
            this.prepareTurn();
        }
    }

    checkEndGame(data){
        if(data.target.response == 0){
            setTimeout(this.prepareTurn.bind(this), 1000);
        }
        else{
            this.gameOver(this.gameState.CurrentPlayer);
        }
    }

    timeOut(){
        this.scene.inputAllowed = false;
        this.undoAllowed = false;
        if(this.gameState.Turns[0] == 0){
            this.gameOver(1);
        }
        else{
            this.gameOver(2);
        }
    }

    gameOver(Winner){
        this.resultsElement.innerText = "Player " + Winner + " won!";
    }

    undo(){
        if(this.undoAllowed){
            let lastMove = this.sequence.pop();
            console.log(lastMove);
            if(lastMove){
                this.timer.stopTimer();
                this.logicClient.cancelRequests();
                this.scene.unhandledPieces.length = 0;
                this.scene.removeObjects(lastMove.added);
                this.pieceDispatcher.revertConnections(lastMove.changed);
                this.gameState = lastMove.previousState;
        
                this.prepareTurn();
            }
        }
    }
}