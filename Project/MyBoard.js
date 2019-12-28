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

        this.scene.pushMatrix();
        this.scene.multMatrix(this.baseTransformation);

        for(let i = 0; i < 64; ++i){
            this.scene.pushMatrix();
            this.scene.translate(-(i % 8) + 3.5, Math.floor(i / 8) - 3.5, 0);

            this.scene.registerForPick(i + 1, this.pickingObjects[i]);
            this.pickingObjects[i].display();

            this.scene.popMatrix();
        }
        this.scene.popMatrix();
    }
}


