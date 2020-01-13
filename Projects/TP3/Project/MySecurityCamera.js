/**
 * MySecurityCamera
 * @constructor
 * @param scene - Reference to MyScene object
 * @param shader - Shader to be used with the object
 */
class MySecurityCamera extends CGFobject {
	constructor(scene, shader) {
		super(scene);

        this.shader = shader;
        
        this.rectangle = new MyRectangle( scene, 1, 0.5, 1, -1, -0.5);
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
    display(){
        this.scene.setActiveShader(this.shader);
        this.rectangle.display();
        this.scene.setActiveShader(this.scene.defaultShader);
    }
}

