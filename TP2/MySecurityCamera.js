/**
 * MyRectangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
class MySecurityCamera extends CGFobject {
	constructor(scene, shader) {
		super(scene);

        this.shader = shader;
        
        this.rectangle = new MyRectangle( scene, 1, 0.5, 1, -1, -0.5);
    }

    update(t){
        this.shader.setUniformsValues({ timeFactor: t});
    }
    
    display(){
        this.scene.setActiveShader(this.shader);
        this.rectangle.display();
        this.scene.setActiveShader(this.scene.defaultShader);
    }
}

