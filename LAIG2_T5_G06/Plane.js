/**
 * Plane
 * @constructor
 * @param scene - Reference to MyScene object
 * @param udivs - Number of divisions of the plane in the u axis
 * @param vdivs - Number of divisions of the plane in the v axis
 */
class Plane extends CGFobject {
	constructor(scene, udivs, vdivs) {
		super(scene);

        this.udivs = udivs;
        this.vdivs = vdivs;

		this.initBuffers();
	}
	
	/**
	 * @method initBuffers
	 * Initializes the surface with the correct control points and creates the corresponding nurbsObject
	 */
	initBuffers() {
        this.controlPoints = [
			[
                [-0.5, 0,  0.5, 1],	//0
                [-0.5, 0, -0.5, 1]	    //1
            ],
            [
                [0.5, 0, 0.5, 1],      //2
                [0.5, 0, -0.5, 1]      //3
            ]
		];

        this.surface = new CGFnurbsSurface(1,1,this.controlPoints);

        this.object = new CGFnurbsObject(this.scene, this.udivs, this.vdivs, this.surface);
    }
    
    /**
	 * @method display
	 * Displays the Plane in the scene
	 */
    display(){
        this.object.display();
    }
}

