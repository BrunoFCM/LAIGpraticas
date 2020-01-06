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

        this.DOMelement = document.getElementById("Timer");
    }

    startTimer(){
        this.currentTime = this.timeLimit;
        this.interval = setInterval(this.decreaseTimer.bind(this), 1000);
    }

    decreaseTimer(){
        this.currentTime -= 1;
        this.DOMelement.innerText = "" + this.currentTime;
        if(this.currentTime == 0){
            clearInterval(this.interval);
            this.timeOut();
        }
    }

    stopTimer(){
        this.DOMelement.innerText = "";
        clearInterval(this.interval);
    }
}