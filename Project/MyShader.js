/**
 * MySecurityCamera
 * @constructor
 * @param scene - Reference to MyScene object
 * @param shader - Shader to be used with the object
 */
//TODO comments
class MyShader {
	constructor(scene, shaderAttributes, startingInstant, duration) {
        this.scene = scene;

        this.shader = new CGFshader(this.scene.gl, "scenes/shaders/"+shaderAttributes.vert, "scenes/shaders/"+shaderAttributes.frag);
        this.textures = shaderAttributes.textures;

        this.startingInstant = 0 || startingInstant;
        this.duration = duration;
        this.shader.setUniformsValues({ startingInstant: this.startingInstant,
                                        duration: this.duration});
        
        let texturesNumber = 0;
        for(let key in this.textures){
            texturesNumber++;
        }
        if(texturesNumber >= 1){
            this.shader.setUniformsValues({ uSampler2: 1});
        }
        if(texturesNumber == 2){
            this.shader.setUniformsValues({ uSampler3: 2});
        }
    }

	/**
	 * @method update
	 * Updates the shader's timeFactor value to the current time value
     * @param t - Current time value
	 */
    update(t){
        this.shader.setUniformsValues({ timeFactor: t});
    }
    
    /**
     * @method display
     * Displays the security in the scene
     */
    apply(){
        for(let key in this.textures){
            this.textures[key].bind(key);
        }
        this.scene.setActiveShader(this.shader);
    }
}

