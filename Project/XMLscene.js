var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;

        this.selectedView = 0;
        this.viewList = {};

        this.startingInstant = 0;
        this.currentTime = 0;

        this.inputAllowed = false;
        this.inputEnabled = false;

        this.setPieces = [];
        this.unhandledPieces = [];
        this.connections = [];
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.initCameras();

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(1000/60);

        this.initRTTCamera();
		this.setPickEnabled(true);
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
        this.rttCamera = this.camera;
    }
    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        var i = 0;
        // Lights index.

        // Reads the lights from the scene graph.
        for (var key in this.graph.lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.graph.lights.hasOwnProperty(key)) {
                var light = this.graph.lights[key];

                this.lights[i].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
                this.lights[i].setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
                this.lights[i].setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
                this.lights[i].setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);

                if (light[1] == "spot") {
                    this.lights[i].setSpotCutOff(light[6]);
                    this.lights[i].setSpotExponent(light[7]);
                    this.lights[i].setSpotDirection(light[8][0], light[8][1], light[8][2]);
                }

                //Apply light attenuation
                if(light[9] == "constant"){
                    this.lights[i].setConstantAttenuation(1);
                    this.lights[i].setLinearAttenuation(0);
                    this.lights[i].setQuadraticAttenuation(0);
                }
                if(light[9] == "linear"){
                    this.lights[i].setConstantAttenuation(0);
                    this.lights[i].setLinearAttenuation(1);
                    this.lights[i].setQuadraticAttenuation(0);
                }
                if(light[9] == "quadratic"){
                    this.lights[i].setConstantAttenuation(0);
                    this.lights[i].setLinearAttenuation(0);
                    this.lights[i].setQuadraticAttenuation(1);
                }

                this.lights[i].setVisible(false);
                if (light[0])
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                this.lights[i].update();

                i++;
            }
        }
    }

    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }
    /** Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

        this.setGlobalAmbientLight(this.graph.globals[0], this.graph.globals[1], this.graph.globals[2], this.graph.globals[3]);

        this.initLights();

        this.sceneInited = true;

        this.camera = this.graph.views[0];

        this.interface.updateGUI();          
    }

    /**
     * Changes the current camera
     * @param value - Index of the new view 
     */
    onSelectedViewChanged(value){
        this.camera = this.graph.views[value];
    }

    /**
     * Checks if the M key was pressed and, if it was, changes de material indexes of every valid object
     */
    checkKeys() {
        // Check for key codes e.g. in https://keycode.info/
        if (this.gui.isKeyPressed("KeyM")) {
            this.graph.changeMaterialIndex();
        }
    }

    /**
     * Checks for pressed keys and updates animations' and the security camera's time values
     * @param t - Time value 
     */
    update(t){
        this.checkKeys();

        if(this.startingInstant == 0){
            this.startingInstant = t;
        }

        this.currentTime = t - this.startingInstant;

        this.graph.updateAnimations(this.currentTime);
        this.securityCamera.update(this.currentTime);
        
        let objects = this.setPieces;
        for(let i = 0; i < objects.length; ++i){
            objects[i].update(this.currentTime);
        }
        
        objects = this.connections;
        for(let i = 0; i < objects.length; ++i){
            objects[i].update(this.currentTime);
        }
        
        objects = this.unhandledPieces;
        for(let i = 0; i < objects.length; ++i){
            objects[i].update(this.currentTime);
        }
    }

    /**
     * Inits the rtt Camera
     */
    initRTTCamera(){
        this.rttTexture = new CGFtextureRTT(this, window.innerWidth, window.innerHeight);

        this.RTTShader = new CGFshader(this.gl, "scenes/shaders/vertexShader.vert", "scenes/shaders/fullTransparency.frag");
        this.RTTShader.setUniformsValues({ uSampler: 0 });

        this.securityCamera = new MySecurityCamera(this, this.RTTShader);
    }
    
	logPicking() {
		if (this.pickMode == false) {
			if (this.pickResults != null && this.pickResults.length > 0) {
				for (var i = 0; i < this.pickResults.length; i++) {
					var obj = this.pickResults[i][0];
					if (obj) {
						var customId = this.pickResults[i][1];
                        console.log("Picked object: " + obj + ", with pick id " + customId);
                        if(customId <= 64 && customId >= 1){
                            this.playerInputHandler(customId);						
                        }
					}
				}
				this.pickResults.splice(0, this.pickResults.length);
			}
		}
    }

    getUnhandledPiece(){
        let piece = this.unhandledPieces.shift();
        this.setPieces.push(piece);
        return piece;
    }

    getConnectionAt(x,y,z){
        for(let i = 0; i < this.connections; ++i){
            let position = this.connections[i];
            if(position[0] == x && position[1] == y && position[2] == z){
                return this.connections[i];
            }
        }

        return false;
    }

    /**
     * Displays the scene
     */
    display(){
        if(this.inputEnabled){
            this.inputEnabled = false;
        }
		this.logPicking();
        this.clearPickRegistration();
        
        let tempCamera = this.camera;

        this.rttTexture.attachToFrameBuffer();
        this.render(this.rttCamera);
     
        this.interface.setActiveCamera(tempCamera);
        this.rttTexture.detachFromFrameBuffer();

        if(this.inputAllowed){
            this.inputEnabled = true;
        }
        this.render(tempCamera);

        this.gl.disable(this.gl.DEPTH_TEST);
        this.rttTexture.bind(0);
        this.securityCamera.display();
        this.rttTexture.unbind(0);
        this.gl.enable(this.gl.DEPTH_TEST);
    }

    //TODO comments
    renderBoardObjects(){
        this.pushMatrix();
        //TODO base transformation

        let objects = this.setPieces;
        for(let i = 0; i < objects.length; ++i){
            objects[i].display();
        }
        
        objects = this.connections;
        for(let i = 0; i < objects.length; ++i){
            objects[i].display();
        }
        
        objects = this.unhandledPieces;
        for(let i = 0; i < objects.length; ++i){
            objects[i].display();
        }

        this.popMatrix();
    }

    /**
     * Renders the scene.
     */
    render(camera) {
        this.camera = camera;
        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        let i = 0;
        for (var key in this.graph.lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.graph.lights.hasOwnProperty(key)) {
                let light = this.graph.lights[key];
                if (light[0])
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                this.lights[i].update();

                i++;
            }
        }

        this.pushMatrix();
        this.axis.display();

        if (this.sceneInited) {
            // Draw axis
            this.setDefaultAppearance();

            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();

            this.renderBoardObjects();
        }



        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}