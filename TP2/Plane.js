/**
 * Plane
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
class Plane extends CGFobject {
	constructor(scene, udivs, vdivs) {
		super(scene);

        this.udivs = udivs;
        this.vdivs = vdivs;

		this.initBuffers();
	}
	
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
    
    display(){
        this.object.display();
    }
}

