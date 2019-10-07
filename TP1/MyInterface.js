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
     * initKeys
     */
    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    processKeyDown(event) {
        this.activeKeys[event.code]=true;
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }

    updateGUI() {
        //adding controls dependent on contents read from the xml scene 
        this.gui.add(this.scene, 'selectedView', this.scene.viewList).onChange(this.scene.onSelectedViewChanged.bind(this.scene)).name('View'); //controller 0

        let lightIndex = 0;
        for(let key in this.scene.graph.lights){
            this.gui.add(this.scene.graph.lights[key], '0').onChange(this.scene.updateLights.bind(this.scene)).name(key); //controller for a light
            ++lightIndex;
        }
    }
}