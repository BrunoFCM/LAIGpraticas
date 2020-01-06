/**
 * Cylinder
 * @constructor
 * @param scene - Reference to MyScene object
 * @param base - Radius of the base lid
 * @param top - Radius of the top lid
 * @param height - Height of the cylinder
 * @param slices - Number of slices in the cylinder
 * @param stacks - Number of stacks in the cylinder
 */
class MyBoardObject extends CGFobject {

	constructor(scene, type, baseObject, basePosition, material, texture, baseAnimation, shader) {
        super(scene);
        this.type = type;
        this.baseObject = baseObject;
        this.basePosition = basePosition;
        this.material = material;
        this.texture = texture;

        this.baseAnimation = false || baseAnimation;
        this.shaderObject = false || shader;
	}
//TODO comments

    update(t){
    	if(this.baseAnimation){
        	this.baseAnimation.update(t / 1000);
        }
        if(this.shaderObject){
            this.shaderObject.update(t / 1000);
        }
    }
    
    display(){
        this.material.setTexture(this.texture);
        this.material.apply();
        
        if(this.shaderObject){
            this.shaderObject.apply();
        }

        this.scene.pushMatrix();

        this.scene.translate(this.basePosition[0],this.basePosition[1],this.basePosition[2]);
        if(this.baseAnimation){
            this.baseAnimation.apply();
        }
        this.scene.rotate(-Math.PI / 2, 1,0,0);
        this.baseObject.display();
        this.scene.popMatrix();

        this.scene.setActiveShader(this.scene.defaultShader);
        
    }
}


