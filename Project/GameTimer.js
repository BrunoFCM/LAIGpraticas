/**
 * XMLscene class, representing the scene that is to be rendered.
 */
//TODO comments
class GameTimer {
    /**
     * @constructor
     * @param {MyInterface} myinterface
     * @param {XMLScene} scene 
     */
    constructor(timeLimit, timeOut) {
        this.timeLimit = timeLimit;
        this.interval;
        this.timeOut = timeOut;
        this.currentTime = timeLimit;
    }

    startTimer(){
        this.currentTime = this.timeLimit;
        this.interval = setInterval(this.decreaseTimer, 1000);
    }

    decreaseTimer(){
        this.currentTime -= 1;
        if(this.currentTime == 0){
            this.timeOut();
        }
    }

    stopTimer(){
        clearInterval(this.interval);
    }
}