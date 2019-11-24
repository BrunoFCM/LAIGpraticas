/**
* MyInterface class, creating a GUI interface.
*/
class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        // add a group of controls (and open/expand by default)

        this.initKeys();

        return true;
    }

    /**
     * @method initKeys
     */
    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    /**
     * @method processKeyDown
     * Processes KyeDown events
     * @param event - KeyDown event
     */
    processKeyDown(event) {
        this.activeKeys[event.code]=true;
    };

    /**
     * @method processKeyUp
     * Processes KyeUp events
     * @param event - KeyUp event
     */
    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };
    
    /**
     * @method isKeyPressed
     * Check for the pressed state of a specific key
     * @param keyCode - KeyCode of the key to be checked
     */
    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }

    
    /**
     * @method updateGUI
     * Updates dat.gui controllers
     */
    updateGUI() {
        //adding controls dependent on contents read from the xml scene 
        this.gui.add(this.scene, 'selectedView', this.scene.viewList).onChange(this.scene.onSelectedViewChanged.bind(this.scene)).name('View'); //controller 0

        let lightIndex = 0;
        //Add a controller for every light
        for(let key in this.scene.graph.lights){
            this.gui.add(this.scene.graph.lights[key], '0').name(key); 
            ++lightIndex;
        }
    }
}