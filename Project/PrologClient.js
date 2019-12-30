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

    getPrologRequest(requestString, onSuccess, onError, port)
    {
        var requestPort = port || 8081
        var request = new XMLHttpRequest();
        request.open('GET', 'http://localhost:'+requestPort+'/'+requestString, true);

        request.onload = onSuccess || function(data){console.log("Request successful. Reply: " + data.target.response);};
        request.onerror = onError || function(){console.log("Error waiting for response");};

        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.send();
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
