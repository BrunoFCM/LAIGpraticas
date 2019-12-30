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
        
        this.baseState = 'Connecting';
        
        this.playerStates = [0,1]; //0 is human, -1 is random AI, anything above 0 is a "better" AI (keep it under 5, for your cpu's sake)

        this.timer = new GameTimer(60,this.timeOut.bind(this));
        this.logicClient = new PrologClient(this.connected.bind(this));
    }

    connected(){
        console.log("Connected");
        this.startGame();
    }

    startGame(){
        this.baseState = 'Game';
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
        this.doPlayerTurn();
    }

    doPlayerTurn(){
        if(this.gameState.Turns[0] == 0){
            this.gameState.CurrentPlayer = 2;
        }
        else{
            this.gameState.CurrentPlayer = 1;
        }

        let playerIndex = this.gameState.CurrentPlayer - 1;
        if(this.playerStates[playerIndex] == 0){
            this.scene.inputAllowed = true;
            this.baseState = "WaitingForInput";
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
        this.baseState = "WaitingForResponse";
        let Move = [x + 1, y + 1];
        this.logicClient.executePlay(this.gameState.BoardState, Move, this.gameState.Turns, this.handleStateUpdate.bind(this));
    }

    checkResponse(response){
        console.log(response);
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

    handleStateUpdate(data){
        if(!this.checkResponse(data.target.response)){
            return;
        }

        if(data.target.response != "Invalid"){
            let responseObject = JSON.parse(data.target.response);
            this.gameState.BoardState.Pieces = responseObject[0];
            this.gameState.BoardState.Connections = responseObject[1];
            this.gameState.Turns = responseObject[2];
            
            console.log(this.gameState);
            
            this.logicClient.checkPlayerVictory(this.gameState.CurrentPlayer, this.gameState.BoardState, this.checkEndGame.bind(this));
        }
        else{
            console.log("Invalid move");
            this.doPlayerTurn();
        }
    }

    checkEndGame(data){
        if(data.target.response == 0){
            this.doPlayerTurn();
        }
        else{
            this.gameOver(this.gameState.CurrentPlayer);
        }
    }

    timeOut(){
        this.baseState = 'End';
        this.scene.inputAllowed = false;
        if(this.gameState.Turns[0] == 0){
            gameOver(0);
        }
        else{
            gameOver(1);
        }
    }

    gameOver(Winner){
        console.log(Winner, " won");
    }
}