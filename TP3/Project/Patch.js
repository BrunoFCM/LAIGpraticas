    /**
 * Patch
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
class Patch extends CGFobject {
	constructor(scene, uPoints, vPoints, uParts, vParts, controlPoints) {
		super(scene);

        this.uPoints = uPoints;
        this.vPoints = vPoints;
        this.uParts = uParts;
        this.vParts = vParts;
        this.controlPoints = controlPoints;

		this.initBuffers();
	}
	
	/**
	 * @method initBuffers
	 * Initializes the surface with the correct control points and creates the corresponding nurbsObject
	 */
	initBuffers() {
        this.surface = new CGFnurbsSurface(this.uPoints - 1,this.vPoints - 1,this.controlPoints);

        this.object = new CGFnurbsObject(this.scene, this.uParts, this.vParts, this.surface);
    }
    
    /**
	 * @method display
	 * Displays the Patch in the scene
	 */
    display(){
        this.object.display();
    }
}

