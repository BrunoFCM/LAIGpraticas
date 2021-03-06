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
class MyBoard extends CGFobject {

	constructor(scene, baseObject, baseTransformation, pickingShader) {
		super(scene);
        this.baseObject = baseObject;
        this.baseTransformation = baseTransformation;
        this.pickingShader = pickingShader;
		this.initPickingObjects();
	};
//TODO comments
	/**
	 * @method initBuffers
	 * 
	 */
	initPickingObjects() {
        this.pickingObjects = [];
        for(let i = 0; i < 64; ++i){
            this.pickingObjects.push(new MyRectangle(this.scene, i + 1, -0.5, 0.5, -0.5, 0.5));
        }
    }
    
    display(){
        this.baseObject.display();
        
        if(this.scene.inputEnabled){
            this.scene.pushMatrix();
            
            for(let transform = 0; transform < this.baseTransformation.length; ++transform){
                this.scene.multMatrix(this.baseTransformation[transform]);
            }

			this.pickingShader.apply();

            for(let i = 0; i < 64; ++i){
                this.scene.pushMatrix();
                this.scene.translate(-Math.floor(i / 8) + 3.5, -(i % 8) + 3.5, 0);

                this.scene.registerForPick(i + 1, this.pickingObjects[i]);
                this.pickingObjects[i].display();

                this.scene.popMatrix();
            }

            this.scene.setActiveShader(this.scene.defaultShader);

            this.scene.popMatrix();
        }
    }
}


