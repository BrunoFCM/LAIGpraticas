/**
 * XMLscene class, representing the scene that is to be rendered.
 */
//TODO comments
class MovieOrchestrator {
    /**
     * @constructor
     * @param {MyInterface} myinterface
     * @param {XMLScene} scene 
     */
    constructor(Game, scene) {
        this.scene = scene;
        this.game = Game;

        this.pieceDispatcher = new PieceDispatcher(this.scene);

        this.followingFunctionTimeout;
        this.auxiliaryTimeout;
    }

    stop(){
        if(this.followingFunctionTimeout){
            clearTimeout(this.followingFunctionTimeout);
        }
        if(this.auxiliaryTimeout){
            clearTimeout(this.auxiliaryTimeout);
        }
    }

    startMovie(){
        this.game.stop();
        this.Sequence = this.game.sequence;

        this.game.resultsElement.innerText = "";

        this.scene.reset();

        this.index = 0;
        this.prepareTurn();
    }

    prepareTurn(){
        let previousState = this.Sequence[this.index].previousState;
        if(previousState.Turns[0] == 0){
            previousState.CurrentPlayer = 2;
        }
        else{
            previousState.CurrentPlayer = 1;
        }

        if(this.scene.unhandledPieces.length == 0){
            this.scene.rotateCamera(previousState.CurrentPlayer);

            let playerIndex = previousState.CurrentPlayer - 1;
            let numberOfPieces = previousState.Turns[playerIndex];
            let pieces = this.pieceDispatcher.dispatchPieces(previousState.CurrentPlayer, numberOfPieces);
            this.scene.unhandledPieces.push(...pieces);
        }
        
        this.followingFunctionTimeout = setTimeout(this.handleStateUpdate.bind(this), 1000);
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

    handleStateUpdate(){
        let responseObject = this.Sequence[this.index + 1].previousState;
        let previousState = this.Sequence[this.index].previousState;

        let pieceCoordinates = this.getDifferences(previousState.BoardState.Pieces, responseObject.BoardState.Pieces);
        let pieceLocation = [3.5 - pieceCoordinates[0][1], 1, pieceCoordinates[0][0] - 3.5];
        let piece = this.scene.getUnhandledPiece();  
        if(piece == undefined) return;          
        this.pieceDispatcher.movePiece(piece, pieceLocation);

        let connectionsCoordinates = this.getDifferences(previousState.BoardState.Connections, responseObject.BoardState.Connections);
        let connectionLocations = [];
        for(let i = 0; i < connectionsCoordinates.length; ++i){
            let location = [];
            location[0] = 3 - connectionsCoordinates[i][1];
            
            location[1] = 0;
            
            location[2] = connectionsCoordinates[i][0] - 3;

            connectionLocations.push(location);
        }
        let connections = this.pieceDispatcher.dispatchConnections(previousState.CurrentPlayer, connectionLocations);
        this.scene.connections.push(...connections.added);

        let playerIndex = previousState.CurrentPlayer - 1;
        if(responseObject.Turns[playerIndex] == 0){
            this.pieceDispatcher.removePieces(this.scene.unhandledPieces);
            this.auxiliaryTimeout = setTimeout(function(){this.scene.unhandledPieces = [];}.bind(this), 1000);
        }    

        this.index++;
        if(this.index + 1 == this.Sequence.length){
            return
        }
        else{
            this.followingFunctionTimeout = setTimeout(this.prepareTurn.bind(this), 1000);
        }
    }
}