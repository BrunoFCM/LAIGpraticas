/**
 * XMLscene class, representing the scene that is to be rendered.
 */
//TODO comments
class PrologClient {
    /**
     * @constructor
     * @param {MyInterface} myinterface
     * @param {XMLScene} scene 
     */
    constructor(connected) {
        this.connected = connected;
        this.connect();
        this.currentRequest;
    }

    connect(){
        this.getPrologRequest("handshake", this.success.bind(this));
    }

    success(data){
        if(data.target.response == 'handshake'){
            this.connected();
        }
        else{
            console.log("Error found while starting connection: " + data.target.response);
        }
    }

    cancelRequests(){
        this.currentRequest.onload = function(){console.log("Received a cancelled request response");};
        this.currentRequest.onerror = function(){console.log("Received a cancelled request response");};
    }

    getPrologRequest(requestString, onSuccess, onError, port)
    {
        let requestPort = port || 8081
        this.currentRequest = new XMLHttpRequest();
        this.currentRequest.open('GET', 'http://localhost:'+requestPort+'/'+requestString, true);

        this.currentRequest.onload = onSuccess || function(data){console.log("Request successful. Reply: " + data.target.response);};
        this.currentRequest.onerror = onError || function(){console.log("Error waiting for response");};

        this.currentRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        this.currentRequest.send();
    }

    checkPlayerVictory(Player, BoardState, callback){
        let requestString = "checkGameEnd(" + 
                            JSON.stringify(BoardState.Pieces) + "," + 
                            JSON.stringify(BoardState.Connections) + "," + 
                            Player + ")";

        this.getPrologRequest(requestString, callback);
    }

    executePlay(BoardState, Move, Turns, callback){
        let requestString = "executePlay(" +
                            JSON.stringify(BoardState.Pieces) + "," +
                            JSON.stringify(BoardState.Connections) + "," +
                            Move[0] + "," + Move[1] + "," + 
                            JSON.stringify(Turns) + ")";
        
        this.getPrologRequest(requestString, callback);
    }

    executeAIPlay(BoardState, Depth, Turns, callback){
        let requestString = "doAImove(" + Depth + "," +
                            JSON.stringify(BoardState.Pieces) + "," +
                            JSON.stringify(BoardState.Connections) + "," +
                            JSON.stringify(Turns) + ")";
        
        this.getPrologRequest(requestString, callback);
    }
}
